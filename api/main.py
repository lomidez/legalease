### IMPORTS ###
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from huggingface_hub import login
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

from rag import query_rag

### MODELS ###


class Message(BaseModel):
    message: str


### HELPERS ###


def init_model():
    hf_token = os.environ.get("HF_TOKEN")
    login(hf_token)

    hf_cache_dir = os.environ.get("HF_CACHE_DIR")
    model = AutoModelForCausalLM.from_pretrained(
        "mistralai/Mistral-7B-Instruct-v0.2", device_map="auto", cache_dir=hf_cache_dir
    )
    tokenizer = AutoTokenizer.from_pretrained(
        "mistralai/Mistral-7B-Instruct-v0.2", cache_dir=hf_cache_dir
    )

    # Set pad token to eos token (but explicitly define it)
    tokenizer.pad_token = tokenizer.eos_token

    return model, tokenizer


def append_message(role, content):
    messages.append({"role": role, "content": content})


def get_prompt():
    """Reads the system instruction prompt from a file."""
    with open("prompt.txt", "r") as file:
        return file.read().strip()


### GLOBAL VARS ###

model = None
tokenizer = None
system_prompt = ""
messages = []


### INIT ###

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


### ROUTES ###


# initialize on server startup
@app.on_event("startup")
async def startup_event():
    global model, tokenizer, system_prompt

    print("Initializing model...")
    model, tokenizer = init_model()
    print("Loading system prompts...")
    system_prompt = get_prompt()  # Load instructions from prompt.txt
    messages.append({"role": "system", "content": system_prompt})
    print("System is ready...")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api"}


# return complete response, maybe later add /chat/stream
@app.post("/chat/complete")
async def generate_complete_response(message: Message):
    return message


@app.get("/messages")
async def get_messages():
    return messages
