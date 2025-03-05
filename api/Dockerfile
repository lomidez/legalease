FROM nvidia/cuda:12.6.3-cudnn-runtime-ubuntu24.04
WORKDIR /app

# Setup python3.11 and venv
RUN apt update && \
  apt install -y software-properties-common && \
  add-apt-repository ppa:deadsnakes/ppa && \
  apt update && \
  apt install -y python3.11 python3.11-venv python3.11-dev build-essential
RUN python3.11 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install pip dependencies
COPY ../requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Start server
COPY . .
EXPOSE 8000
CMD ["fastapi", "run", "--host", "0.0.0.0", "main.py"] 
