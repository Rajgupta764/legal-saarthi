"""
Speech/Audio Transcription Routes
Handles audio upload and conversion to text using Whisper API
"""

from flask import Blueprint, request, jsonify
from app.services.speech_service import get_speech_service

speech_bp = Blueprint('speech', __name__, url_prefix='/api/speech')


@speech_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Transcribe audio file to text
    
    Expected:
    - audio_file: Audio file (multipart/form-data)
    - language: Optional language code (default: hi-IN)
    
    Returns:
    {
        'success': bool,
        'transcript': str,
        'language': str
    }
    """
    try:
        # Check if audio file is present
        if 'audio_file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No audio file provided',
                'message': 'कृपया ऑडियो फ़ाइल भेजें'
            }), 400
        
        audio_file = request.files['audio_file']
        
        if audio_file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected',
                'message': 'कृपया ऑडियो फ़ाइल चुनें'
            }), 400
        
        # Get language code from request
        language_code = request.form.get('language', 'hi-IN')
        
        # Transcribe audio
        service = get_speech_service()
        result = service.transcribe_audio(audio_file, language_code)
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': {
                    'transcript': result['transcript'],
                    'language': result['language']
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result['error'],
                'message': 'ऑडियो को टेक्स्ट में बदलने में विफल रहे। कृपया फिर से प्रयास करें।'
            }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'सर्वर में त्रुटि हुई। कृपया पुनः प्रयास करें।'
        }), 500


@speech_bp.route('/transcribe-stream', methods=['POST'])
def transcribe_stream():
    """
    Transcribe audio from raw binary data (streaming)
    
    Content-Type: audio/wav (or audio/webm, audio/mpeg)
    Query params:
    - language: Language code (default: hi-IN)
    
    Returns:
    {
        'success': bool,
        'transcript': str,
        'language': str
    }
    """
    try:
        # Get language code from query params
        language_code = request.args.get('language', 'hi-IN')
        
        # Read raw audio data from request body
        audio_bytes = request.get_data()
        
        if not audio_bytes:
            return jsonify({
                'success': False,
                'error': 'No audio data provided',
                'message': 'कृपया ऑडियो डेटा भेजें'
            }), 400
        
        # Get content type for filename hint
        content_type = request.content_type or 'audio/wav'
        ext_map = {
            'audio/wav': 'wav',
            'audio/webm': 'webm',
            'audio/mpeg': 'mp3',
            'audio/mp4': 'm4a',
            'audio/ogg': 'ogg'
        }
        ext = ext_map.get(content_type.split(';')[0], 'wav')
        filename = f'audio.{ext}'
        
        # Transcribe audio
        service = get_speech_service()
        result = service.transcribe_audio_bytes(audio_bytes, language_code, filename)
        
        if result['success']:
            return jsonify({
                'success': True,
                'data': {
                    'transcript': result['transcript'],
                    'language': result['language']
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result['error'],
                'message': 'ऑडियो को टेक्स्ट में बदलने में विफल रहे। कृपया फिर से प्रयास करें।'
            }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'सर्वर में त्रुटि हुई। कृपया पुनः प्रयास करें।'
        }), 500
