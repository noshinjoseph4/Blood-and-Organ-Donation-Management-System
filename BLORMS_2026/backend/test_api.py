import requests
import random
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_register():
    suffix = random.randint(1000, 9999)
    username = f"testuser_{suffix}"
    email = f"test_{suffix}@example.com"
    
    url = f"{BASE_URL}/register/"
    data = {
        "username": username,
        "email": email,
        "password": "securepass123",
        "donor_profile": {
            "blood_group": "O+",
            "latitude": 34.0522,
            "longitude": -118.2437
        }
    }
    print(f"Testing Register: {url}")
    print(f"Username: {username}")
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    return username, response.status_code == 201

def test_login(username):
    url = f"{BASE_URL}/login/"
    data = {
        "username": username,
        "password": "securepass123"
    }
    print(f"\nTesting Login: {url}")
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        return response.json().get('token')
    return None

def test_profile(token):
    url = f"{BASE_URL}/profile/"
    headers = {"Authorization": f"Token {token}"}
    print(f"\nTesting Profile: {url}")
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    return response.status_code == 200

if __name__ == "__main__":
    username, success = test_register()
    if success:
        token = test_login(username)
        if token:
            test_profile(token)
