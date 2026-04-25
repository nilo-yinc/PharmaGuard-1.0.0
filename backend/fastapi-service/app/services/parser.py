from fastapi import HTTPException

SUPPORTED_GENES = {"CYP2D6","CYP2C19","CYP2C9","SLCO1B1","TPMT","DPYD"}

RSID_GENE_MAP = {
    "rs4244285": ("CYP2C19", "*2"),
    "rs4149056": ("SLCO1B1", "*5"),
    "rs1057910": ("CYP2C9", "*3"),
    "rs3892097": ("CYP2D6", "*4"),
    "rs1142345": ("TPMT", "*3A"),
    "rs3918290": ("DPYD", "*2A"),
}

def normalize_gene(gene: str) -> str:
    return gene.upper()

def normalize_star(star: str | None) -> str | None:
    if not star:
        return None
    star = star.strip()
    if not star:
        return None
    if not star.startswith("*"):
        star = f"*{star}"
    return star.upper()

def validate_gene(gene: str):
    if gene not in SUPPORTED_GENES:
        raise HTTPException(status_code=400, detail=f"Unsupported gene: {gene}")

def parse_variant(variant):
    if hasattr(variant, "gene"):
        gene = normalize_gene(variant.gene)
        diplotype = variant.diplotype
        rsid = getattr(variant, "rsid", None)
    else:
        gene = normalize_gene(variant["gene"])
        diplotype = variant["diplotype"]
        rsid = variant.get("rsid")

    validate_gene(gene)

    return {
        "gene": gene,
        "diplotype": diplotype,
        "rsid": rsid
    }

def parse_variants(request):
    if getattr(request, "variants", None):
        return [parse_variant(v) for v in request.variants]

    if getattr(request, "vcf_content", None):
        gene_records = {}

        def parse_info(info_field: str) -> dict:
            info = {}
            for item in info_field.split(";"):
                if "=" not in item:
                    continue
                k, v = item.split("=", 1)
                info[k] = v
            return info

        def alt_allele_count(gt: str | None) -> int:
            if not gt:
                return 0
            alleles = gt.replace("|", "/").split("/")
            count = 0
            for allele in alleles:
                allele = allele.strip()
                if allele.isdigit() and int(allele) > 0:
                    count += 1
            return count

        for line in request.vcf_content.splitlines():
            if line.startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) < 10:
                continue

            rsid = parts[2]
            info = parse_info(parts[7])

            gene = normalize_gene(info.get("GENE", "")) if info.get("GENE") else None
            if not gene and rsid in RSID_GENE_MAP:
                gene = RSID_GENE_MAP[rsid][0]
            if not gene:
                continue

            validate_gene(gene)
            star = normalize_star(info.get("STAR"))

            format_keys = parts[8].split(":")
            sample_values = parts[9].split(":")
            sample = {k: sample_values[i] for i, k in enumerate(format_keys) if i < len(sample_values)}
            gt = sample.get("GT")
            alt_count = alt_allele_count(gt)

            rec = gene_records.setdefault(gene, {"stars": [], "detected_rsids": []})
            if rsid.startswith("rs"):
                rec["detected_rsids"].append(rsid)

            if star and alt_count > 0:
                rec["stars"].extend([star] * alt_count)

        variants = []
        for gene, rec in gene_records.items():
            stars = [s for s in rec["stars"] if s and s != "*1"]
            if not stars:
                diplotype = "*1/*1"
            elif len(stars) == 1:
                diplotype = f"*1/{stars[0]}"
            else:
                a1 = stars[0]
                a2 = stars[1]
                diplotype = f"{a1}/{a2}"

            rsid = rec["detected_rsids"][0] if rec["detected_rsids"] else None
            variants.append({"gene": gene, "diplotype": diplotype, "rsid": rsid})

        return variants

    return []
