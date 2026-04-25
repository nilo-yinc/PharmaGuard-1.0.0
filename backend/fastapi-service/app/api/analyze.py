from fastapi import APIRouter
from datetime import datetime
from app.schemas.response import AnalysisResponse
from app.schemas.request import AnalysisRequest
from app.services.pipeline import run_analysis

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest):
    return run_analysis(request)