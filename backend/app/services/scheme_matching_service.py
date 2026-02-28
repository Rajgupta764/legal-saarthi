"""
Government Scheme Matching Service
Matches user profile to likely schemes using simple rules.
"""

from dataclasses import dataclass


@dataclass
class MatchResult:
    scheme_id: str
    name: str
    description: str
    eligibility: str
    matched: bool
    score: int
    reasons: list
    next_steps: list
    documents: list


class SchemeMatchingService:
    """Service for matching users to government schemes"""

    def __init__(self):
        self.schemes = [
            {
                "id": "pm_kisan",
                "name": "PM-KISAN",
                "description": "Income support for small and marginal farmers.",
                "eligibility": "Owns agricultural land (typically small or marginal holdings).",
                "rule": self._rule_pm_kisan,
                "next_steps": [
                    "Check eligibility on the PM-KISAN portal or at the local agriculture office.",
                    "Apply with land records and bank details.",
                ],
                "documents": [
                    "Land ownership record",
                    "Aadhaar or other ID",
                    "Bank account details",
                ],
            },
            {
                "id": "legal_aid",
                "name": "Free Legal Aid (NALSA/DLSA)",
                "description": "Free legal aid for low-income and eligible categories.",
                "eligibility": "Low income or eligible category (criteria vary by state).",
                "rule": self._rule_legal_aid,
                "next_steps": [
                    "Contact the District Legal Services Authority (DLSA).",
                    "Call NALSA helpline 15100 for guidance.",
                ],
                "documents": [
                    "Income certificate (if available)",
                    "ID proof",
                ],
            },
            {
                "id": "farmer_insurance",
                "name": "PM Fasal Bima Yojana (PMFBY)",
                "description": "Crop insurance for farmers against natural risks.",
                "eligibility": "Farmer with cultivated land or notified crops.",
                "rule": self._rule_farmer_insurance,
                "next_steps": [
                    "Check notified crops and seasons with the agriculture office.",
                    "Enroll via bank or local agriculture department.",
                ],
                "documents": [
                    "Land record or tenancy proof",
                    "Bank account details",
                ],
            },
            {
                "id": "compensation_schemes",
                "name": "Crop Loss Compensation Schemes",
                "description": "State or district compensation for crop loss or disasters.",
                "eligibility": "Farmer affected by natural calamity or crop loss.",
                "rule": self._rule_compensation,
                "next_steps": [
                    "Report crop loss to the local agriculture office within the deadline.",
                    "Submit required forms during the compensation survey.",
                ],
                "documents": [
                    "Land record",
                    "Loss assessment report (if any)",
                    "Bank account details",
                ],
            },
        ]

    def match_schemes(self, income, land_size, category, income_period="year", land_unit="acre"):
        """
        Match user inputs to schemes.
        income: numeric, in INR
        land_size: numeric, in land_unit
        category: string
        """
        normalized = self._normalize_inputs(income, land_size, category, income_period, land_unit)

        results = []
        for scheme in self.schemes:
            matched, score, reasons = scheme["rule"](normalized)
            result = MatchResult(
                scheme_id=scheme["id"],
                name=scheme["name"],
                description=scheme["description"],
                eligibility=scheme["eligibility"],
                matched=matched,
                score=score,
                reasons=reasons,
                next_steps=scheme["next_steps"],
                documents=scheme["documents"],
            )
            results.append(result)

        # Sort: matched first, then score desc
        results.sort(key=lambda r: (not r.matched, -r.score, r.name))

        return {
            "success": True,
            "data": {
                "input": normalized,
                "matches": [self._result_to_dict(r) for r in results],
                "assumptions": normalized.get("assumptions", []),
                "note": "Matches are indicative. Please verify eligibility with local offices.",
            },
        }

    def _normalize_inputs(self, income, land_size, category, income_period, land_unit):
        assumptions = []

        def to_float(value):
            if value is None:
                return None
            if isinstance(value, (int, float)):
                return float(value)
            value_str = str(value).replace(",", "").strip()
            return float(value_str) if value_str else None

        income_value = to_float(income)
        land_value = to_float(land_size)

        period = (income_period or "year").strip().lower()
        if period not in ["year", "month"]:
            assumptions.append("Income period assumed as yearly.")
            period = "year"

        if income_value is not None and period == "month":
            income_year = income_value * 12.0
        else:
            income_year = income_value

        unit = (land_unit or "acre").strip().lower()
        if unit not in ["acre", "hectare"]:
            assumptions.append("Land unit assumed as acre.")
            unit = "acre"

        if land_value is None:
            land_ha = None
        elif unit == "hectare":
            land_ha = land_value
        else:
            land_ha = land_value * 0.404686

        return {
            "income": income_year,
            "incomePeriod": "year",
            "landSize": land_value,
            "landUnit": unit,
            "landHectare": land_ha,
            "category": (category or "").strip(),
            "assumptions": assumptions,
        }

    def _rule_pm_kisan(self, data):
        reasons = []
        land_ha = data.get("landHectare")
        if land_ha is None or land_ha <= 0:
            return False, 10, ["No agricultural land size provided."]

        score = 40
        if land_ha <= 2.0:
            score += 45
            reasons.append("Land holding is within small/marginal range.")
            return True, score, reasons

        score += 10
        reasons.append("Land holding is above small/marginal range.")
        return False, score, reasons

    def _rule_legal_aid(self, data):
        reasons = []
        income = data.get("income")
        category = (data.get("category") or "").lower()

        score = 30
        if category:
            score += 10
            reasons.append("Category provided for eligibility check.")

        if income is None:
            reasons.append("Income not provided.")
            return False, score, reasons

        if income <= 300000:
            reasons.append("Income within typical legal aid thresholds.")
            return True, 80, reasons

        if income <= 600000:
            reasons.append("Income may qualify in some states.")
            return False, 55, reasons

        reasons.append("Income likely above typical legal aid thresholds.")
        return False, 35, reasons

    def _rule_farmer_insurance(self, data):
        land_ha = data.get("landHectare")
        if land_ha is None or land_ha <= 0:
            return False, 15, ["No agricultural land size provided."]

        reasons = ["Agricultural land indicates potential farmer eligibility."]
        return True, 75, reasons

    def _rule_compensation(self, data):
        land_ha = data.get("landHectare")
        if land_ha is None or land_ha <= 0:
            return False, 15, ["No agricultural land size provided."]

        income = data.get("income")
        score = 60
        reasons = ["Agricultural land indicates potential eligibility."]

        if income is not None and income <= 300000:
            score += 10
            reasons.append("Lower income may prioritize relief support.")

        return True, score, reasons

    def _result_to_dict(self, result):
        return {
            "id": result.scheme_id,
            "name": result.name,
            "description": result.description,
            "eligibility": result.eligibility,
            "matched": result.matched,
            "score": result.score,
            "reasons": result.reasons,
            "nextSteps": result.next_steps,
            "documents": result.documents,
        }
