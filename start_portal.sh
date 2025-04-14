#!/bin/bash

# Change to the project directory
cd /Users/jordiklaris/CascadeProjects/insurance-advisor-portal

# Run the start script
./start.sh

# Kill existing processes
pkill -f "flask"
pkill -f "vite"

# Start backend server
cd /Users/jordiklaris/CascadeProjects/insurance-advisor-portal/backend
python app.py &

# Wait for backend to start
sleep 2

# Start frontend server
cd /Users/jordiklaris/CascadeProjects/insurance-advisor-portal/frontend
npm run dev -- --port 5175 --host &

# Wait for frontend to start
sleep 5

# Open in Safari
open -a Safari http://localhost:5175
