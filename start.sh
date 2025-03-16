#!/bin/bash

# stop any existing app, but suppress logs since sometimes there wont be any -- false alarm
./stop.sh > /dev/null 2>&1

# setup venv
python3.11 -m venv venv
source venv/bin/activate
pip3.11 install -r requirements.txt

# run fastapi 
# cd so the relative path stuff dont break
cd api
./start.sh

# run web
cd ../web
./start.sh

echo "WARNING: First run will take some time as the FastAPI server downloads model tensors from HuggingFace."
