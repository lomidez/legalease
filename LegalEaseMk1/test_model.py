from transformers import AutoModelForCausalLM, AutoTokenizer
from rag import query_rag  # Assuming query_rag retrieves relevant RAG context

def init_model():
    model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2", device_map="auto")
    tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")
    return model, tokenizer

# Conversation history
messages = []

def append_message(role, content):
    """
    Appends a new message to the messages list.

    Parameters:
        role (str): The role of the sender ('user' or 'assistant').
        content (str): The message content.
    """
    messages.append({"role": role, "content": content})

def get_prompt():
    """
    Reads the system instruction prompt from a file.
    """
    with open("prompt.txt", "r") as file:
        return file.read().strip()

def main():
    print("Initializing Model...")
    model, tokenizer = init_model()
    
    system_prompt = get_prompt()  # Load instructions from prompt.txt
    print("Welcome to LegalEase!")
    
    # Start with a system message
    messages.append({"role": "system", "content": system_prompt})

    while True:
        user_input = input("Ask a question or type 'quit' to exit: ")
        if user_input.lower() == "quit":
            break

        # Retrieve RAG context (external knowledge retrieval)
        rag_context, sources = query_rag(user_input)

        # Format user message with RAG context
        formatted_input = f"Relevant information: {rag_context}\n\nUser: {user_input}"
        append_message("user", formatted_input)

        # Convert messages to model input
        model_inputs = tokenizer.apply_chat_template(messages, return_tensors="pt").to("cuda")

        # Generate response
        generated_ids = model.generate(model_inputs, max_new_tokens=250, do_sample=True)
        output = tokenizer.batch_decode(generated_ids)[0]

        # Extract response
        llm_response = output.split('[/INST]')[-1].strip()
        print("LegalEase: ", llm_response)

        # Append assistant response
        append_message("assistant", llm_response)

if __name__ == "__main__":
    main()
