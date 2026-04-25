import os
from app.services.clinpgx_loader import load_relationships

VALID_RELATIONS = {"associated", "metabolizes", "affects", "influences"}

REQUIRED_DRUG_MAP = {
    "clopidogrel": "CYP2C19",
    "warfarin": "CYP2C9",
    "codeine": "CYP2D6",
    "simvastatin": "SLCO1B1",
    "azathioprine": "TPMT",
    "fluorouracil": "DPYD",
}

def build_drug_gene_map():
    # Default to the required 6-drug map for fast/stable serverless cold starts.
    mapping = dict(REQUIRED_DRUG_MAP)
    if os.getenv("ENABLE_EXTENDED_DRUG_MAP", "false").lower() != "true":
        return mapping

    try:
        df = load_relationships()
        for _, row in df.iterrows():
            gene = row.get("Entity1_name")
            drug = row.get("Entity2_name")
            relation = str(row.get("Association", "")).lower()

            if not gene or not drug:
                continue

            if relation in VALID_RELATIONS:
                mapping[drug.lower()] = gene.upper()
    except Exception:
        # Keep core functionality even if extended dataset loading fails in deployment.
        return dict(REQUIRED_DRUG_MAP)

    return mapping
