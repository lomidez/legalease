#!/bin/bash

# https://stackoverflow.com/questions/78232178/ollama-in-docker-pulls-models-via-interactive-shell-but-not-via-run-command-in-t

echo "Starting Ollama server..."
ollama serve &
SERVE_PID=$!

echo "Waiting for Ollama server to be active..."
while ! ollama list | grep -q 'NAME'; do
  sleep 1
done

ollama pull llama3.2

wait $SERVE_PID
