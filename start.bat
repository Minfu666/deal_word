@echo off
echo Starting Backend Server...
cd /d "%~dp0backend"
start cmd /k "C:\Users\33006\anaconda3\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend Server...
cd /d "%~dp0frontend"
start cmd /k "npm run dev"

echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
