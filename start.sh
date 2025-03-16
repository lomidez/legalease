#!/bin/bash
read -rsp "Enter your HuggingFace token: " HF_TOKEN
python3.11 -m venv venv
source venv/bin/activate
pip3.11 install -r requirements.txt
HF_TOKEN=$HF_TOKEN nohup fastapi run --host 0.0.0.0 api/main.py > api.log 2>&1 &
echo $! > api.pid
echo "FastAPI server running with PID $(cat api.pid). Log at api.log."
echo "WARNING: First run will take some time as the server downloads model tensors from HuggingFace."
