#!/bin/bash
cd "$(dirname "$0")"
echo "Abrindo o Neon Pong em http://localhost:8000"
echo "Nao feche este terminal enquanto estiver jogando."
(sleep 1 && (xdg-open http://localhost:8000 || open http://localhost:8000)) >/dev/null 2>&1 &
python3 -m http.server 8000
