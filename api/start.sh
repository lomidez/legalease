#!/bin/bash
echo "### Starting FastAPI Server ###"
read -rsp "Enter your HuggingFace token: " HF_TOKEN
HF_TOKEN=$HF_TOKEN nohup fastapi run --host 0.0.0.0 main.py > api.log 2>&1 &
echo $! > api.pid
echo "FastAPI server running with PID $(cat api.pid). Log at api.log."

