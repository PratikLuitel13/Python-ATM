@echo off
cd /d "%~dp0"

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py run.py
) else (
    python run.py
)

if errorlevel 1 (
    echo.
    echo Failed to start the ATM app.
    echo Make sure Python is installed and added to PATH.
    echo.
    pause
)
