"""
Government Scheme Matching Routes
"""

from flask import Blueprint, request, jsonify
from app.services.scheme_matching_service import SchemeMatchingService

scheme_bp = Blueprint("scheme", __name__)
scheme_service = SchemeMatchingService()


@scheme_bp.route("/match-schemes", methods=["POST"])
def match_schemes():
    """
    Match user profile to government schemes.

    Request JSON:
    {
        "income": 120000,
        "incomePeriod": "year",
        "landSize": 1.5,
        "landUnit": "acre",
        "category": "SC"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided",
                "message": "Please provide income, land size, or category.",
            }), 400

        income = data.get("income")
        land_size = data.get("landSize")
        category = data.get("category")
        income_period = data.get("incomePeriod", "year")
        land_unit = data.get("landUnit", "acre")

        if income is None and land_size is None and not category:
            return jsonify({
                "success": False,
                "error": "Missing inputs",
                "message": "Please provide at least one input: income, land size, or category.",
            }), 400

        result = scheme_service.match_schemes(
            income=income,
            land_size=land_size,
            category=category,
            income_period=income_period,
            land_unit=land_unit,
        )

        return jsonify(result)

    except Exception as exc:
        return jsonify({
            "success": False,
            "error": str(exc),
            "message": "Error matching schemes.",
        }), 500
