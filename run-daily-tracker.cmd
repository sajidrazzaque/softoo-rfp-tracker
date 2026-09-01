@echo off
setlocal
rem Daily Softoo tracker run. Task Scheduler: Mon-Fri 19:00 Asia/Karachi.
rem Sweeps sources, updates index.html, verifies, commits and pushes to main.
rem Two Windows gotchas this script works around:
rem   1. claude is a .cmd shim, so it must be invoked with CALL or control never returns.
rem   2. no delayed expansion: a !VAR! redirect can be taken literally by the shim's
rem      own setlocal, which silently creates a file named "!LOG!" instead of logging.

set "REPO=%~dp0"
cd /d "%REPO%" || (echo Cannot cd to %REPO% & exit /b 1)

if not exist "%REPO%logs" mkdir "%REPO%logs"
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HHmm"') do set "STAMP=%%i"
set "LOG=%REPO%logs\run-%STAMP%.log"
set "RC=0"

echo ================================================== >> "%LOG%" 2>&1
echo Softoo tracker run started %STAMP% (local time) >> "%LOG%" 2>&1
echo ================================================== >> "%LOG%" 2>&1

echo --- preflight --- >> "%LOG%" 2>&1
where claude >> "%LOG%" 2>&1
if errorlevel 1 (
  echo FAIL: claude is not on PATH for this task. Point the task action at the full >> "%LOG%" 2>&1
  echo path of claude.cmd, or add it to the system PATH. >> "%LOG%" 2>&1
  set "RC=1"
  goto :done
)
call claude --version >> "%LOG%" 2>&1
where node >> "%LOG%" 2>&1
if errorlevel 1 echo WARN: node not on PATH, the Step 2b syntax gate cannot run. >> "%LOG%" 2>&1
git --version >> "%LOG%" 2>&1

echo --- git pull --rebase --- >> "%LOG%" 2>&1
git pull --rebase origin main >> "%LOG%" 2>&1

echo --- claude headless run --- >> "%LOG%" 2>&1
call claude -p "Read softoo-tracker-guide.md in this folder and follow it end to end for today's run: gather today's data, update the three data arrays and the Generated date in index.html, run the Step 2b verification, then commit and push to main. Do not redesign the page. Do not pad the data." --output-format text >> "%LOG%" 2>&1
set "RC=%ERRORLEVEL%"

:done
echo --- result --- >> "%LOG%" 2>&1
echo claude exit code: %RC% >> "%LOG%" 2>&1
git log --oneline -2 >> "%LOG%" 2>&1
git status --short --branch >> "%LOG%" 2>&1

if not "%RC%"=="0" (
  echo RUN DID NOT COMPLETE. Exit code %RC%. See the output above. >> "%LOG%" 2>&1
  echo A 401 or "OAuth access token has expired" means Claude Code needs signing in again: >> "%LOG%" 2>&1
  echo run claude interactively in this folder, or set ANTHROPIC_API_KEY for unattended runs. >> "%LOG%" 2>&1
  echo If index.html was changed but not pushed, review it and push manually. >> "%LOG%" 2>&1
)

endlocal & exit /b %RC%
