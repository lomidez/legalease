'''from transformers import AutoModelForCausalLM, AutoTokenizer, logging
from peft import PeftModel
import torch
import bitsandbytes as bnb


logging.set_verbosity_error()
import os
os.environ["TORCH_LOGS"] = "ERROR"

def init_model():
    
    repo_name = "XCIT3D247/LegalEaseV1" 

    #Load base model
    base_model_name = "TheBloke/Mistral-7B-Instruct-v0.2-GPTQ"  # Ensure this matches your original base model
    base_model = AutoModelForCausalLM.from_pretrained(base_model_name, device_map="auto")

    #Load fine-tuned adapter
    model = PeftModel.from_pretrained(base_model, repo_name)

    #Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(repo_name, use_fast=True)

    device = 'cuda'
    model.to(device)
    return model, tokenizer'''
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import os

# Suppress warnings
os.environ["TORCH_LOGS"] = "ERROR"
# Ensure CUDA is used
device = "cuda" if torch.cuda.is_available() else "cpu"
def init_model():
    base_model_name = "TheBloke/Mistral-7B-Instruct-v0.2-GPTQ"


    print(device)
    # Load GPTQ base model (DO NOT use BitsAndBytesConfig)
    model = AutoModelForCausalLM.from_pretrained(
        base_model_name,
        device_map="auto"
    )

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(base_model_name, use_fast=True)

    return model, tokenizer


def generate_response(prompt, model, tokenizer, max_new_tokens=500):
    model.eval()
    tokenizer.pad_token = tokenizer.eos_token

    # Tokenize input
    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        padding=True,
        truncation=True
    ).to(device)

    # Generate output
    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=max_new_tokens,
            pad_token_id=tokenizer.eos_token_id
        )

    # Decode response
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    return response

def test_model():
    model, tokenizer = init_model()
    prompt = "What is the importance of contract law in business?"
    response = generate_response(prompt, model, tokenizer)
    print("Model Response:", response)

# Run the test
###test_model()
