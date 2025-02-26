from typing import Optional, Literal
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from rag import query_rag

import asyncio


class ChatResponse(BaseModel):
    id: str


class Message(BaseModel):
    message: str


def init_model():
    model = AutoModelForCausalLM.from_pretrained(
        "mistralai/Mistral-7B-Instruct-v0.2", device_map="auto"
    )
    tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")

    # Set pad token to eos token (but explicitly define it)
    tokenizer.pad_token = tokenizer.eos_token

    return model, tokenizer


def append_message(role, content):
    messages.append({"role": role, "content": content})


def get_prompt():
    """Reads the system instruction prompt from a file."""
    with open("prompt.txt", "r") as file:
        return file.read().strip()


messages = []

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # TODO: Need to change when hosting on jetstream
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def generate_text_stream(message: str):
    response = f"Beep Boop. This is a test. \nYour message was: {message}"
    await asyncio.sleep(2)
    for char in response:
        await asyncio.sleep(0.1)
        yield f"data: {char}\n\n"


@app.get("/")
def read_root():
    model, tokenizer = init_model()
    messages.append({"role": "system", "content": system_prompt})
    return {"Hello": "World"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api"}


@app.post("/chats", response_model=ChatResponse)
async def create_chat_session():
    return ChatResponse(id="abc")


# TODO: I can't get the SSE version to work
@app.post("/chats/{chat_id}")
async def send_chat_message(chat_id: str, message: Message):
    print(message)
    return StreamingResponse(
        generate_text_stream(message.message), media_type="text/event-stream"
    )
