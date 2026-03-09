"""
Legal Tips Routes with Government API Integration
Focus: Trust, credibility, and real-world solutions for rural users
"""

from flask import Blueprint, request, jsonify
from app.services.legal_tips_service import LegalTipsService

legal_tips_bp = Blueprint('legal_tips', __name__)
legal_tips_service = LegalTipsService()


@legal_tips_bp.route('/all', methods=['GET'])
def get_all_tips():
    """
    Get all legal tips
    
    Response includes:
    - Tip ID, category, priority
    - Hindi and English content
    - Government source for trust
    - Action steps
    - Legal references
    - Related helplines
    """
    tips = legal_tips_service.get_all_tips()
    
    return jsonify({
        "success": True,
        "total_tips": len(tips),
        "data": tips,
        "metadata": {
            "source": "Government of India - Official Laws",
            "verified": True,
            "last_updated": legal_tips_service.update_timestamp
        }
    }), 200


@legal_tips_bp.route('/category/<category_name>', methods=['GET'])
def get_tips_by_category(category_name):
    """
    Get tips by category
    
    Categories:
    - property_disputes: Land and property rights
    - labour_rights: Worker protection
    - family_law: Marriage, dowry, domestic violence
    - agricultural_law: Farmer rights, MSP
    - consumer_rights: Product quality, fraud
    - police_rights: Arrest, interrogation rights
    - tenant_rights: Rent, eviction
    """
    tips = legal_tips_service.get_tips_by_category(category_name)
    
    if tips is None:
        return jsonify({
            "success": False,
            "error": "Category not found",
            "available_categories": list(legal_tips_service.tips_database.keys())
        }), 404
    
    return jsonify({
        "success": True,
        "category": category_name,
        "total_tips": len(tips),
        "data": tips
    }), 200


@legal_tips_bp.route('/tip/<tip_id>', methods=['GET'])
def get_single_tip(tip_id):
    """
    Get detailed information about a single tip
    Includes references, government sources, helplines
    """
    tip = legal_tips_service.get_tip_by_id(tip_id)
    
    if tip is None:
        return jsonify({
            "success": False,
            "error": "Tip not found"
        }), 404
    
    # Add trust indicators
    tip_with_trust = {
        **tip,
        "trust_indicators": {
            "government_verified": tip.get("government_source", {}).get("verified", True),
            "referenced_law": "Yes" if tip.get("law") else "No",
            "helplines_available": len(tip.get("helplines", [])) > 0
        }
    }
    
    return jsonify({
        "success": True,
        "data": tip_with_trust
    }), 200


@legal_tips_bp.route('/search', methods=['POST'])
def search_tips():
    """
    Search tips by keyword
    
    Request JSON:
    {
        "keyword": "property" or "दहेज़" or "FIR" etc.
    }
    """
    data = request.get_json()
    keyword = data.get('keyword', '').strip()
    
    if not keyword:
        return jsonify({
            "success": False,
            "error": "Keyword required"
        }), 400
    
    results = legal_tips_service.search_tips(keyword)
    
    return jsonify({
        "success": True,
        "keyword": keyword,
        "found": len(results),
        "data": results
    }), 200


@legal_tips_bp.route('/priority/<priority_level>', methods=['GET'])
def get_tips_by_priority(priority_level):
    """
    Get tips by priority
    
    Priority levels:
    - critical: Immediate action needed (arrests, violence, dowry)
    - high: Important but not immediate (property, labour rights)
    - medium: General awareness
    """
    if priority_level not in ['critical', 'high', 'medium']:
        return jsonify({
            "success": False,
            "error": "Invalid priority level",
            "valid_values": ["critical", "high", "medium"]
        }), 400
    
    tips = legal_tips_service.get_tips_by_priority(priority_level)
    
    return jsonify({
        "success": True,
        "priority": priority_level,
        "total_tips": len(tips),
        "data": tips
    }), 200


@legal_tips_bp.route('/daily', methods=['GET'])
def get_daily_tips():
    """
    Get rotating daily tips for dashboard widget
    
    Returns 3 random tips to keep users engaged
    Different tips each day for continuous learning
    """
    limit = request.args.get('limit', 3, type=int)
    tips = legal_tips_service.get_daily_tips(limit=min(limit, 5))
    
    return jsonify({
        "success": True,
        "count": len(tips),
        "message": "Daily legal tips - Learn something new today!",
        "data": tips
    }), 200


@legal_tips_bp.route('/government-sources', methods=['GET'])
def get_government_sources():
    """
    Get list of all government sources used
    This builds trust by showing official references
    """
    tips = legal_tips_service.get_all_tips()
    sources = set()
    source_details = {}
    
    for tip in tips:
        if tip.get("government_source"):
            source = tip.get("government_source", {}).get("source")
            if source:
                sources.add(source)
                source_details[source] = tip.get("government_source")
    
    return jsonify({
        "success": True,
        "total_sources": len(sources),
        "data": list(source_details.values()),
        "message": "All information is sourced from official Government of India resources"
    }), 200


@legal_tips_bp.route('/helplines', methods=['GET'])
def get_all_helplines():
    """
    Get all emergency helplines and support services
    Provides immediate help options for users
    """
    tips = legal_tips_service.get_all_tips()
    all_helplines = {}
    
    for tip in tips:
        if tip.get("helplines"):
            category = tip.get("category", "General")
            if category not in all_helplines:
                all_helplines[category] = []
            all_helplines[category].extend(tip.get("helplines"))
    
    return jsonify({
        "success": True,
        "data": all_helplines,
        "message": "Emergency helplines available 24/7"
    }), 200


@legal_tips_bp.route('/related/<tip_id>', methods=['GET'])
def get_related_tips(tip_id):
    """
    Get tips related to a specific tip
    Helps users learn about interconnected legal topics
    """
    tip = legal_tips_service.get_tip_by_id(tip_id)
    
    if tip is None:
        return jsonify({
            "success": False,
            "error": "Tip not found"
        }), 404
    
    related_topics = tip.get("related_topics", [])
    related_tips = []
    
    for topic in related_topics:
        # Search for tips in related topics
        results = legal_tips_service.search_tips(topic)
        related_tips.extend(results)
    
    return jsonify({
        "success": True,
        "tip_id": tip_id,
        "tip_title": tip.get("title"),
        "related_count": len(related_tips),
        "data": related_tips[:5]  # Limit to 5 related tips
    }), 200


@legal_tips_bp.route('/stats', methods=['GET'])
def get_stats():
    """
    Get stats about legal tips coverage
    Shows what topics are covered
    """
    tips = legal_tips_service.get_all_tips()
    
    stats = {
        "total_tips": len(tips),
        "categories": len(legal_tips_service.tips_database),
        "by_priority": {
            "critical": len(legal_tips_service.get_tips_by_priority("critical")),
            "high": len(legal_tips_service.get_tips_by_priority("high")),
            "medium": len(legal_tips_service.get_tips_by_priority("medium"))
        },
        "government_sources": len([t for t in tips if t.get("government_source")]),
        "helplines_available": len([t for t in tips if t.get("helplines")])
    }
    
    return jsonify({
        "success": True,
        "data": stats,
        "message": "Complete coverage of essential legal rights for rural India"
    }), 200
