from pydantic import BaseModel
from typing import List, Optional

class VariantInput(BaseModel):
    gene: str
    diplotype: str
    rsid: str

class AnalysisRequest(BaseModel):
    patient_id: str
    drugs: List[str]
    variants: Optional[List[VariantInput]] = None
    vcf_content: Optional[str] = None
