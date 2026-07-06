@echo off
setlocal

set "ROOT=%~dp0"

echo === Farmer Analytics Safe Launcher ===

set "BACKEND_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
  set "BACKEND_PID=%%a"
  goto :backend_checked
)

echo Starting backend...
start "backend" cmd /k "cd /d "%ROOT%BACKEND" && mvnw.cmd spring-boot:run"
goto :frontend_check

:backend_checked
echo Backend already running on 8080 (PID %BACKEND_PID%).

:frontend_check
set "FRONTEND_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
  set "FRONTEND_PID=%%a"
  goto :frontend_checked
)

echo Starting frontend...
start "frontend" cmd /k "cd /d "%ROOT%Frontend" && npm run dev"
goto :pdfengine_check

:frontend_checked
echo Frontend already running on 5173 (PID %FRONTEND_PID%).

:pdfengine_check
set "PDFENGINE_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5001" ^| findstr "LISTENING"') do (
  set "PDFENGINE_PID=%%a"
  goto :pdfengine_checked
)

echo Starting PDF Engine...
start "pdf-engine" cmd /k "cd /d "%ROOT%pdf-engine" && node server.js"
goto :done

:pdfengine_checked
echo PDF Engine already running on 5001 (PID %PDFENGINE_PID%).

:done
echo.
echo Open: http://localhost:5173
echo API : http://localhost:8080
endlocal
