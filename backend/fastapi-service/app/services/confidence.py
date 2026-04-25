EVIDENCE_SCORES = {
    "A": 0.95,
    "B": 0.85,
    "C": 0.70
}

def get_confidence_score(evidence: str) -> float:
    return EVIDENCE_SCORES.get(evidence, 0.50)