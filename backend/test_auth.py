"""
Test authentication service directly
"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.auth_service import AuthService
from app.config.mongodb import get_db

def test_database_connection():
    """Test database connection"""
    print("Testing database connection...")
    db = get_db()
    if db is None:
        print("❌ Database connection failed")
        return False
    print("✓ Database connected")
    return True

def test_list_users():
    """List all users in database"""
    print("\nListing all users...")
    db = get_db()
    if db is None:
        print("❌ Database connection failed")
        return
    
    users = db['users'].find()
    user_list = list(users)
    print(f"Found {len(user_list)} users:")
    for user in user_list:
        print(f"  - Email: {user.get('email')} | Name: {user.get('name')}")

def test_login(email, password):
    """Test login with specific credentials"""
    print(f"\nTesting login for: {email}")
    result = AuthService.login_user(email, password)
    
    if result['success']:
        print("✓ Login successful!")
        print(f"  User: {result['data']['user']}")
        print(f"  Token: {result['data']['token'][:50]}...")
    else:
        print(f"❌ Login failed: {result.get('error')}")
        print(f"   Message: {result.get('message')}")

if __name__ == '__main__':
    # Test database connection
    if not test_database_connection():
        sys.exit(1)
    
    # List all users
    test_list_users()
    
    # Test login with a specific user (update these credentials)
    print("\n" + "="*50)
    test_email = input("Enter email to test login (or press Enter to skip): ").strip()
    if test_email:
        test_password = input("Enter password: ").strip()
        test_login(test_email, test_password)
