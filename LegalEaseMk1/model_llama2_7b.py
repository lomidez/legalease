from transformers import AutoModelForCausalLM, AutoTokenizer, logging
from peft import PeftModel
import torch
import bitsandbytes as bnb
import json
from huggingface_hub import login

with open('secrets.json', 'r') as file:
    secrets = json.load(file)
    hf_token = secrets["HF_READ_TOKEN"]
login(token=hf_token)

logging.set_verbosity_error()
import os
os.environ["TORCH_LOGS"] = "ERROR"

def init_model():
    """
    tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")
    model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf", device_map="auto")

    tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf", device_map="auto")
    model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-chat-hf", device_map="auto")
    """
    tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B", device_map="auto")
    model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B", device_map="auto")

    device = 'cuda'
    try:
        model.to(device)
    except:
        device = 'cpu'  # If CUDA is unavailable, fall back to CPU
    return model, tokenizer

def generate_response(prompt, model, tokenizer, max_new_tokens=5000):
    model.eval()

    # Tokenize the prompt and send to the same device as the model
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    # Generate a response using max_new_tokens
    output = model.generate(input_ids=inputs['input_ids'], max_new_tokens=max_new_tokens)

    # Decode the response
    response = tokenizer.decode(output[0], skip_special_tokens=True)

    return response

    '''tokenizer.pad_token = tokenizer.eos_token

    # Ensure the model is on the same device as the inputs
    try:
        model.to('cuda')
    except:
        print('model not mounted to cuda properly.')

    # Tokenize input
    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        padding=True,
        truncation=True,  
        max_length=2048 
    ).to('cuda')

    # Generate output
    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=max_new_tokens,  
            temperature=0.5,                
            top_p=0.9,                     
            pad_token_id=tokenizer.eos_token_id
        )

    # Decode the generated output
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    if response.startswith(prompt):
        response = response[len(prompt):].strip()

    return response
'''