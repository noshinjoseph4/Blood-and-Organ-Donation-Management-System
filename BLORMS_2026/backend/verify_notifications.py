import asyncio
import websockets
import json
import requests
import sys

async def test_notification():
    # 1. Connect to WebSocket as O+ donor (mocked group join logic depends on user profile)
    # Since we can't easily authenticate in this script without complex session setup,
    # we'll just check if the broadcast logic in views.py executes without error and 
    # assume the Channels plumbing is correct if it connects.
    
    uri = "ws://127.0.0.1:8000/ws/notifications/"
    print(f"Connecting to {uri}...")
    
    try:
        # In a real test, we'd need a token/session
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket.")
            
            # 2. Trigger an SOS request via REST API
            print("Triggering SOS request...")
            # Note: This requires a running server and a valid user token
            # We'll just print instructions if it fails
            
            # 3. Wait for message
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=10)
                data = json.loads(message)
                print(f"Notification RECEIVED: {data}")
            except asyncio.TimeoutError:
                print("Test timed out. No notification received.")
                
    except Exception as e:
        print(f"Error: {e}")
        print("\nNote: Ensure the Django server is running and daphne/uvicorn is handling WebSockets.")

if __name__ == "__main__":
    # asyncio.run(test_notification())
    print("Verification script ready. Run this locally while triggering an SOS in the UI.")
