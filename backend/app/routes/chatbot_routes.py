"""
Chatbot Routes - Conversational Legal Assistance API
"""

from flask import Blueprint, request, jsonify, Response
from app.services.chatbot_service import ChatbotService
from app.services.ai_chat_service import AIChatService

chatbot_bp = Blueprint('chatbot', __name__)
chatbot_service = ChatbotService()
ai_chat_service = AIChatService()


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
            # Check if it's a retry-able error
            if response.get('retry'):
                return jsonify({
                    'success': True,
                    'data': response
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': response.get('error'),
                    'message': response.get('message', 'कृपया सही जानकारी दें।')
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
        'status': 'healthy',
        'ai_available': ai_chat_service.is_available,
    }), 200


# ────────────────────────────────────────────────────────────
#  AI-Powered Chat (GPT) endpoints
# ────────────────────────────────────────────────────────────

@chatbot_bp.route('/ai-chat', methods=['POST'])
def ai_chat():
    """
    AI-powered legal chat using GPT.

    Request JSON:
    {
        "message": "मेरे मालिक ने 3 महीने से वेतन नहीं दिया",
        "history": [
            {"role": "user", "content": "..."},
            {"role": "assistant", "content": "..."}
        ],
        "language": "hi"
    }
    """
    try:
        data = request.get_json()
        if not data or not data.get('message', '').strip():
            return jsonify({
                'success': False,
                'error': 'Message is required',
            }), 400

        user_message = data['message'].strip()
        history = data.get('history', [])
        language = data.get('language', 'hi')

        result = ai_chat_service.chat(user_message, history, language)

        if result['success']:
            return jsonify({
                'success': True,
                'data': {
                    'reply': result['reply'],
                    'usage': result.get('usage'),
                },
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result['error'],
            }), 503

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
        }), 500


@chatbot_bp.route('/ai-chat/welcome', methods=['GET'])
def ai_chat_welcome():
    """Get AI chat welcome message"""
    language = request.args.get('lang', 'hi')
    return jsonify({
        'success': True,
        'data': {
            'message': ai_chat_service.get_welcome_message(language),
            'ai_available': ai_chat_service.is_available,
        },
    }), 200


@chatbot_bp.route('/voice-chat', methods=['POST'])
def voice_chat():
    """
    Voice-optimized AI chat — returns short, spoken-friendly text.
    Request JSON: { "message": "...", "history": [...], "language": "hi" }
    """
    try:
        data = request.get_json()
        if not data or not data.get('message', '').strip():
            return jsonify({'success': False, 'error': 'Message is required'}), 400

        result = ai_chat_service.voice_chat(
            data['message'].strip(),
            data.get('history', []),
            data.get('language', 'hi'),
        )

        if result['success']:
            return jsonify({'success': True, 'data': {'reply': result['reply']}}), 200
        return jsonify({'success': False, 'error': result['error']}), 503
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@chatbot_bp.route('/tts', methods=['POST'])
def text_to_speech():
    """
    Convert text to natural speech audio (MP3) using Edge TTS neural voices.
    Request JSON: { "text": "...", "language": "hi" }
    """
    try:
        data = request.get_json()
        text = (data or {}).get('text', '').strip()
        if not text:
            return jsonify({'success': False, 'error': 'Text is required'}), 400

        language = (data or {}).get('language', 'hi')
        audio_bytes = ai_chat_service.text_to_speech(text, language=language)

        if audio_bytes:
            return Response(audio_bytes, mimetype='audio/mpeg',
                            headers={'Content-Disposition': 'inline; filename="speech.mp3"'})
        else:
            return jsonify({'success': False, 'error': 'TTS generation failed'}), 503
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
