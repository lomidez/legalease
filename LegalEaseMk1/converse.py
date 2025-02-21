# Imports to work in a nonrunning environment:
from chat_history import get_chat_history, save_chat_history, get_summary, save_summary
from rag import query_rag
print('here')
from model import generate_response, init_model
import warnings
import sys
sys.stderr = open('/dev/null', 'w')


warnings.filterwarnings("ignore")
warnings.filterwarnings("ignore", category=FutureWarning)

def get_prompt(file_name):
    # pulls form the /prompts folder
    folder = 'prompts/'
    with open(folder + file_name, "r") as file:
        prompt = file.read()
    return prompt

def main():
    #get summary_prompt from summary_prompt.txt
    summary_prompt = get_prompt('summary_prompt.txt')
    #get class_prompt form class_prompt.txt
    class_prompt = get_prompt('class_prompt.txt')
    prompt = get_prompt('prompt.txt')
    model, tokenizer = init_model()

    #####################################################################################
    #Summarization Section:
    print("Hello! I am LegalEase, your personal business structuring assitant.")
    print("To get us started, please tell me everything you know about your business so far:")
    still_summarizing = True
    # flag to allow the user to stop summarizing. If they havent said anything, we can't move on.
    first_pass = False
    while still_summarizing:
        user_input = input("'quit' to exit: ")
        if user_input == 'quit' and first_pass:
            still_summarizing = False
        elif user_input == '':
            print("Please enter a valid question.")
        else:
            # No Rag used in summarization stage
            summary = get_summary()
            print('sum grabbed')
            complete_query = summary_prompt.format(summary = summary, user_input=user_input)
            print('q made')
            llm_output = generate_response(model, tokenizer, complete_query)
            print('llm r')
            
            # how to clean text of everything but letters and spaces
            print("LegalEase:", llm_output)        
            save_summary(llm_output)
        # Allow a user to move on
        first_pass = True


    ############################################################################################
    # Classification Section:
    print('We will now summarize your ideas and suggest a business structure. This may take a few moments...')
    summary = get_summary()
    # format prompt
    complete_query = class_prompt.format(summary = summary, rag_context=rag_context)
    class_output = generate_response(model, tokenizer, complete_query)
    # Save this decision to the business summary:
    save_summary("The best business structure for this situation is" + class_output)
    print(class_output)
    print('this is your business summary:')
    print(get_summary())


main()