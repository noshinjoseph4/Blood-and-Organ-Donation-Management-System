import requests
import random
import json

BASE_URL = "http://127.0.0.1:8000/api"

def get_auth_token():
    suffix = random.randint(10000, 99999)
    username = f"requester_{suffix}"
    email = f"req_{suffix}@example.com"
    password = "securepass123"
    
    # Register
    reg_resp = requests.post(f"{BASE_URL}/register/", json={
        "username": username, "email": email, "password": password,
        "donor_profile": {"blood_group": "A+", "latitude": 40.7128, "longitude": -74.0060}
    })
    print(f"Register Status: {reg_resp.status_code}")
    print(f"Register Response: {reg_resp.text}")
    
    # Login
    resp = requests.post(f"{BASE_URL}/login/", json={
        "username": username, "password": password
    })
    print(f"Login Status: {resp.status_code}")
    try:
        data = resp.json()
        print(f"Login Response: {data}")
        return data.get('token')
    except Exception as e:
        print(f"Login JSON Error: {e}")
        print(f"Login Response Text: {resp.text}")
        return None

def test_create_request(token):
    url = f"{BASE_URL}/requests/create/"
    headers = {"Authorization": f"Token {token}"}
    data = {
        "request_type": "BLOOD",
        "blood_group": "A+",
        "latitude": 40.7306,
        "longitude": -73.9352,
        "is_urgent": True
    }
    print(f"\nTesting Create Request: {url}")
    resp = requests.post(url, headers=headers, json=data)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
    return resp.status_code == 201

def test_list_requests():
    url = f"{BASE_URL}/requests/"
    print(f"\nTesting List Requests: {url}")
    resp = requests.get(url)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
    return resp.status_code == 200

if __name__ == "__main__":
    token = get_auth_token()
    if token:
        if test_create_request(token):
            test_list_requests()
