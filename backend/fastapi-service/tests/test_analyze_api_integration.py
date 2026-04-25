import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


class AnalyzeApiIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.tests_dir = Path(__file__).resolve().parent

    @staticmethod
    def _mock_explanation(*args, **kwargs):
        return {
            "summary": "Mocked summary for integration test.",
            "mechanism": "Mocked mechanism for integration test.",
        }

    def _load_fixture(self, name: str) -> str:
        return (self.tests_dir / name).read_text(encoding="utf-8")

    def test_analyze_normal_vcf(self):
        payload = {
            "patient_id": "PATIENT_001",
            "drugs": ["codeine", "warfarin", "clopidogrel", "simvastatin", "azathioprine", "fluorouracil"],
            "vcf_content": self._load_fixture("TC_P1_PATIENT_001_Normal.vcf"),
        }

        with patch("app.services.pipeline.generate_explanation", side_effect=self._mock_explanation):
            response = self.client.post("/analyze", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["patient_id"], "PATIENT_001")
        self.assertIn("timestamp", data)
        self.assertIn("results", data)
        self.assertIn("quality_metrics", data)
        self.assertTrue(data["quality_metrics"]["vcf_parsing_success"])

        results_by_drug = {item["drug"].lower(): item for item in data["results"]}
        for drug in ["warfarin", "clopidogrel", "simvastatin", "azathioprine", "fluorouracil"]:
            self.assertEqual(results_by_drug[drug]["risk_assessment"]["risk_label"], "Safe")

    def test_analyze_high_risk_vcf(self):
        payload = {
            "patient_id": "PATIENT_002",
            "drugs": ["codeine", "warfarin", "clopidogrel", "simvastatin", "azathioprine", "fluorouracil"],
            "vcf_content": self._load_fixture("TC_P2_PATIENT_002_HighRisk.vcf"),
        }

        with patch("app.services.pipeline.generate_explanation", side_effect=self._mock_explanation):
            response = self.client.post("/analyze", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        results_by_drug = {item["drug"].lower(): item for item in data["results"]}

        self.assertEqual(results_by_drug["codeine"]["risk_assessment"]["risk_label"], "Ineffective")
        self.assertEqual(results_by_drug["warfarin"]["risk_assessment"]["risk_label"], "Toxic")
        self.assertEqual(results_by_drug["clopidogrel"]["risk_assessment"]["risk_label"], "Ineffective")
        self.assertEqual(results_by_drug["simvastatin"]["risk_assessment"]["risk_label"], "Toxic")
        self.assertEqual(results_by_drug["azathioprine"]["risk_assessment"]["risk_label"], "Toxic")
        self.assertEqual(results_by_drug["fluorouracil"]["risk_assessment"]["risk_label"], "Toxic")


if __name__ == "__main__":
    unittest.main()
