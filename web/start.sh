#!/bin/bash

echo "### Starting Web Server ###"
CURRENT_API_URL=""
if [ -f .env ] && grep -q "VITE_API_URL=" .env; then
  CURRENT_API_URL=$(grep "VITE_API_URL=" .env | cut -d= -f2)
  echo "Current API URL is: ${CURRENT_API_URL}"
fi

echo "Enter the public IP address of your API server (assuming port 8000)."
echo "Leave empty to keep current URL:"
read -r API_IP

if [ -n "$API_IP" ]; then
  echo "VITE_API_URL=http://${API_IP}:8000" > .env
fi

pnpm install

nohup pnpm run dev > web.log 2>&1 &
sleep 2
echo $(lsof -i :5173 | awk 'NR>1 {print $2}' | head -n 1) > web.pid
echo "Web server running with PID $(cat web.pid). Log at web.log."
