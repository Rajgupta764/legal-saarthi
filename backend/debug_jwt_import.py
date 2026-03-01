"""
Debug JWT import from app context
"""
import sys
print("Python path:")
for i, p in enumerate(sys.path):
    print(f"{i}: {p}")

print("\n" + "="*60)
print("Attempting to import jwt...")

try:
    import jwt
    print(f"✓ JWT module imported")
    print(f"  Location: {jwt.__file__ if hasattr(jwt, '__file__') else 'unknown'}")
    print(f"  Has encode: {hasattr(jwt, 'encode')}")
    print(f"  Module attributes: {[attr for attr in dir(jwt) if not attr.startswith('_')][:10]}")
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
print("Attempting to import from jwt...")

try:
    from jwt import encode, decode
    print("✓ Successfully imported encode and decode from jwt")
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
