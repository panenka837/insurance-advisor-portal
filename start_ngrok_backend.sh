#!/bin/bash
# Script om backend én Ngrok tunnel te starten voor Insurance Advisor Portal

# Start backend (pas eventueel pad/commando aan)
echo "[INFO] Start backend server op poort 5000..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wacht even zodat backend kan opstarten
sleep 3

echo "[INFO] Start ngrok tunnel op poort 5000..."
ngrok http 5000

# Als ngrok stopt, backend ook stoppen
echo "[INFO] Stop backend server (PID $BACKEND_PID)"
kill $BACKEND_PID
