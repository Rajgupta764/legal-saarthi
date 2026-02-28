"""
Helper utilities for the application
"""

import os
from werkzeug.utils import secure_filename

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}

# Maximum file size (16 MB)
MAX_FILE_SIZE = 16 * 1024 * 1024


def allowed_file(filename):
    """
    Check if file extension is allowed
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_file_upload(request, field_name='document'):
    """
    Validate file upload from request
    Returns dict with 'valid' boolean and 'error'/'message' if invalid
    """
    # Check for both 'document' and 'file' field names for compatibility
    actual_field = None
    for fname in [field_name, 'document', 'file']:
        if fname in request.files:
            actual_field = fname
            break
    
    if not actual_field:
        return {
            'valid': False,
            'error': 'No file provided',
            'message': 'कृपया एक फ़ाइल चुनें'
        }
    
    file = request.files[actual_field]
    
    # Check if file is selected
    if file.filename == '':
        return {
            'valid': False,
            'error': 'No file selected',
            'message': 'कोई फ़ाइल नहीं चुनी गई'
        }
    
    # Check file extension
    if not allowed_file(file.filename):
        return {
            'valid': False,
            'error': 'Invalid file type',
            'message': 'केवल PNG, JPG, PDF, DOC फ़ाइलें स्वीकार हैं'
        }
    
    # Check file size (if content length is available)
    if request.content_length and request.content_length > MAX_FILE_SIZE:
        return {
            'valid': False,
            'error': 'File too large',
            'message': 'फ़ाइल का आकार 16MB से कम होना चाहिए'
        }
    
    return {
        'valid': True,
        'filename': secure_filename(file.filename)
    }


def sanitize_text(text):
    """
    Sanitize user input text
    """
    if not text:
        return ''
    
    # Remove potentially harmful characters while preserving Hindi
    # Basic sanitization - remove script tags, etc.
    text = text.replace('<script>', '').replace('</script>', '')
    text = text.replace('<', '&lt;').replace('>', '&gt;')
    
    return text.strip()


def format_phone_number(phone):
    """
    Format phone number for display
    """
    if not phone:
        return ''
    
    # Remove all non-digit characters except +
    phone = ''.join(c for c in phone if c.isdigit() or c == '+')
    
    return phone


def get_file_extension(filename):
    """
    Get file extension from filename
    """
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower()
    return ''


def generate_unique_filename(original_filename):
    """
    Generate a unique filename while preserving extension
    """
    import uuid
    ext = get_file_extension(original_filename)
    unique_id = str(uuid.uuid4())[:8]
    return f"{unique_id}.{ext}" if ext else unique_id
