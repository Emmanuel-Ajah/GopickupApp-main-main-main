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

echo -e "\nTesting User Login..."
curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  | grep "token"

if [ $? -eq 0 ]; then
    echo "✅ Login endpoint connected!"
else
    echo "❌ Login endpoint failed!"
fi
