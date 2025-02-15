ip_address=$(curl -s ifconfig.me)

echo "ollama_url: http://${ip_address}:11434"
echo "webui_url: http://${ip_address}:3000"
echo "fastapi_url: http://${ip_address}:8000"
