"""
Test authentication service directly - non-interactive version
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
        return []
    
    users = db['users'].find()
    user_list = list(users)
    print(f"Found {len(user_list)} users:")
    for user in user_list:
        print(f"  - Email: {user.get('email')} | Name: {user.get('name')} | Has password: {bool(user.get('password_hash'))}")
    return user_list

def test_login(email, password):
    """Test login with specific credentials"""
    print(f"\nTesting login for: {email}")
    try:
        result = AuthService.login_user(email, password)
        
        if result['success']:
            print("✓ Login successful!")
            print(f"  User: {result['data']['user']}")
            print(f"  Token: {result['data']['token'][:50]}...")
            return True
        else:
            print(f"❌ Login failed: {result.get('error')}")
            print(f"   Message: {result.get('message')}")
            return False
    except Exception as e:
        print(f"❌ Exception during login: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    # Test database connection
    if not test_database_connection():
        sys.exit(1)
    
    # List all users
    users = test_list_users()
    
    # If there are users, test login with a dummy password
    if users:
        print("\n" + "="*50)
        print("Testing login with first user and dummy password...")
        test_email = users[0]['email']
        test_login(test_email, "wrongpassword")
