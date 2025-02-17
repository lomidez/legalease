from chat_history import get_chat_history, save_chat_history
from rag import query_rag
from model import generate_response

def get_prompt():
    with open("prompt.txt", "r") as file:
        prompt = file.read()
    return prompt



def main():
    
    print("Welcome to LegalEase! Ask a question and we will provide an answer.")
    
    #get prompt from prompt.txt
    prompt = get_prompt()
    
    while True:
        
        user_input = input("Ask a question or type 'quit' to exit: ")
        if user_input == 'quit':
            break
        else:
            rag_context, sources = query_rag(user_input)
            print("-----------------------", rag_context, sources, "-----------------------")
            chat_history = "\n".join(get_chat_history())
            
            user_input_with_context = prompt.format(user_input=user_input, rag_context=rag_context)
            
            
            #print(chat_history)
            new_input = "Chat History:\n" + chat_history + "\n\n\n" +  user_input_with_context
            llm_output = generate_response(new_input)
            print("LegalEase:", llm_output)
            user_input_store = rag_context + "\n" + user_input
        
            save_chat_history(user_input_store, llm_output)

main()