"""
Issue Classification Routes
Handles legal issue classification and guidance
"""

from flask import Blueprint, request, jsonify
from app.services.issue_service import IssueService

issue_bp = Blueprint('issue', __name__)
issue_service = IssueService()


@issue_bp.route('/classify-issue', methods=['POST'])
def classify_issue():
    """
    Classify legal issue from text description
    
    Request JSON:
    {
        "text": "मेरे पड़ोसी ने मेरी ज़मीन पर कब्ज़ा कर लिया है..."
    }
    
    Response:
    {
        "category": "land_dispute",
        "categoryName": "भूमि विवाद",
        "steps": [...],
        "documents": [...]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'message': 'कृपया अपनी समस्या का विवरण दें'
            }), 400
        
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text is required',
                'message': 'कृपया अपनी समस्या का विवरण लिखें'
            }), 400
        
        if len(text) < 10:
            return jsonify({
                'success': False,
                'error': 'Text too short',
                'message': 'कृपया अपनी समस्या के बारे में थोड़ा और विस्तार से बताएं'
            }), 400
        
        # Debug log
        print(f"[DEBUG] Classifying text: {text}")
        
        # Classify issue
        result = issue_service.classify_issue(text)
        
        print(f"[DEBUG] Classification result: {result.get('category')} - {result.get('categoryName')}")
        
        return jsonify({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'समस्या वर्गीकरण में त्रुटि हुई। कृपया पुनः प्रयास करें।'
        }), 500
