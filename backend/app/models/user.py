"""
User Model for MongoDB
"""

from datetime import datetime
from bson.objectid import ObjectId

class User:
    """User model for authentication"""
    
    def __init__(self, email, name=None, phone=None, password_hash=None):
        self.email = email
        self.name = name
        self.phone = phone
        self.password_hash = password_hash
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_active = True
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'password_hash': self.password_hash,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'is_active': self.is_active
        }
    
    @staticmethod
    def from_dict(data):
        """Create user object from dictionary"""
        user = User(
            email=data.get('email'),
            name=data.get('name'),
            phone=data.get('phone'),
            password_hash=data.get('password_hash')
        )
        if 'created_at' in data:
            user.created_at = data['created_at']
        if 'updated_at' in data:
            user.updated_at = data['updated_at']
        if 'is_active' in data:
            user.is_active = data['is_active']
        return user
    
    def to_response(self):
        """Convert user to response dictionary (without password hash)"""
        return {
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }
