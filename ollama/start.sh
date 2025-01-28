#!/bin/bash

if [ "$(uname)" = "Linux" ] && command -v nvidia-smi &> /dev/null; then
    echo "Starting in production mode with GPU support..."
    docker compose --profile prod up -d
else
    echo "Starting in local mode..."
    docker compose --profile local up
fi

