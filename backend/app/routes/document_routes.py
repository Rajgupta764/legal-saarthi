"""
Document Analysis Routes
Handles document upload and OCR analysis
"""

from flask import Blueprint, request, jsonify
from app.services.document_service import DocumentService
from app.utils.helpers import validate_file_upload

document_bp = Blueprint('document', __name__)
document_service = DocumentService()


@document_bp.route('/analyze-document', methods=['POST'])
def analyze_document():
    """
    Analyze uploaded document (image/PDF)
    
    Request: multipart/form-data with 'document' field
    Response: Simplified text explanation in Hindi with OCR extraction
    """
    try:
        # Debug: Log what files are in the request
        print(f"Request files: {list(request.files.keys())}")
        print(f"Request content type: {request.content_type}")
        print(f"Request method: {request.method}")
        print(f"Request form data: {list(request.form.keys())}")
        
        # Get file from request (supports both 'document' and 'file' field names)
        file = None
        for field_name in ['document', 'file']:
            if field_name in request.files:
                file = request.files[field_name]
                print(f"Found file in field: {field_name}, filename: {file.filename}")
                break
        
        if not file or file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file found',
                'message': 'कृपया एक फ़ाइल अपलोड करें',
                'debug': {
                    'available_files': list(request.files.keys()),
                    'content_type': request.content_type,
                    'form_keys': list(request.form.keys())
                }
            }), 400
        
        # Check file extension
        allowed_extensions = {'png', 'jpg', 'jpeg', 'pdf'}
        file_ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
        if file_ext not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': 'Invalid file type',
                'message': f'केवल PNG, JPG, PDF फ़ाइलें स्वीकार हैं। आपकी फ़ाइल: {file_ext}'
            }), 400
        
        # Process document with OCR and AI
        result = document_service.analyze_document(file)
        
        # The service now returns the full result with success flag
        if result.get('success'):
            return jsonify(result)
        else:
            return jsonify(result), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'दस्तावेज़ विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।'
        }), 500
