"""
Check JWT module import
"""
import sys

print("Python version:", sys.version)
print("\nTrying to import jwt...")

try:
    import jwt
    print(f"✓ jwt imported successfully")
    print(f"  Module path: {jwt.__file__}")
    print(f"  Module version: {getattr(jwt, '__version__', 'unknown')}")
    print(f"  Has encode: {hasattr(jwt, 'encode')}")
    print(f"  Has decode: {hasattr(jwt, 'decode')}")
    print(f"  Module attributes: {[attr for attr in dir(jwt) if not attr.startswith('_')]}")
    
    # Try to encode a test token
    print("\nTrying to encode a test token...")
    test_payload = {'test': 'data'}
    token = jwt.encode(test_payload, 'secret', algorithm='HS256')
    print(f"✓ Token created: {token[:50]}...")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
