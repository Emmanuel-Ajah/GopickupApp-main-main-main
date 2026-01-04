#!/bin/bash

BASE_URL="http://localhost:5000/api/auth"

echo "Checking API Health..."
curl -s -X GET http://localhost:5000/ | grep "GoPickup API is running"
if [ $? -eq 0 ]; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
fi

echo -e "\nTesting User Registration..."
curl -s -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}' \
  | grep -E "token|User already exists"

if [ $? -eq 0 ]; then
    echo "✅ Registration endpoint connected!"
else
    echo "❌ Registration endpoint failed!"
fi

echo -e "\nTesting User Login and Capturing Token..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo "✅ Login successful, token captured!"
    
    echo -e "\nTesting /me Endpoint (Authenticated)..."
    ME_RESPONSE=$(curl -s -X GET $BASE_URL/me \
      -H "Authorization: Bearer $TOKEN")
    
    echo $ME_RESPONSE | grep -E "name|email|userId"
    
    if [ $? -eq 0 ]; then
        echo "✅ /me endpoint verified with authentication!"
    else
        echo "❌ /me endpoint verification failed!"
    fi
else
    echo "❌ Login failed, could not capture token for /me test!"
fi
