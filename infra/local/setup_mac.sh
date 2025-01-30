#!/bin/bash

brew tap hashicorp/tap

brew install ollama ansible hashicorp/tap/terraform
brew install --cask google-cloud-sdk

brew services start ollama
