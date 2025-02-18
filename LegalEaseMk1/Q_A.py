from chat_history import get_chat_history, save_chat_history
from rag import query_rag
from model import generate_response, init_model
import warnings
import sys
sys.stderr = open('/dev/null', 'w')


warnings.filterwarnings("ignore")
warnings.filterwarnings("ignore", category=FutureWarning)

def get_prompt():
    with open("prompt.txt", "r") as file:
        prompt = file.read()
    return prompt

#supress warnings



def main():
    
    print("Welcome to LegalEase! Ask a question and we will provide an answer.")
    
    #get prompt from prompt.txt
    prompt = get_prompt()
    model, tokenizer = init_model()
    
    while True:
        
        user_input = input("Ask a question or type 'quit' to exit: ")
        if user_input == 'quit':
            break
        elif user_input == '':
            print("Please enter a valid question.")
        else:
            rag_context, sources = query_rag(user_input)
            chat_history = "\n".join(get_chat_history())
            
            user_input_with_context = prompt.format(user_input=user_input, rag_context=rag_context, chat_history=chat_history)
            
            
            #print(chat_history)
            new_input = user_input_with_context
            print(new_input)
            llm_output = generate_response(new_input, model, tokenizer)
            print("LegalEase:", llm_output)        
            save_chat_history(user_input, llm_output)

main()