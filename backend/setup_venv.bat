@echo off
echo ============================================
echo  Loan Approval Platform - Backend Setup
echo ============================================
echo.

echo [1/4] Creating Python virtual environment...
python -m venv .venv
if errorlevel 1 (
    echo ERROR: Failed to create venv. Make sure Python 3.10+ is installed.
    pause
    exit /b 1
)

echo [2/4] Activating virtual environment...
call .venv\Scripts\activate.bat

echo [3/4] Upgrading pip...
python -m pip install --upgrade pip --quiet

echo [4/4] Installing dependencies (scikit-learn pinned to 1.6.1)...
pip install -r requirements.txt

echo.
echo ============================================
echo  Setup complete!
echo  To start the backend:
echo    .venv\Scripts\activate
echo    uvicorn main:app --reload --port 8000
echo ============================================
pause
