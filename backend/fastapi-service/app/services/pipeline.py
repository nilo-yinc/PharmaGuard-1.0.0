from datetime import datetime, timezone
from app.services.parser import parse_variants
from app.services.drug_gene_map import get_primary_gene
from app.services.phenotype_engine import get_phenotype
from app.services.cpic_rules import get_cpic_recommendation
from app.services.confidence import get_confidence_score
from app.services.llm_service import generate_explanation


def run_analysis(request):
    parsed_variants = parse_variants(request)
    results = []
    missing_genes = []

    for drug in request.drugs:
        primary_gene = get_primary_gene(drug)

        target_variant = next(
            (v for v in parsed_variants if v["gene"] == primary_gene),
            None
        )

        if not target_variant:
            missing_genes.append(primary_gene)
            target_variant = {
                "gene": primary_gene,
                "diplotype": "*1/*1",
                "rsid": None,
            }

        diplotype = target_variant["diplotype"]
        phenotype = get_phenotype(primary_gene, diplotype)

        # ✅ Step 11: always assign cpic inside loop
        cpic = get_cpic_recommendation(primary_gene, phenotype, drug)

        # ✅ Safe confidence scoring
        confidence = get_confidence_score(cpic.get("evidence", "C"))

        explanation = generate_explanation(
            primary_gene, phenotype, drug, cpic["risk_label"]
        )

        results.append({
            "drug": drug,
            "risk_assessment": {
                "risk_label": cpic["risk_label"],
                "confidence_score": confidence,
                "severity": cpic["severity"]
            },
            "pharmacogenomic_profile": {
                "primary_gene": primary_gene,
                "diplotype": diplotype,
                "phenotype": phenotype,
                "detected_variants": (
                    [{"rsid": target_variant["rsid"]}] if target_variant.get("rsid") else []
                ),
            },
            "clinical_recommendation": {
                "action": cpic["action"],
                "details": cpic["details"]
            },
            "llm_generated_explanation": explanation
        })

    return {
        "patient_id": request.patient_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "results": results,
        "quality_metrics": {
            "vcf_parsing_success": True,
            "parsed_variant_count": len(parsed_variants),
            "missing_gene_fallback_count": len(missing_genes),
        },
    }
