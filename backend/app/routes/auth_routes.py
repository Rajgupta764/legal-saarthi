"""
Authentication Routes
Handles registration, login, and user endpoints
"""

from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'name', 'phone', 'password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': 'Missing required fields',
                'message': f'आवश्यक फ़ील्ड गुम हैं: {", ".join(missing_fields)}',
                'fields': missing_fields
            }), 400
        
        # Register user
        result = AuthService.register_user(
            email=data.get('email'),
            name=data.get('name'),
            phone=data.get('phone'),
            password=data.get('password')
        )
        
        status_code = 201 if result['success'] else 400
        return jsonify(result), status_code
    
    except Exception as e:
        print(f"Signup error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'पंजीकरण में विफल'
        }), 500


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Missing credentials',
                'message': 'ईमेल और पासवर्ड आवश्यक हैं'
            }), 400
        
        # Login user
        result = AuthService.login_user(email, password)
        
        status_code = 200 if result['success'] else 401
        return jsonify(result), status_code
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'लॉगिन विफल'
        }), 500


@auth_bp.route('/auth/verify-token', methods=['POST'])
def verify_token():
    """Verify JWT token"""
    try:
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                'success': False,
                'error': 'Missing token',
                'message': 'प्रमाणीकरण टोकन आवश्यक है'
            }), 401
        
        # Extract token from Bearer scheme
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({
                'success': False,
                'error': 'Invalid token format',
                'message': 'अमान्य टोकन प्रारूप'
            }), 401
        
        result = AuthService.verify_token(token)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Token is valid',
                'data': result['data']
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result['error'],
                'message': 'टोकन अमान्य या समाप्त हो गया'
            }), 401
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'टोकन सत्यापन विफल'
        }), 500


@auth_bp.route('/auth/user', methods=['GET'])
def get_user():
    """Get current user info from token"""
    try:
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                'success': False,
                'error': 'Missing token',
                'message': 'प्रमाणीकरण टोकन आवश्यक है'
            }), 401
        
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return jsonify({
                'success': False,
                'error': 'Invalid token format',
                'message': 'अमान्य टोकन प्रारूप'
            }), 401
        
        result = AuthService.verify_token(token)
        
        if result['success']:
            user_data = AuthService.get_user_by_email(result['data']['email'])
            return jsonify({
                'success': True,
                'data': user_data
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result['error'],
                'message': 'अनधिकृत पहुंच'
            }), 401
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'उपयोगकर्ता जानकारी प्राप्त करने में विफल'
        }), 500
