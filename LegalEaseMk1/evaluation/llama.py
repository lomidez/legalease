from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load LLaMA 2 7B model and tokenizer
model_name = "meta-llama/Llama-2-7b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto", torch_dtype=torch.float16)

def generate_llama_response(prompt, max_length=200):
    """Generates a response from the LLaMA 2 7B model."""
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
    output = model.generate(**inputs, max_length=max_length)
    return tokenizer.decode(output[0], skip_special_tokens=True)

# Example Usage
response = generate_llama_response("What are the benefits of an LLC?")
print(response)
