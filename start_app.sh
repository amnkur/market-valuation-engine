#!/usr/bin/env bash

# ========================================================
#   Starting AlphaConstraint Valuation Engine & Web App
# ========================================================

echo "Starting Python Stock & Indian Market API Server on port 5001..."
python3 api_server.py &
API_PID=$!

sleep 2

echo "Starting Vite Frontend Server on port 5173..."
cd ai-infra-valuation-app || exit 1
npm run dev &
FRONTEND_PID=$!

sleep 2

echo "Opening http://localhost:5173 in your default browser..."
if which xdg-open > /dev/null; then
  xdg-open http://localhost:5173
elif which open > /dev/null; then
  open http://localhost:5173
fi

# Clean up child processes when script exits
trap "kill $API_PID $FRONTEND_PID" EXIT
wait
