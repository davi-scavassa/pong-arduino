@echo off
title NEON PONG - servidor local
cd /d "%~dp0"
echo.
echo  Abrindo o Neon Pong em http://localhost:8000
echo  NAO FECHE ESTA JANELA enquanto estiver jogando.
echo.
start "" http://localhost:8000
py -m http.server 8000 2>nul || python -m http.server 8000 2>nul || python3 -m http.server 8000
pause
