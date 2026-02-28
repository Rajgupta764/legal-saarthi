"""
Chatbot Routes - Conversational Legal Assistance API
"""

from flask import Blueprint, request, jsonify
from app.services.chatbot_service import ChatbotService

chatbot_bp = Blueprint('chatbot', __name__)
chatbot_service = ChatbotService()


@chatbot_bp.route('/start', methods=['GET'])
def start_chatbot():
    """
    Start chatbot conversation
    Returns: Initial message and options
    """
    initial_msg = chatbot_service.get_initial_message()
    
    return jsonify({
        'success': True,
        'data': {
            'message': initial_msg['message'],
            'options': initial_msg['options'],
            'step': 'category_selection'
        }
    }), 200


@chatbot_bp.route('/message', methods=['POST'])
def process_message():
    """
    Process user message and return next step
    
    Request JSON:
    {
        "user_input": "police_harassment",
        "conversation_history": [
            {"type": "bot_message", "content": "..."},
            {"type": "user_selection", "selected_option": "police_harassment"}
        ]
    }
    """
    try:
        data = request.get_json()
        print(f"[DEBUG] Received chatbot message request: {data}")
        
        user_input = data.get('user_input')
        conversation_history = data.get('conversation_history', [])
        
        print(f"[DEBUG] user_input: {user_input}")
        print(f"[DEBUG] conversation_history: {conversation_history}")
        
        if not user_input:
            print(f"[DEBUG] user_input is empty!")
            return jsonify({
                'success': False,
                'error': 'Invalid input'
            }), 400
        
        # Process the input
        response = chatbot_service.process_user_input(user_input, conversation_history)
        
        if response.get('error'):
            return jsonify({
                'success': False,
                'error': response['error']
            }), 400
        
        return jsonify({
            'success': True,
            'data': response
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'चैटबॉट में त्रुटि हुई'
        }), 500


@chatbot_bp.route('/generate-document', methods=['POST'])
def generate_document_from_chat():
    """
    Generate document based on chatbot conversation
    
    Request JSON:
    {
        "conversation_data": {...},
        "document_type": "fir|notice|petition"
    }
    """
    try:
        data = request.get_json()
        conversation_data = data.get('conversation_data', {})
        document_type = data.get('document_type', 'fir')
        
        # Format data for document generation
        formatted_data = chatbot_service.format_conversation_for_document(conversation_data)
        
        # Here you would integrate with existing document generation services
        # For now, return the formatted data
        
        return jsonify({
            'success': True,
            'data': {
                'document_type': document_type,
                'formatted_data': formatted_data,
                'message': f'{document_type.upper()} तैयार करने के लिए तैयार है'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'दस्तावेज़ जनरेशन में त्रुटि'
        }), 500


@chatbot_bp.route('/get-suggestion', methods=['POST'])
def get_suggestion():
    """
    Get suggested action based on conversation data
    
    Request JSON:
    {
        "conversation_data": {...}
    }
    """
    try:
        data = request.get_json()
        conversation_data = data.get('conversation_data', {})
        
        suggestion = chatbot_service.get_suggested_action(conversation_data)
        
        return jsonify({
            'success': True,
            'data': suggestion
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@chatbot_bp.route('/health', methods=['GET'])
def chatbot_health():
    """Health check for chatbot service"""
    return jsonify({
        'success': True,
        'message': 'Chatbot service is running',
        'status': 'healthy'
    }), 200
