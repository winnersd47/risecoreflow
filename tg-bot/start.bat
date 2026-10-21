@echo off
cd /d "%~dp0"

if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

call .venv\Scripts\activate

echo Installing/updating dependencies...
pip install -r requirements.txt -q

echo.
echo Starting AIGrowth Unified Bot...
echo.
python bot.py
pause
