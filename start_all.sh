#!/bin/bash

# Family Health Copilot - Full Stack Startup Script

echo "🚀 Starting Family Health Copilot Full Stack..."
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Kill any process using port 8000 (conflicting port)
if check_port 8000; then
    echo "⚠️  Port 8000 is in use, stopping conflicting service..."
    fuser -k 8000/tcp 2>/dev/null || true
    sleep 2
fi

# Start backend if not running
if check_port 8003; then
    echo "✅ Backend already running on port 8003"
else
    echo "🔧 Starting backend server..."
    source ~/anaconda3/etc/profile.d/conda.sh
    conda activate medgemma15
    cd /mnt/hdd/data/family_health_copilot/backend

    # Start backend in background
    nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8003 > /tmp/backend_server.log 2>&1 &
    echo "⏳ Waiting for backend to start..."
    sleep 5

    # Wait for backend to be actually ready (not just port open)
    echo "🔄 Waiting for backend models to load (this may take 1-2 minutes)..."
    MAX_WAIT=120  # 2 minutes
    WAIT_TIME=0
    while [ $WAIT_TIME -lt $MAX_WAIT ]; do
        if curl -s http://127.0.0.1:8003/health > /dev/null 2>&1; then
            echo "✅ Backend is ready and models are loaded!"
            break
        fi
        echo "⏳ Backend still loading... ($WAIT_TIME/$MAX_WAIT seconds)"
        sleep 5
        WAIT_TIME=$((WAIT_TIME + 5))
    done

    if [ $WAIT_TIME -ge $MAX_WAIT ]; then
        echo "❌ Backend failed to become ready. Check logs: /tmp/backend_server.log"
        exit 1
    fi
fi

# Start frontend if not running
if check_port 3002; then
    echo "✅ Frontend already running on port 3002"
else
    echo "🔧 Starting frontend server..."
    source ~/.nvm/nvm.sh
    nvm use 22
    cd /mnt/hdd/data/family_health_copilot/frontend

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi

    # Start frontend
    echo "🌐 Starting Next.js development server on port 3002..."
    PORT=3002 npm run dev > /tmp/frontend_node22.log 2>&1 &
    FRONTEND_PID=$!

    echo "⏳ Waiting for frontend to start..."
    sleep 5

    if check_port 3002; then
        echo "✅ Frontend started successfully"
    else
        echo "⚠️ Frontend may still be starting..."
    fi
fi

echo ""
echo "🎉 Family Health Copilot is ready!"
echo ""
echo "📱 Frontend: http://localhost:3002"
echo "🔧 Backend API: http://localhost:8003"
echo "📚 API Docs: http://localhost:8003/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
