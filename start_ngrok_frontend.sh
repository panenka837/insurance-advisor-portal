#!/bin/bash
# Script om frontend én Ngrok tunnel te starten voor Insurance Advisor Portal

# Start frontend (Vite, poort 5175)
echo "[INFO] Start frontend server op poort 5175..."
cd frontend
npm run dev -- --port 5175 --host &
FRONTEND_PID=$!
cd ..

# Wacht even zodat Vite kan opstarten
sleep 3

echo "[INFO] Start ngrok tunnel op poort 5175..."
ngrok http 5175

# Als ngrok stopt, frontend ook stoppen
echo "[INFO] Stop frontend server (PID $FRONTEND_PID)"
kill $FRONTEND_PID
