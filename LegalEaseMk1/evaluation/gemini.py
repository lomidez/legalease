from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# Load Gemini 7B model and tokenizer
model_name = "google/gemini-7b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto")

def generate_gemini_response(prompt, max_length=200):
    """Generates a response from the Gemini 7B model."""
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
    output = model.generate(**inputs, max_length=max_length)
    return tokenizer.decode(output[0], skip_special_tokens=True)

# Example Usage
response = generate_gemini_response("What are the benefits of an LLC?")
print(response)
