@echo off
title RUN TX SERVER
echo Starting server.js...
start cmd /k "node server.js"

timeout /t 3 /nobreak >nul
echo Starting bot.js...
start cmd /k "node bot.js"

timeout /t 3 /nobreak >nul
echo Starting add_chat.js...
start cmd /k "node add_chat.js"

echo All processes started!
pause
