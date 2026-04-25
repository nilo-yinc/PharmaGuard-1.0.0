CPIC_RULES = {
    ("CYP2D6", "UM", "codeine"): {
        "risk_label": "Toxic",
        "severity": "critical",
        "action": "Avoid use",
        "details": "Ultra-rapid metabolism converts codeine to morphine quickly, risking overdose.",
        "evidence": "A"
    },
    ("CYP2D6", "PM", "codeine"): {
        "risk_label": "Ineffective",
        "severity": "moderate",
        "action": "Use alternative analgesic",
        "details": "Poor metabolizers cannot convert codeine to active morphine.",
        "evidence": "A"
    },
    ("CYP2C19", "PM", "clopidogrel"): {
        "risk_label": "Ineffective",
        "severity": "high",
        "action": "Use alternative antiplatelet therapy",
        "details": "Clopidogrel requires CYP2C19 activation.",
        "evidence": "A"
    },
    ("CYP2C9", "PM", "warfarin"): {
        "risk_label": "Toxic",
        "severity": "high",
        "action": "Reduce dose",
        "details": "Reduced metabolism increases bleeding risk.",
        "evidence": "A"
    },
    ("SLCO1B1", "Low", "simvastatin"): {
        "risk_label": "Toxic",
        "severity": "moderate",
        "action": "Use lower dose or alternative statin",
        "details": "Low transporter function increases statin-induced myopathy risk.",
        "evidence": "A"
    },
    ("TPMT", "Low", "azathioprine"): {
        "risk_label": "Toxic",
        "severity": "critical",
        "action": "Avoid use",
        "details": "Low TPMT activity can cause severe myelosuppression.",
        "evidence": "A"
    },
    ("DPYD", "Deficient", "fluorouracil"): {
        "risk_label": "Toxic",
        "severity": "critical",
        "action": "Avoid use",
        "details": "DPYD deficiency leads to life-threatening fluorouracil toxicity.",
        "evidence": "A"
    }
}

SAFE_PHENOTYPE_BY_GENE = {
    "CYP2D6": {"NM"},
    "CYP2C19": {"NM", "RM"},
    "CYP2C9": {"NM"},
    "SLCO1B1": {"Normal"},
    "TPMT": {"Normal"},
    "DPYD": {"Normal"},
}

def get_cpic_recommendation(gene: str, phenotype: str, drug: str) -> dict:
    normalized_drug = (drug or "").strip().lower()
    key = (gene, phenotype, normalized_drug)
    if key in CPIC_RULES:
        return CPIC_RULES[key]

    if phenotype in SAFE_PHENOTYPE_BY_GENE.get(gene, set()):
        return {
            "risk_label": "Safe",
            "severity": "low",
            "action": "Use standard dosing",
            "details": "No clinically significant pharmacogenomic risk detected for this gene-drug pair.",
            "evidence": "B",
        }

    return {
        "risk_label": "Unknown",
        "severity": "none",
        "action": "Consult clinician",
        "details": "No CPIC guideline available for this combination.",
        "evidence": "C",
    }
