from fastapi import HTTPException
from functools import lru_cache
from app.services.drug_gene_builder import build_drug_gene_map

DRUG_ALIASES = {
    "clopidogrel bisulfate": "clopidogrel",
    "clopidogrel hydrogen sulfate": "clopidogrel",
    "plavix": "clopidogrel",
    "warfarin sodium": "warfarin",
    "5-fluorouracil": "fluorouracil"
}

@lru_cache(maxsize=1)
def get_drug_gene_map():
    return build_drug_gene_map()

def get_primary_gene(drug: str) -> str:
    if not drug:
        raise HTTPException(status_code=400, detail="Drug name missing")

    drug = drug.strip().lower()
    drug = DRUG_ALIASES.get(drug, drug)

    drug_gene_map = get_drug_gene_map()
    gene = drug_gene_map.get(drug)

    if not gene:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported drug: {drug}. Available: {list(drug_gene_map.keys())[:10]}"
        )

    return gene
