#!/bin/bash

read -sp "Enter your Hugging Face token: " HF_TOKEN
echo ""

if [ "$(uname)" = "Linux" ] && command -v nvidia-smi &> /dev/null; then
    echo "Linux with GPU detected; Using Docker compose"
    HF_TOKEN=$HF_TOKEN docker compose up

    # detached
    # docker compose up -d
  elif [ "$(uname)" = "Darwin" ] &> /dev/null; then
    echo "MacOS detected; Starting natively"
    if conda env list | grep -q "legalease"; then
        echo "Conda environment already exists, skipping creation..."
    else
        conda env create -f environment.yml
    fi
    conda run -n legalease --no-capture-output fastapi dev main.py
  else
    echo "Linux without GPU or Windows detected, skipping..."
fi
