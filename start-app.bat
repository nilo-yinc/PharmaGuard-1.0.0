@echo off
echo Starting PharmaGuard System...

:: Start Express Backend
start "Express Service" cmd /k "cd backend\express-service && npm start"

:: Start FastAPI Service
start "FastAPI Service" cmd /k "cd backend\fastapi-service && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: Start Frontend (wait a bit for backends)
timeout /t 5
start "Frontend" cmd /k "cd frontend && npm run dev"

echo All services started!
