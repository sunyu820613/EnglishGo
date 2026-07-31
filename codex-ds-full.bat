@echo off
setlocal

REM =========================
REM Codex + DeepSeek Full Access
REM =========================

set "MODEL=deepseek/deepseek-v4-flash"
set "PROJECT_DIR=%~dp0"

REM 自动查找最新 codex.exe
for /f "delims=" %%I in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path $env:LOCALAPPDATA\OpenAI\Codex\bin -Recurse -Filter codex.exe | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName"') do set "CODEX_EXE=%%I"

if not defined CODEX_EXE (
    echo [ERROR] codex.exe not found.
    echo Please check: %LOCALAPPDATA%\OpenAI\Codex\bin
    pause
    exit /b 1
)

if not defined OPENROUTER_API_KEY (
    echo [WARNING] OPENROUTER_API_KEY is not set.
    echo Please set it first:
    echo setx OPENROUTER_API_KEY "sk-or-v1-your-key"
    pause
    exit /b 1
)

echo Using Codex:
echo %CODEX_EXE%
echo.
echo Model:
echo %MODEL%
echo.
echo Project:
echo %PROJECT_DIR%
echo.

if exist "%PROJECT_DIR%" (
    pushd "%PROJECT_DIR%"
) else (
    echo [WARNING] Project directory not found: %PROJECT_DIR%
    echo Starting from current directory instead.
)

"%CODEX_EXE%" -m "%MODEL%" --dangerously-bypass-approvals-and-sandbox

set "EXIT_CODE=%ERRORLEVEL%"

if exist "%PROJECT_DIR%" (
    popd
)

echo.
echo Codex exited with code %EXIT_CODE%.
pause
exit /b %EXIT_CODE%