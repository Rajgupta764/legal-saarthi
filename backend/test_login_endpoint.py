"""
Test login endpoint with requests
"""
import requests
import json

# Test login endpoint
url = "http://localhost:5000/api/auth/login"
headers = {"Content-Type": "application/json"}

# Test with any credentials to see the error
payload = {
    "email": "raj@gmail.com",
    "password": "test123"
}

print("Testing login endpoint...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print("\nSending request...")

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"\nResponse Body:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
except Exception as e:
    print(f"\nError: {str(e)}")
    import traceback
    traceback.print_exc()
