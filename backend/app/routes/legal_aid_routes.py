"""
Legal Aid Finder Routes
Handles finding nearby legal aid offices
"""

from flask import Blueprint, request, jsonify
from app.services.legal_aid_service import LegalAidService

legal_aid_bp = Blueprint('legal_aid', __name__)
legal_aid_service = LegalAidService()


@legal_aid_bp.route('/find-legal-aid', methods=['POST'])
def find_legal_aid():
    """
    Find legal aid offices by district and/or pincode
    
    Request JSON:
    {
        "district": "Lucknow",      # Optional
        "pincode": "226001",        # Optional
        "userLat": 26.8467,         # Optional - user's latitude
        "userLng": 80.9462          # Optional - user's longitude
    }
    
    Response:
    {
        "success": true,
        "offices": [
            {
                "name": "District Legal Services Authority",
                "address": "...",
                "phone": "...",
                "distance": 5.2,
                "distanceText": "5.2 km",
                "mapsLink": "..."
            }
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'message': 'Please provide district or pincode'
            }), 400
        
        district = data.get('district', '').strip() if data.get('district') else None
        pincode = data.get('pincode', '').strip() if data.get('pincode') else None
        user_lat = data.get('userLat')
        user_lng = data.get('userLng')
        
        # Legacy support: if 'query' is provided, determine if it's district or pincode
        if not district and not pincode:
            query = data.get('query', '').strip()
            if query:
                if query.isdigit() and len(query) >= 3:
                    pincode = query
                else:
                    district = query
        
        if not district and not pincode and not (user_lat and user_lng):
            return jsonify({
                'success': False,
                'error': 'Query is required',
                'message': 'Please provide district, pincode, or enable location'
            }), 400
        
        # Find legal aid offices
        result = legal_aid_service.find_offices(
            district=district,
            pincode=pincode,
            user_lat=user_lat,
            user_lng=user_lng
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error finding legal aid offices.'
        }), 500
