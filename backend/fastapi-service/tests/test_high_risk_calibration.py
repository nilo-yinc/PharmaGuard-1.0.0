import unittest
from pathlib import Path

from app.schemas.request import AnalysisRequest
from app.services.pipeline import run_analysis


class HighRiskCalibrationTest(unittest.TestCase):
    def test_high_risk_vcf_profile(self):
        sample_vcf = (
            Path(__file__).resolve().parent / "TC_P2_PATIENT_002_HighRisk.vcf"
        ).read_text(encoding="utf-8")

        request = AnalysisRequest(
            patient_id="PATIENT_002",
            drugs=["codeine", "warfarin", "clopidogrel", "simvastatin", "azathioprine", "fluorouracil"],
            vcf_content=sample_vcf,
        )

        response = run_analysis(request)
        self.assertEqual(response["patient_id"], "PATIENT_002")
        self.assertTrue(response["quality_metrics"]["vcf_parsing_success"])
        self.assertGreaterEqual(response["quality_metrics"]["parsed_variant_count"], 6)

        results_by_drug = {item["drug"].lower(): item for item in response["results"]}

        self.assertEqual(results_by_drug["codeine"]["risk_assessment"]["risk_label"], "Ineffective")
        self.assertEqual(results_by_drug["warfarin"]["risk_assessment"]["risk_label"], "Toxic")
        self.assertEqual(results_by_drug["clopidogrel"]["risk_assessment"]["risk_label"], "Ineffective")
        self.assertEqual(results_by_drug["simvastatin"]["risk_assessment"]["risk_label"], "Toxic")
        self.assertEqual(results_by_drug["azathioprine"]["risk_assessment"]["risk_label"], "Toxic")
        self.assertEqual(results_by_drug["fluorouracil"]["risk_assessment"]["risk_label"], "Toxic")

        self.assertEqual(
            results_by_drug["warfarin"]["clinical_recommendation"]["action"],
            "Reduce dose",
        )
        self.assertEqual(
            results_by_drug["clopidogrel"]["clinical_recommendation"]["action"],
            "Use alternative antiplatelet therapy",
        )


if __name__ == "__main__":
    unittest.main()
