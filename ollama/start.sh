#!/bin/bash

if [ "$(uname)" = "Linux" ] && command -v nvidia-smi &> /dev/null; then
    echo "Linux with GPU detected; Using Docker compose"
    docker compose up --build -d
  elif [ "$(uname)" = "Darwin" ] &> /dev/null; then
    echo "MacOS detected; Using native Ollama with Docker WebUI"
    
    # Check if Ollama is installed
    if ! command -v ollama &> /dev/null; then
        echo "Ollama not found. Please install it first using 'brew install ollama' or run /infra/local/setup_mac.sh"
        exit 1
    fi
    
    # Start ollama service if not running
    if ! pgrep -x "ollama" > /dev/null; then
        echo "Starting Ollama service..."
        ollama serve &
        sleep 2 
    fi
    
    echo "Pulling model..."
    ollama pull llama3.2
    
    echo "Starting WebUI..."
    docker run -d \
        -p 3000:8080 \
        --add-host=host.docker.internal:host-gateway \
        -v open-webui:/app/backend/data \
        -e OLLAMA_API_BASE_URL=http://host.docker.internal:11434/api \
        --name open-webui \
        --restart always \
        ghcr.io/open-webui/open-webui:main

   echo "WebUI available at: http://localhost:3000"
else
    echo "Linux without GPU or Windows detected, skipping..."
fi

