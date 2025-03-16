import os
import sys
import torch
import warnings
from transformers import (
    AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, logging
)
from peft import PeftModel
from rag import query_rag  # Assuming query_rag retrieves relevant RAG context

# Suppress warnings and errors for a clean output
sys.stderr = open(os.devnull, 'w')
warnings.filterwarnings("ignore")
logging.set_verbosity_error()

def init_model():
    """Initialize the fine-tuned LegalEase model with optional quantization."""
    model_name = "XCIT3D247/LegalEaseV2"  # Use the fine-tuned model
    
    # Enable quantization for efficient inference
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,  
        bnb_4bit_use_double_quant=True,  
        bnb_4bit_quant_type="nf4",  
        bnb_4bit_compute_dtype=torch.bfloat16  
    )

    # Load the model with quantization
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto"
    )

    # Load fine-tuned weights (LoRA adapters)
    model = PeftModel.from_pretrained(model, model_name)

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Set tokenizer padding and EOS token
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "left"  # Ensures better performance in batch decoding

    return model, tokenizer

# Conversation history
messages = []

def append_message(role, content):
    messages.append({"role": role, "content": content})

def get_prompt():
    """Reads the system instruction prompt from a file."""
    with open("prompt.txt", "r") as file:
        return file.read().strip()

def main():
    print("Initializing Model...")
    model, tokenizer = init_model()

    system_prompt = get_prompt()  # Load instructions from prompt.txt
    print("Welcome to LegalEase!")

    # Start with system instruction message
    messages.append({"role": "system", "content": system_prompt})

    while True:
        user_input = input("Ask a question or type 'quit' to exit: ")
        if user_input.lower() == "quit":
            break

        # Retrieve RAG context
        rag_context, sources = query_rag(user_input)

        # Format user message with RAG context
        formatted_input = f"Relevant information: {rag_context}\n\nUser: {user_input}"
        append_message("user", formatted_input)

        # Convert messages to model input
        model_inputs = tokenizer.apply_chat_template(messages, return_tensors="pt", padding=True).to(model.device)

        # Generate response
        generated_ids = model.generate(
            model_inputs,
            max_new_tokens=500,
            do_sample=True,
        )

        # Decode response properly
        output = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

        # Extract response text
        llm_response = output.split('[/INST]')[-1].strip()
        
        print("-" * 50)
        print("LegalEase:", llm_response)
        print("-" * 50)
        
        # Append assistant response
        append_message("assistant", llm_response)

if __name__ == "__main__":
    main()
