# LegalEase: Small Business Formation Advice Chatbot

## Description 

LegalEase is an AI-powered chatbot designed to assist small business owners in Washington State with legal guidance on business formation. The chatbot provides low-cost, accessible support for selecting a business structure, understanding legal requirements, and generating key legal documents.

![LegalEase Demo](legalease_demo.gif)

## Quick Start

Since this is a private repo, you need to setup GitHub authentication to clone this repo:

```
sudo apt install gh
BROWSER=echo gh auth login
git clone https://github.com/davay/CPSC5830-Team1
```

On a fresh VM, run the initialization script:

```
cd CPSC5830-Team1
./initialize_vm.sh
```

Now you're ready to start the FastAPI server and React frontend.
The provided `start.sh` script will start both of them in the background.
You can check their logs in `api.log` or `web.log` -- e.g., use `cat`.

WARNING: On first run, the FastAPI server will take some time to download the models from HuggingFace. 

```
./start.sh
```

A `stop.sh` script is provided to stop both the FastAPI server and frontend.

```
./stop.sh
```

NOTE: These scripts are meant to be used on [Jetstream](https://jetstream-cloud.org). In a Jetstream VM, sudo is password-less. 
