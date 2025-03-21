### IMPORTS ###
import os
import json

from collections import defaultdict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from huggingface_hub import login
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, AsyncTextIteratorStreamer

from threading import Thread
from rag import query_rag

import torch

### MODELS ###
class ChatRequest(BaseModel):
    message: str

### HELPERS ###
def init_model():
    hf_token = os.environ.get("HF_TOKEN")
    login(hf_token)
    base_url = "mistralai/Mistral-7B-Instruct-v0.2"
    fine_url = "XCIT3D247/LegalEaseV2"
    hf_cache_dir = os.environ.get("HF_CACHE_DIR")
    model = AutoModelForCausalLM.from_pretrained(
        base_url, device_map="auto", cache_dir=hf_cache_dir
    )
    tokenizer = AutoTokenizer.from_pretrained(
        base_url, cache_dir=hf_cache_dir
    )

    
    tokenizer.pad_token = tokenizer.eos_token

    return model, tokenizer


def append_message(session_id, role, content):
    message_history[session_id].append({"role": role, "content": content})


def get_prompt():
    """Reads the system instruction prompt from a file."""
    with open("prompt.txt", "r") as file:
        return file.read().strip()

def get_sum_prompt():
    """Reads the system instruction prompt from a file."""
    with open("sum_prompt.txt", "r") as file:
        return file.read().strip()

def read_text_file(file_path):
    """Reads text from a specified file."""
    with open(file_path, "r") as file:
        return file.read().strip()


### GLOBAL VARS ###
model = None
tokenizer = None
system_prompt = ""
session_classifications = {}
message_history = defaultdict(list)
next_session_id = 0


### INIT ###
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    system_prompt = get_prompt() 
    sum_prompt = get_sum_prompt()
    print("System is ready...")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api"}

@app.post("/classify/{session_id}")
async def get_classification(session_id: int, chatRequest: ChatRequest):
    classification_prompt = [
        {
            "role": "system",
            "content": (
                "You are an expert business consultant called LegalEase specializing in Washington State. "
                "Classify the input according to the most suitable business structure for the user. "
                "Return ONLY ONE of the following labels with no additional text: 'llc', 's_corp', or 'nonprofit'."
            )
        },
        {"role": "user", "content": chatRequest.message}
    ]
    
    model_inputs = tokenizer.apply_chat_template(
        classification_prompt, return_tensors="pt", padding=True
    ).to("cuda")
    
    with torch.no_grad():
        output = model.generate(
            model_inputs, 
            max_new_tokens=20,
            do_sample=False,    
            pad_token_id=tokenizer.eos_token_id
        )
    
    response = tokenizer.decode(output[0], skip_special_tokens=True)

    classification = "unknown"
    for label in ["llc", "s_corp", "nonprofit"]:
        if label in response.lower():
            classification = label
            break
    
    session_classifications[session_id] = classification
    
    append_message(session_id, "classification", classification)
    
    return {"classification": classification, "full_response": response}

@app.post("/chat/{session_id}")
async def generate_streaming_response(session_id: int, chatRequest: ChatRequest):
    # This is SSE, two newlines signifies end of event
    async def stream_generator(streamer):
        # a buffer to store responses, so the complete respond can be appended at the end
        responses = []
        try:
            async for text_chunk in streamer:
                responses.append(text_chunk)
                yield f"data: {json.dumps(text_chunk)}\n\n"

            response = "".join(responses)
            append_message(session_id, "assistant", response)
        except Exception as e:
            yield f"data: [Error: {json.dumps(e)}]\n\n"

    # Retrieve RAG context
    rag_context, _ = query_rag(chatRequest.message)

    # Format user message with RAG context
    formatted_input = (
        f"Relevant information: {rag_context}\n\nUser: {chatRequest.message}"
    )
    append_message(session_id, "user", formatted_input)
    print("\n\n\nChatS TO the model!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n\n")
    print(message_history[session_id])
    filtered_msgs = []
    
    for message in message_history[session_id]:
        if message['role'] in ['system','user', 'assistant']:
                filtered_msgs.append(message)
    print(filtered_msgs)

    # tokeninze imputs
    model_inputs = tokenizer.apply_chat_template(
        filtered_msgs, return_tensors="pt", padding=True
    ).to("cuda")

    # Start the streaming
    streamer = AsyncTextIteratorStreamer(tokenizer, skip_prompt=True)
    generation_kwargs = dict(
        inputs=model_inputs, streamer=streamer, max_new_tokens=500, do_sample=True
    )
    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()

    return StreamingResponse(stream_generator(streamer), media_type="text/event-stream")


@app.get("/messages")
async def get_messages():
    return message_history


@app.get("/chat")
async def create_chat_session():
    global next_session_id
    next_session_id += 1
    message_history[next_session_id].append(
        {"role": "system", "content": system_prompt}
    )
    return next_session_id


@app.get("/summarize/{session_id}")
async def summarize_history(session_id: int):
    async def stream_generator(streamer):
        # Collecting all the chunks of the generated summary
        responses = []
        try:
            async for text_chunk in streamer:
                responses.append(text_chunk)
                yield f"data: {json.dumps(text_chunk)}\n\n"

            # Combine all the responses into one summary string
            summary = "".join(responses)
            append_message(session_id, "summary", summary)  # Save the summary under the 'summary' role
        except Exception as e:
            yield f"data: [Error: {json.dumps(e)}]\n\n"

    # Gather the conversation history content from the message history
    full_content = ""
    for message in message_history[session_id]:
        # Append only 'user' and 'assistant' roles to the content, not the original system prompt
        if message['role'] in ['user', 'assistant']:
            full_content += f"\n*role*: *{message['role']}*, *content*: {message['content']}*"

    # Create the system message with the appropriate context
    full_sum = [
        {
            "role": "system",
            "content": (
                "You are an expert business consultant called LegalEase **specializing in Washington State**. "
                "Your role is to help users determine the most suitable **business structure** based on their **business goals, financial situation, and legal considerations specific to Washington State**. \n\n"
                "You will summarize the following conversation that has been had between a user and an assistant. Summarize information the User provides, using information the assistant provides to flesh out the business structure. \n"
                "Only print out a summary, not an explanation of how you got it. Display a factual summary, not in a conversational tone.\n "
                "Do not mention what the LegalEase assistant does, only information the user provides, or information provided by the assistant that the user then responded to."
                "Ensure the last token generated is either non-profit, llc, or corp."
            )
        },
        # Use the user's most recent message as the input context
        {"role": "user", "content": f"Summarize The following: \n\nUser: {full_content}"}, 
    ]

    print("\n\n\SUM TO the model!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n\n")
    print(full_sum) 

    # Initialize the streamer
    streamer = AsyncTextIteratorStreamer(tokenizer, skip_prompt=True)

    # Convert full_sum to the input format
    model_inputs = tokenizer.apply_chat_template(
        full_sum, return_tensors="pt", padding=True
    ).to("cuda")

    generation_kwargs = dict(
        inputs=model_inputs, streamer=streamer, max_new_tokens=500, do_sample=True
    )

    # Start generating the summary in a separate thread
    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()

    # Collect the streaming responses and append the summary
    return StreamingResponse(stream_generator(streamer), media_type="text/event-stream")

@app.get("/draft/{session_id}")
async def draft_articles(session_id: int):
    async def stream_generator(streamer):
        try:
            async for text_chunk in streamer:
                yield f"data: {json.dumps(text_chunk)}\n\n"
        except Exception as e:
            yield f"data: [Error: {json.dumps(e)}]\n\n"

     # Check if we have a summary, if not, generate one
    has_summary = False
    summary_content = ""
    for message in message_history[session_id]:
        if message['role'] == 'summary':
            has_summary = True
            summary_content = message['content']
            break
    
    if not has_summary:
        # Call summarize endpoint to generate a summary
        print("No summary found. Generating one now...")
        await summarize_history(session_id)
        
        # Now get the newly created summary
        for message in message_history[session_id]:
            if message['role'] == 'summary':
                summary_content = message['content']
                break
    
    # format summary
    full_content = f"\n*role*: *summary*, *content*: {summary_content}*"
    # defaults to llc if an error is found
    classification = "llc" 
    
    if session_id in session_classifications:
        classification = session_classifications[session_id]
    else:
        classification_exists = False
        for message in message_history[session_id]:
            if message['role'] == 'classification':
                classification = message['content']
                classification_exists = True
                break
        
        # If no classification exists, generate one using the summary
        if not classification_exists and summary_content:
            print("No classification found. Generating one now based on summary...")
            # Create a chat request with the summary content
            chat_request = ChatRequest(message=summary_content)
            # Call the classification endpoint
            classification_response = await get_classification(session_id, chat_request)
            classification = classification_response["classification"]
    
    # Select the appropriate template based on classification
    template = ""
    if classification == "llc":
        template = read_text_file("art_of_inc/llc.txt")
    elif classification == "s_corp":
        template = read_text_file("art_of_inc/s_corp.txt")
    elif classification == "nonprofit":
        template = read_text_file("art_of_inc/nonprofit.txt")
    else:
        # Fallback to LLC if classification is unknown
        template = read_text_file("art_of_inc/llc.txt")
    
    print(f"Selected template for classification: {classification}")

    # format the message to the model
    full_pair = [
        {
            "role": "system",
            "content": (
                "You are an expert business consultant called LegalEase **specializing in Washington State**. "
                "Your role is to help users determine the most suitable **business structure** based on their **business goals, financial situation, and legal considerations specific to Washington State**. \n\n"
                "You will be provided a summary of a business discussion and a template for Articles of Incorporation or other appropriate business formation Document."
                "Use the Template and summary to draft a formation document for the business."
                "Draft all sections possible. If a section doesn't have relevant information yet, expicitly tell the user to provide it after the draft."
                "Be as concise as possible, provide your answers in key-value pairs"
            )
        },
        {"role": "user", "content": f"Use this Summary: {full_content} and this template: {template} to draft the Articles of Incorporation for this business. The business has been classified as a {classification}."}, 
    ]

    print("\n\n\nSENT TO the model!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n\n")
    print(full_pair) 

    streamer = AsyncTextIteratorStreamer(tokenizer, skip_prompt=True)
    print('#######################draft checkpoint#################')

    # Convert full_sum to the input format
    model_inputs = tokenizer.apply_chat_template(
        full_pair, return_tensors="pt", padding=True
    ).to("cuda")

    generation_kwargs = dict(
        inputs=model_inputs, streamer=streamer, max_new_tokens=500, do_sample=True
    )

    # Start generating the response in a separate thread
    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()

    return StreamingResponse(stream_generator(streamer), media_type="text/event-stream")

@app.get("/generate_next_steps/{session_id}")
async def generate_next_steps(session_id: int):
    async def stream_generator(streamer):
        try:
            async for text_chunk in streamer:
                yield f"data: {json.dumps(text_chunk)}\n\n"
        except Exception as e:
            yield f"data: [Error: {json.dumps(e)}]\n\n"

    full_content = ""
    for message in message_history[session_id]:
        # Append only 'user' and 'assistant' roles to the content, not the original sytem prompt, and only the last
        if message['role'] in ['summary']:
            # Send as a user so the model filter accepts the query
            full_content += "\n*role*: *" + message['role'] + "*, *content*: " + message['content'] + "*"


    # Get the classification for this session
    classification = "llc"  # Default to LLC if no classification exists
    
    # Check if we have a stored classification
    if session_id in session_classifications:
        classification = session_classifications[session_id]
    else:
        classification_exists = False
        for message in message_history[session_id]:
            if message['role'] == 'classification':
                classification = message['content']
                classification_exists = True
                break
        
        if not classification_exists and summary_content:
            print("No classification found. Generating one now based on summary...")
            # Create a chat request with the summary content
            chat_request = ChatRequest(message=summary_content)
            # Call the classification endpoint
            classification_response = await get_classification(session_id, chat_request)
            classification = classification_response["classification"]
    
    template = ""
    if classification == "llc":
        template = read_text_file("art_of_inc/llc.txt")
    elif classification == "s_corp":
        template = read_text_file("art_of_inc/s_corp.txt")
    elif classification == "nonprofit":
        template = read_text_file("art_of_inc/nonprofit.txt")
    else:
        template = read_text_file("art_of_inc/llc.txt")
    
    directions = read_text_file("art_of_inc/directions.txt")
    full_pair = [
        {
            "role": "system",
            "content": (
                "You are an expert business consultant called LegalEase **specializing in Washington State**. "
                "Your role is to help users determine the most suitable **business structure** based on their **business goals, financial situation, and legal considerations specific to Washington State**. \n\n"
                "You will be provided a summary of a business discussion and a template for an Articles of Incorporation Document."
                "Generate a list of next steps for the user to take. Mention things like reserving their business name, filing an EIN" + directions
            )
        },
        {"role": "user", "content": f"Use this Summary: {full_content} and this Articles of Incorporation template {template} to draft Articles of Incorporation for this business idea."}, 
    ]

    print("\n\n\nSENT TO the model!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n\n")
    print(full_pair) 

    streamer = AsyncTextIteratorStreamer(tokenizer, skip_prompt=True)
    print('#######################draft checkpoint#################')

    # Convert full_sum to the imput format
    model_inputs = tokenizer.apply_chat_template(
        full_pair, return_tensors="pt", padding=True
    ).to("cuda")

    generation_kwargs = dict(
        inputs=model_inputs, streamer=streamer, max_new_tokens=500, do_sample=True
    )

    # Start generating the response in a separate thread
    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()

    return StreamingResponse(stream_generator(streamer), media_type="text/event-stream")
