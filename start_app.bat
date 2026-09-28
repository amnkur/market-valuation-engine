@echo off
title BWB AlphaConstraint Runner
echo ========================================================
echo   Starting BWB AlphaConstraint Valuation Engine & App
echo ========================================================
echo.
echo [1/2] Starting Python Stock & Indian Market API Server on port 5001...
start "Python Stock API Server (Port 5001)" cmd /k "python api_server.py"
timeout /t 2 /nobreak >nul

echo [2/2] Starting Vite Frontend Server on port 5173...
cd ai-infra-valuation-app
start "Vite Web Server (Port 5173)" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo Opening app in your default browser...
start http://localhost:5173
echo.
echo All services running! Keep the terminal windows open.
pause
