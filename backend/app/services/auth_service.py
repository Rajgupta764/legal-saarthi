"""
Authentication Service
Handles user registration, login, and JWT token management
"""

import os
import bcrypt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from app.config.mongodb import get_db
from app.models.user import User
import jwt as pyjwt

load_dotenv()

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_EXPIRY_HOURS = int(os.getenv('JWT_EXPIRY_HOURS', '24'))

class AuthService:
    """Service for handling authentication operations"""
    
    @staticmethod
    def hash_password(password):
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password, password_hash):
        """Verify password against hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        except:
            return False
    
    @staticmethod
    def generate_token(user_data, expires_in_hours=JWT_EXPIRY_HOURS):
        """Generate JWT token"""
        payload = {
            'email': user_data.get('email'),
            'name': user_data.get('name'),
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=expires_in_hours)
        }
        return pyjwt.encode(payload, JWT_SECRET, algorithm='HS256')
    
    @staticmethod
    def verify_token(token):
        """Verify and decode JWT token"""
        try:
            decoded = pyjwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            return {'success': True, 'data': decoded}
        except pyjwt.ExpiredSignatureError:
            return {'success': False, 'error': 'Token expired'}
        except pyjwt.InvalidTokenError:
            return {'success': False, 'error': 'Invalid token'}
    
    @staticmethod
    def register_user(email, name, phone, password):
        """Register a new user"""
        db = get_db()
        
        if db is None:
            return {
                'success': False,
                'error': 'Database connection failed',
                'message': 'डेटाबेस से कनेक्शन विफल'
            }
        
        # Check if user already exists
        users_collection = db['users']
        existing_user = users_collection.find_one({'email': email})
        
        if existing_user:
            return {
                'success': False,
                'error': 'Email already exists',
                'message': 'यह ईमेल पहले से पंजीकृत है'
            }
        
        # Validate password
        if len(password) < 6:
            return {
                'success': False,
                'error': 'Password too short',
                'message': 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए'
            }
        
        # Create new user
        user = User(email=email, name=name, phone=phone)
        user.password_hash = AuthService.hash_password(password)
        
        try:
            result = users_collection.insert_one(user.to_dict())
            user_data = {
                'email': email,
                'name': name,
                'phone': phone
            }
            token = AuthService.generate_token(user_data)
            
            return {
                'success': True,
                'message': 'User registered successfully',
                'data': {
                    'user': user.to_response(),
                    'token': token
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'पंजीकरण में विफल'
            }
    
    @staticmethod
    def login_user(email, password):
        """Login user and return JWT token"""
        db = get_db()
        
        if db is None:
            return {
                'success': False,
                'error': 'Database connection failed',
                'message': 'डेटाबेस से कनेक्शन विफल'
            }
        
        users_collection = db['users']
        user_data = users_collection.find_one({'email': email})
        
        if not user_data:
            return {
                'success': False,
                'error': 'Invalid credentials',
                'message': 'गलत ईमेल या पासवर्ड'
            }
        
        if not AuthService.verify_password(password, user_data.get('password_hash', '')):
            return {
                'success': False,
                'error': 'Invalid credentials',
                'message': 'गलत ईमेल या पासवर्ड'
            }
        
        if not user_data.get('is_active', True):
            return {
                'success': False,
                'error': 'Account disabled',
                'message': 'आपका खाता अक्षम है'
            }
        
        user = User.from_dict(user_data)
        user_response = user.to_response()
        token = AuthService.generate_token(user_response)
        
        return {
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user_response,
                'token': token
            }
        }
    
    @staticmethod
    def get_user_by_email(email):
        """Get user by email"""
        db = get_db()
        
        if db is None:
            return None
        
        users_collection = db['users']
        user_data = users_collection.find_one({'email': email})
        
        if user_data:
            user = User.from_dict(user_data)
            return user.to_response()
        
        return None
