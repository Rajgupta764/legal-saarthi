"""
Test full auth flow: signup + login
"""
import requests
import json
import random

# Generate unique email for testing
random_num = random.randint(1000, 9999)
test_user = {
    "name": "Test User",
    "email": f"test{random_num}@test.com",
    "phone": "9876543210",
    "password": "test123"
}

base_url = "http://localhost:5000/api"

print("=" * 60)
print("TESTING SIGNUP")
print("=" * 60)
print(f"Creating user: {test_user['email']}")

# Test signup
try:
    response = requests.post(f"{base_url}/auth/signup", json=test_user)
    print(f"\nSignup Status Code: {response.status_code}")
    print("Signup Response:")
    signup_result = response.json()
    print(json.dumps(signup_result, indent=2))
    
    if response.status_code != 201:
        print("\n❌ Signup failed!")
        exit(1)
    print("\n✓ Signup successful!")
except Exception as e:
    print(f"\n❌ Signup error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\n" + "=" * 60)
print("TESTING LOGIN")
print("=" * 60)
print(f"Logging in as: {test_user['email']}")

# Test login with the newly created user
login_data = {
    "email": test_user['email'],
    "password": test_user['password']
}

try:
    response = requests.post(f"{base_url}/auth/login", json=login_data)
    print(f"\nLogin Status Code: {response.status_code}")
    print("Login Response:")
    try:
        login_result = response.json()
        print(json.dumps(login_result, indent=2))
        
        if response.status_code == 200:
            print("\n✓ Login successful!")
            print(f"Token received: {login_result['data']['token'][:50]}...")
        else:
            print(f"\n❌ Login failed with status {response.status_code}")
    except Exception as json_error:
        print(f"Failed to parse JSON response: {json_error}")
        print(f"Raw response: {response.text}")
except Exception as e:
    print(f"\n❌ Login error: {str(e)}")
    import traceback
    traceback.print_exc()
