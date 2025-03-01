from transformers import AutoModelForCausalLM, AutoTokenizer, StoppingCriteriaList
from rag import query_rag  # Assuming query_rag retrieves relevant RAG context
import torch
import pandas as pd

file_path = "/media/volume/LegalEaseMaxim/CPSC5830-Team1/LegalEaseMk1/datasets/eval_business_type_true.csv"
df = pd.read_csv(file_path)
print(df)

def init_model():
    model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2", device_map="auto") # Base model 
    tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")
    tokenizer.pad_token = tokenizer.eos_token
    
    return model, tokenizer

def get_prompt():
    with open("prompt.txt", "r") as file:
        return file.read().strip()

# Initialize model and tokenizer
def init_model():
    model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2", device_map="auto") 
    tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")

    tokenizer.pad_token = tokenizer.eos_token  # Set pad token
    return model, tokenizer

model, tokenizer = init_model()
system_prompt = get_prompt()  # Load system instruction

# Function to generate response
def generate_response(messages):
    model_inputs = tokenizer.apply_chat_template(messages, return_tensors="pt", padding=True).to("cuda")

    generated_ids = model.generate(
        model_inputs,
        max_new_tokens=20,
        do_sample=True,
    )

    output = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    response = output.split('[/INST]')[-1].strip()
    return response

base_answers = []
prompt_engineered_answers = []
rag_answers = []

for scenario in df["Scenario"]:

    base_prompt = f"Tell me what type of Business structure to use for this scenario: '{scenario}'. Answer only with one word, do not say anything else, no explanation needed. Only 1 word, business type."
    base_messages = [{"role": "user", "content": base_prompt}]
    base_response = generate_response(base_messages)
    base_answers.append(base_response)

    pe_messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": base_prompt},
    ]
    pe_response = generate_response(pe_messages)
    prompt_engineered_answers.append(pe_response)

    rag_context, _ = query_rag(scenario)
    rag_input = f"Relevant information: {rag_context}\n\n{base_prompt}"
    rag_messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": rag_input},
    ]
    rag_response = generate_response(rag_messages)
    rag_answers.append(rag_response)

df["Base_Model_Answer"] = base_answers
df["Prompt_Engineered_Answer"] = prompt_engineered_answers
df["RAG_Answer"] = rag_answers

print(df.head())

output_file = "/media/volume/LegalEaseMaxim/CPSC5830-Team1/LegalEaseMk1/datasets/eval_business_type_results.csv"
df.to_csv(output_file, index=False)
print(f"Results saved to {output_file}")