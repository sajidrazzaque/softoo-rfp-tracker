@echo off
setlocal
rem Daily Softoo tracker run. Task Scheduler: Mon-Fri 18:00 Asia/Karachi (moved from 19:00 on 20 Nov 2026).
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
rem Claude Code's Bash tool inherits this process's PATH. On 10 Sep 2026 a full sweep
rem completed but could not commit: node and git were not on that PATH, so
rem "node verify-tracker.js" and "git status" returned command not found, and the
rem absolute-path forms were refused by the permission allow-list (which matches
rem bare tokens only). Prepending both directories fixes it for the child process.
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
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

rem A crashed or interrupted run can leave a .git lock behind, which makes every later
rem "git add" fail. Sweep locks older than 10 minutes; a live git process never has one that old.
echo --- stale git locks --- >> "%LOG%" 2>&1
powershell -NoProfile -Command "Get-ChildItem -Path '.git' -Filter '*.lock' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt (Get-Date).AddMinutes(-10) } | ForEach-Object { Write-Output ('removing stale lock: ' + $_.FullName); Remove-Item -Force -LiteralPath $_.FullName }" >> "%LOG%" 2>&1
echo --- git pull --rebase --- >> "%LOG%" 2>&1
git pull --rebase origin main >> "%LOG%" 2>&1

echo --- working tree before run --- >> "%LOG%" 2>&1
git status --short >> "%LOG%" 2>&1
echo --- claude headless run --- >> "%LOG%" 2>&1
call claude -p "Read softoo-tracker-guide.md in this folder and follow it end to end for today's run: gather today's data, update the three data arrays and the Generated date in index.html, and run the Step 2b verification. DO NOT RUN ANY GIT COMMAND. This script commits and pushes after you exit. Do not redesign the page. Do not pad the data." --output-format text >> "%LOG%" 2>&1
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" goto :done

rem ---------------------------------------------------------------------------
rem Commit and push here, not inside Claude.
rem
rem Three runs (19, 20 and 23 Nov 2026) did the whole sweep, passed verification,
rem then failed at the last step because the run wrote a multi-line -m string and
rem the permission matcher refused a command spanning newlines. The guide has told
rem it to keep -m on one line since 20 Nov. On 23 Nov it added a Co-Authored-By
rem trailer anyway and three days of data sat unpublished.
rem
rem A written rule has now failed three times, so git no longer depends on one.
rem The message below cannot grow a newline by accident.
rem ---------------------------------------------------------------------------
echo --- changes produced by the sweep --- >> "%LOG%" 2>&1
git status --porcelain >> "%LOG%" 2>&1
for /f %%c in ('git status --porcelain ^| find /c /v ""') do set "NCHANGED=%%c"
if "%NCHANGED%"=="0" goto :nodata

for /f %%d in ('powershell -NoProfile -Command "Get-Date -Format \"d MMM yyyy\""') do set "TODAY=%%d"
echo --- commit and push --- >> "%LOG%" 2>&1
git add -A >> "%LOG%" 2>&1
git commit -m "Daily tracker update %TODAY%" >> "%LOG%" 2>&1
if errorlevel 1 goto :commitfail
git pull --rebase origin main >> "%LOG%" 2>&1
git push origin main >> "%LOG%" 2>&1
if errorlevel 1 goto :pushfail

rem Prove it landed rather than trusting the exit code.
git fetch origin main >> "%LOG%" 2>&1
for /f %%h in ('git rev-parse HEAD') do set "LOCALSHA=%%h"
for /f %%h in ('git rev-parse origin/main') do set "REMOTESHA=%%h"
if not "%LOCALSHA%"=="%REMOTESHA%" goto :notlanded
echo PUSH CONFIRMED: %LOCALSHA% is on origin/main. Vercel will deploy. >> "%LOG%" 2>&1
goto :done

:nodata
echo FAIL: the sweep produced NO FILE CHANGES. >> "%LOG%" 2>&1
echo Nothing was committed, so the live site still shows the previous run. >> "%LOG%" 2>&1
echo This is a real failure, not a quiet day: a quiet day still updates the >> "%LOG%" 2>&1
echo Generated date and the delta note in index.html. >> "%LOG%" 2>&1
set "RC=2"
goto :done

:commitfail
echo FAIL: git commit failed. Files are staged but not committed. >> "%LOG%" 2>&1
set "RC=3"
goto :done

:pushfail
echo FAIL: git push failed. The commit exists locally but is not on origin. >> "%LOG%" 2>&1
echo Run: git push origin main >> "%LOG%" 2>&1
set "RC=4"
goto :done

:notlanded
echo FAIL: push reported success but origin/main does not match HEAD. >> "%LOG%" 2>&1
echo local  %LOCALSHA% >> "%LOG%" 2>&1
echo origin %REMOTESHA% >> "%LOG%" 2>&1
set "RC=5"
goto :done

:done
echo --- result --- >> "%LOG%" 2>&1
echo claude exit code: %RC% >> "%LOG%" 2>&1
git log --oneline -2 >> "%LOG%" 2>&1
git status --short --branch >> "%LOG%" 2>&1

if not "%RC%"=="0" (
  echo RUN DID NOT COMPLETE. Exit code %RC%. See the output above. >> "%LOG%" 2>&1
  echo   2 = sweep produced no file changes at all >> "%LOG%" 2>&1
  echo   3 = commit failed    4 = push failed    5 = push did not land on origin >> "%LOG%" 2>&1
  echo A 401 or "OAuth access token has expired" means Claude Code needs signing in again: >> "%LOG%" 2>&1
  echo run claude interactively in this folder, or set ANTHROPIC_API_KEY for unattended runs. >> "%LOG%" 2>&1
  echo If index.html was changed but not pushed, review it and push manually. >> "%LOG%" 2>&1
)

endlocal & exit /b %RC%
