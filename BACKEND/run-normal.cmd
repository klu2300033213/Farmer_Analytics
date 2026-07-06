@echo off
cd /d "%~dp0"
set "BACKEND_PID="
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
	set "BACKEND_PID=%%a"
	goto :backend_running
)

echo Starting backend on port 8080 (profile: normal)...
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=normal
goto :eof

:backend_running
echo Backend is already running on port 8080 (PID %BACKEND_PID%).
echo Open API at http://localhost:8080
