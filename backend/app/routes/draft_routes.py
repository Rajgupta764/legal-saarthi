"""
Draft Generator Routes
Handles generating complaint letters and legal drafts
"""

from flask import Blueprint, request, jsonify
from app.services.draft_service import DraftService

draft_bp = Blueprint('draft', __name__)
draft_service = DraftService()


@draft_bp.route('/enhance-details', methods=['POST'])
def enhance_details():
    """Enhance user's raw problem description using AI."""
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
        language = data.get('language', 'hindi').lower().strip()

        if language not in ['hindi', 'english']:
            language = 'hindi'

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
                'message': 'कृपया अपनी समस्या पहले लिखें'
            }), 400

        result = draft_service.enhance_details(issue_type, details, language)

        return jsonify({
            'success': True,
            'data': result
        })

    except ValueError as ve:
        return jsonify({
            'success': False,
            'error': str(ve),
            'message': str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'AI सुधार में त्रुटि हुई। कृपया पुनः प्रयास करें।'
        }), 500


@draft_bp.route('/rewrite-problem', methods=['POST'])
def rewrite_problem():
    """Rewrite user's messy complaint into clear, professional Hindi.
    
    Request JSON:
        { "problem": "user's raw complaint text" }
    
    Response JSON:
        { "rewritten": "AI improved Hindi text" }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'message': 'कृपया समस्या की जानकारी दें'
            }), 400

        problem = (data.get('problem') or '').strip()

        if not problem:
            return jsonify({
                'success': False,
                'error': 'Problem text is required',
                'message': 'कृपया पहले अपनी समस्या लिखें'
            }), 400

        if len(problem) < 10:
            return jsonify({
                'success': False,
                'error': 'Problem text too short',
                'message': 'कृपया अपनी समस्या थोड़ा विस्तार से लिखें'
            }), 400

        result = draft_service.rewrite_problem(problem)

        return jsonify({
            'success': True,
            'rewritten': result['rewritten']
        })

    except ValueError as ve:
        return jsonify({
            'success': False,
            'error': str(ve),
            'message': str(ve)
        }), 400
    except Exception as e:
        print(f"Rewrite error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'समस्या को सुधारने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
        }), 500


@draft_bp.route('/generate-draft', methods=['POST'])
def generate_draft():
    """
    Generate a complaint letter/legal draft
    
    Request JSON:
    {
        "issueType": "land_dispute",
        "details": "मेरे पड़ोसी ने मेरी ज़मीन पर कब्ज़ा कर लिया है...",
        "language": "hindi" or "english"  [optional, defaults to "hindi"]
    }
    
    Response:
    {
        "draft": "सेवा में,\nजिलाधिकारी महोदय...",
        "tips": [...],
        "language": "hindi"
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
        language = data.get('language', 'hindi').lower().strip()
        
        # Validate language parameter
        if language not in ['hindi', 'english']:
            language = 'hindi'
        
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
        sender_info = data.get('senderInfo', {})
        recipient = data.get('recipient', {})
        subject_line = data.get('subject', '')
        
        result = draft_service.generate_draft(issue_type, details, language, sender_info, recipient, subject_line)
        
        return jsonify({
            'success': True,
            'data': result,
            'language': language
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'पत्र बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
        }), 500
