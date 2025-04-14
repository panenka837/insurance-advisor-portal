#!/bin/bash

# Start backend
cd "$(dirname "$0")/backend"
python app.py &

# Wait a bit for backend to start
sleep 2

# Start frontend
cd ../frontend
npm run dev
