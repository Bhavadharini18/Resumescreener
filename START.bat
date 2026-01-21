"""
Windows Batch Script to Start Resume Screening System
This script automates the startup process
"""

@echo off
setlocal enabledelayedexpansion

title Resume Screening System - Startup

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  Resume Screening and Skill Matching System               ║
echo ║  Startup Script                                            ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8 or higher.
    echo    Visit: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✓ Python found

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip not found!
    pause
    exit /b 1
)

echo ✓ pip found

REM Check if requirements are installed
echo.
echo ═══════════════════════════════════════════════════════════
echo Checking dependencies...
echo ═══════════════════════════════════════════════════════════

python -c "import fastapi; import streamlit; import sentence_transformers; import spacy" >nul 2>&1

if errorlevel 1 (
    echo.
    echo ❌ Some dependencies are missing!
    echo.
    echo Installing requirements...
    pip install -r requirements.txt
    
    if errorlevel 1 (
        echo ❌ Failed to install requirements
        pause
        exit /b 1
    )
)

echo ✓ All dependencies installed

REM Download SpaCy model
echo.
echo ═══════════════════════════════════════════════════════════
echo Checking SpaCy models...
echo ═══════════════════════════════════════════════════════════

python -c "import spacy; spacy.load('en_core_web_sm')" >nul 2>&1

if errorlevel 1 (
    echo.
    echo SpaCy model not found. Downloading...
    python -m spacy download en_core_web_sm
)

echo ✓ SpaCy model ready

REM Display menu
:menu
echo.
echo ═══════════════════════════════════════════════════════════
echo STARTUP OPTIONS
echo ═══════════════════════════════════════════════════════════
echo.
echo 1. Start Backend API only (localhost:8000)
echo 2. Start Streamlit UI only (localhost:8501)
echo 3. Start Both Backend and UI (recommended)
echo 4. Run Tests and Validation
echo 5. View Documentation
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto start_streamlit
if "%choice%"=="3" goto start_both
if "%choice%"=="4" goto run_tests
if "%choice%"=="5" goto view_docs
if "%choice%"=="6" goto exit
goto menu

:start_backend
echo.
echo Starting Backend API...
echo.
echo ✓ Backend API will start at http://localhost:8000
echo ✓ API Documentation at http://localhost:8000/docs
echo ✓ Press Ctrl+C to stop
echo.
cd backend_py
python app.py
pause
goto menu

:start_streamlit
echo.
echo Starting Streamlit UI...
echo.
echo ✓ UI will open at http://localhost:8501
echo ✓ Make sure Backend API is running first!
echo ✓ Press Ctrl+C to stop
echo.
streamlit run streamlit_app.py
pause
goto menu

:start_both
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║  Starting Both Backend API and Streamlit UI               ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo ⚠ This script will open two windows:
echo   1. Backend API (http://localhost:8000)
echo   2. Streamlit UI (http://localhost:8501)
echo.
echo Press any key to continue...
pause

echo.
echo Starting Backend API (in new window)...
start cmd /k "cd backend_py & python app.py"

timeout /t 3 /nobreak

echo Starting Streamlit UI (in new window)...
start cmd /k "streamlit run streamlit_app.py"

echo.
echo ✓ Both services are starting...
echo.
echo URLs:
echo   • Backend API: http://localhost:8000
echo   • API Docs: http://localhost:8000/docs
echo   • Streamlit UI: http://localhost:8501
echo.
echo The windows will stay open. Close them to stop services.
echo.
pause
goto menu

:run_tests
echo.
echo Running validation tests...
echo.
python TESTING_GUIDE.py
echo.
pause
goto menu

:view_docs
echo.
echo Opening documentation...
echo.
echo Available documentation files:
echo   1. README_SYSTEM.md - Complete system documentation
echo   2. QUICKSTART.py - Quick start guide
echo   3. TESTING_GUIDE.py - Validation tests
echo   4. PROJECT_SUMMARY.md - Project summary
echo   5. INDEX.py - Project index
echo.
echo Opening README_SYSTEM.md...
if exist README_SYSTEM.md (
    start notepad README_SYSTEM.md
) else (
    echo File not found!
)
pause
goto menu

:exit
echo.
echo Thank you for using Resume Screening System!
echo.
exit /b 0
