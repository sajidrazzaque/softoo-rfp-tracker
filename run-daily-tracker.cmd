@echo off
setlocal enabledelayedexpansion
rem Daily Softoo tracker run. Wired to Task Scheduler: Mon-Fri 19:00 Asia/Karachi.
rem Sweeps sources, updates index.html, verifies, commits and pushes to main.
rem Vercel auto-deploys from the push.

set "REPO=%~dp0"
cd /d "%REPO%" || (echo Cannot cd to %REPO% & exit /b 1)

if not exist "%REPO%logs" mkdir "%REPO%logs"
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HHmm"') do set "STAMP=%%i"
set "LOG=%REPO%logs\run-!STAMP!.log"

echo ================================================== >> "!LOG!" 2>&1
echo Softoo tracker run started !STAMP! (local time) >> "!LOG!" 2>&1
echo ================================================== >> "!LOG!" 2>&1

echo --- git pull --rebase --- >> "!LOG!" 2>&1
git pull --rebase origin main >> "!LOG!" 2>&1

where claude >nul 2>&1 || (echo FAIL: claude is not on PATH for this task. Set the task action to the full path of claude.cmd, or add it to the system PATH. >> "!LOG!" 2>&1 & endlocal & exit /b 1)
where node >nul 2>&1 || echo WARN: node not on PATH, the Step 2b syntax gate will be skipped by the run. >> "!LOG!" 2>&1
echo --- claude headless run --- >> "!LOG!" 2>&1
claude -p "Read softoo-tracker-guide.md in this folder and follow it end to end for today's run: gather today's data, update the three data arrays and the Generated date in index.html, run the Step 2b verification, then commit and push to main. Do not redesign the page. Do not pad the data." --output-format text >> "!LOG!" 2>&1
set "RC=%ERRORLEVEL%"

echo --- result --- >> "!LOG!" 2>&1
echo claude exit code: !RC! >> "!LOG!" 2>&1
git log --oneline -2 >> "!LOG!" 2>&1
git status --short --branch >> "!LOG!" 2>&1

if not "!RC!"=="0" (
  echo RUN DID NOT COMPLETE. Exit code !RC!. See the claude output above. >> "!LOG!" 2>&1
  echo If index.html was changed but not pushed, review it and push manually. >> "!LOG!" 2>&1
)

endlocal & exit /b %RC%
