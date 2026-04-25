import unittest
from pathlib import Path

from app.schemas.request import AnalysisRequest
from app.services.pipeline import run_analysis


class SampleCalibrationTest(unittest.TestCase):
    def test_sample_vcf_normal_profile(self):
        sample_vcf = (
            Path(__file__).resolve().parent / "TC_P1_PATIENT_001_Normal.vcf"
        ).read_text(encoding="utf-8")

        request = AnalysisRequest(
            patient_id="PATIENT_001",
            drugs=["codeine", "warfarin", "clopidogrel", "simvastatin", "azathioprine", "fluorouracil"],
            vcf_content=sample_vcf,
        )

        response = run_analysis(request)
        self.assertEqual(response["patient_id"], "PATIENT_001")
        self.assertTrue(response["quality_metrics"]["vcf_parsing_success"])
        self.assertGreater(response["quality_metrics"]["parsed_variant_count"], 0)

        results_by_drug = {item["drug"].lower(): item for item in response["results"]}

        expected_safe = ["warfarin", "clopidogrel", "simvastatin", "azathioprine", "fluorouracil"]
        for drug in expected_safe:
            self.assertEqual(results_by_drug[drug]["risk_assessment"]["risk_label"], "Safe")

        # Codeine may be Safe or Unknown depending on CYP2D6 star calls in unphased VCF data.
        self.assertIn(
            results_by_drug["codeine"]["risk_assessment"]["risk_label"],
            {"Safe", "Unknown"},
        )


if __name__ == "__main__":
    unittest.main()
