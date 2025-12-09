#!/bin/bash

# Start backend in background
echo "🚀 Iniciando Backend..."
cd backend
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend falhou ao iniciar"
    cat /tmp/backend.log
    exit 1
fi

echo "✅ Backend iniciado"

# Back to root
cd ..

# Start frontend
echo "🚀 Iniciando Frontend..."
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
