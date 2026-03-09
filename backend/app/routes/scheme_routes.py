"""
Government Scheme Matching Routes
"""

from flask import Blueprint, request, jsonify
from app.services.scheme_matching_service import SchemeMatchingService

scheme_bp = Blueprint("scheme", __name__)
scheme_service = SchemeMatchingService()


@scheme_bp.route("/schemes/all", methods=["GET"])
def get_all_schemes():
    """Get all available government schemes."""
    try:
        schemes = scheme_service.get_all_schemes()
        return jsonify({
            "success": True,
            "total": len(schemes),
            "data": schemes,
        })
    except Exception as exc:
        return jsonify({
            "success": False,
            "error": str(exc),
            "message": "Error fetching schemes.",
        }), 500


@scheme_bp.route("/schemes/seed", methods=["POST"])
def seed_schemes():
    """Seed MongoDB with built-in schemes. Safe to call multiple times (upserts)."""
    try:
        result = scheme_service.seed_schemes()
        return jsonify({"success": True, **result})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@scheme_bp.route("/schemes/add", methods=["POST"])
def add_scheme():
    """Add a new scheme to the database."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        scheme_id, error = scheme_service.add_scheme(data)
        if error:
            return jsonify({"success": False, "error": error}), 400
        return jsonify({"success": True, "id": scheme_id}), 201
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@scheme_bp.route("/schemes/<scheme_id>", methods=["PUT"])
def update_scheme(scheme_id):
    """Update an existing scheme."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        success, error = scheme_service.update_scheme(scheme_id, data)
        if not success:
            return jsonify({"success": False, "error": error}), 400
        return jsonify({"success": True, "message": "Scheme updated"})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@scheme_bp.route("/schemes/<scheme_id>", methods=["DELETE"])
def delete_scheme(scheme_id):
    """Soft-delete a scheme (mark inactive)."""
    try:
        success, error = scheme_service.delete_scheme(scheme_id)
        if not success:
            return jsonify({"success": False, "error": error}), 400
        return jsonify({"success": True, "message": "Scheme deactivated"})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


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
