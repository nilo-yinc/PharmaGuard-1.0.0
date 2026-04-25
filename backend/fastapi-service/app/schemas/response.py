from pydantic import BaseModel
from typing import List

class RiskAssessment(BaseModel):
    risk_label: str
    confidence_score: float
    severity: str

class PharmacogenomicProfile(BaseModel):
    primary_gene: str
    diplotype: str
    phenotype: str
    detected_variants: List[dict]

class ClinicalRecommendation(BaseModel):
    action: str
    details: str

class LLMExplanation(BaseModel):
    summary: str
    mechanism: str

class DrugResult(BaseModel):
    drug: str
    risk_assessment: RiskAssessment
    pharmacogenomic_profile: PharmacogenomicProfile
    clinical_recommendation: ClinicalRecommendation
    llm_generated_explanation: LLMExplanation

class AnalysisResponse(BaseModel):
    patient_id: str
    timestamp: str
    results: List[DrugResult]
    quality_metrics: dict
