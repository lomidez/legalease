from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

repo_name = "XCIT3D247/LegalEaseV1" 

#Load base model
base_model_name = "TheBloke/Mistral-7B-Instruct-v0.2-GPTQ"  # Ensure this matches your original base model
base_model = AutoModelForCausalLM.from_pretrained(base_model_name, device_map="auto")

#Load fine-tuned adapter
model = PeftModel.from_pretrained(base_model, repo_name)

#Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(repo_name, use_fast=True)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

def generate_response(prompt, model, tokenizer, max_new_tokens=100):
    model.eval()
    tokenizer.pad_token = tokenizer.eos_token

    # Tokenize input
    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512
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
    
    # Extract the response after the input
    if "[/INST]" in response:
        response = response.split("[/INST]")[-1].strip()
    
    return response
