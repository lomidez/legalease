#!/bin/bash
cd api
if [ -f api.pid ]; then
  kill "$(cat api.pid)" && rm api.pid && echo "FastAPI server stopped"
else
  echo "FastAPI server not found"
fi

cd ../web
if [ -f web.pid ]; then
  kill "$(cat web.pid)" && rm web.pid && echo "Web server stopped"
else
  echo "Web server not found"
fi
