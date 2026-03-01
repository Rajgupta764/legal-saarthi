"""
Test app creation to see where JWT import fails
"""
import sys
print("Starting app import test...")
print(f"Python path[0]: {sys.path[0]}")

print("\n1. Testing JWT import directly...")
try:
    from jwt import encode as jwt_encode
    print("✓ JWT import successful")
except Exception as e:
    print(f"❌ JWT import failed: {e}")
    import traceback
    traceback.print_exc()

print("\n2. Importing Flask app factory...")
try:
    from app import create_app
    print("✓ create_app imported")
    
    print("\n3. Creating app...")
    app = create_app()
    print("✓ App created successfully")
except Exception as e:
    print(f"❌ Failed: {e}")
    import traceback
    traceback.print_exc()
