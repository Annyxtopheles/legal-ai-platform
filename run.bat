@echo off
echo ========================================================
echo   Smart AI Legal Automation & Document Generator Platform
echo ========================================================
echo.
echo Starting FastAPI Server on http://127.0.0.1:8000 ...
cd /d "%~dp0backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
