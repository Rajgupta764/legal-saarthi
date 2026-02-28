"""
Draft Generator Routes
Handles generating complaint letters and legal drafts
"""

from flask import Blueprint, request, jsonify
from app.services.draft_service import DraftService

draft_bp = Blueprint('draft', __name__)
draft_service = DraftService()


@draft_bp.route('/generate-draft', methods=['POST'])
def generate_draft():
    """
    Generate a complaint letter/legal draft
    
    Request JSON:
    {
        "issueType": "land_dispute",
        "details": "मेरे पड़ोसी ने मेरी ज़मीन पर कब्ज़ा कर लिया है..."
    }
    
    Response:
    {
        "draft": "सेवा में,\nजिलाधिकारी महोदय...",
        "tips": [...]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'message': 'कृपया समस्या की जानकारी दें'
            }), 400
        
        issue_type = data.get('issueType', '').strip()
        details = data.get('details', '').strip()
        
        if not issue_type:
            return jsonify({
                'success': False,
                'error': 'Issue type is required',
                'message': 'कृपया समस्या का प्रकार चुनें'
            }), 400
        
        if not details:
            return jsonify({
                'success': False,
                'error': 'Details are required',
                'message': 'कृपया समस्या का विवरण लिखें'
            }), 400
        
        if len(details) < 20:
            return jsonify({
                'success': False,
                'error': 'Details too short',
                'message': 'कृपया समस्या के बारे में थोड़ा और विस्तार से बताएं'
            }), 400
        
        # Generate draft
        result = draft_service.generate_draft(issue_type, details)
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'पत्र बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
        }), 500
