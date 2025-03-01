from transformers import AutoModelForCausalLM, AutoTokenizer, StoppingCriteriaList
from rag import query_rag  # Assuming query_rag retrieves relevant RAG context
import torch

def init_model():
    # Change this to your fine-tuned model name or local path
    fine_tuned_model_path = "XCIT3D247/LegalEaseV2"  # If stored on Hugging Face
    # fine_tuned_model_path = "./business_llm"  # If stored locally

    print(f"Loading fine-tuned model from: {fine_tuned_model_path}")

    model = AutoModelForCausalLM.from_pretrained(
        fine_tuned_model_path, 
        device_map="auto", 
        torch_dtype=torch.bfloat16  # Ensure efficient memory usage
    )
    
    tokenizer = AutoTokenizer.from_pretrained(fine_tuned_model_path)

    # Ensure pad token is set correctly
    tokenizer.pad_token = tokenizer.eos_token
    
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
        model_inputs = tokenizer.apply_chat_template(messages, return_tensors="pt", padding=True).to("cuda")


        generated_ids = model.generate(
            model_inputs,
            max_new_tokens=500,
            do_sample=True,
        )

        # Decode response properly
        output = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]

        # Extract response text
        llm_response = output.split('[/INST]')[-1].strip()
        
        print("-"*50)
        print("LegalEase:", llm_response)
        print("-"*50)
        
        # Append assistant response
        append_message("assistant", llm_response)

if __name__ == "__main__":
    main()
