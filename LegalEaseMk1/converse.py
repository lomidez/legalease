# Imports to work in a nonrunning environment:
from chat_history import get_chat_history, save_chat_history, get_summary, save_summary
from rag import query_rag
from model_llama2_7b import generate_response, init_model
#from model import generate_response, init_model
import warnings
import sys
#sys.stderr = open('/dev/null', 'w')


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
    print(generate_response('I want to make a business caled legalEase that classifies business structures using AI', model, tokenizer))

    #####################################################################################
    #Summarization Section:
    print("Hello! I am LegalEase, your personal business structuring assitant.")
    print("To get us started, please tell me everything you know about your business so far:")
    still_summarizing = True
    # flag to allow the user to stop summarizing. If they havent said anything, we can't move on.
    after_first_pass = False
    while still_summarizing:
        if after_first_pass:
            user_input = input("To move on, type 'next' ")
        else:
            user_input = input("Ideas go here => ")
        if user_input == 'next' and after_first_pass:
            still_summarizing = False
        elif len(user_input) < 15:
            print("We can't do the thinking for you, come back with a plan.")
        else:
            # No Rag used in summarization stage
            summary = get_summary()
            complete_query = summary_prompt.format(summary = summary, user_input=user_input)
            llm_output = generate_response(complete_query, model, tokenizer)
            # how to clean text of everything but letters and spaces
            print("LegalEase:", llm_output)        
            save_summary(llm_output)
        # Allow a user to move on
        after_first_pass = True


    ############################################################################################
    # Classification Section:
    print('\nWe will now summarize your ideas and suggest a business structure. This may take a few moments...')
    summary = get_summary()
    # Grab RAG and format prompt
    if len(summary) == 0:
        print('No information about your business on file. Please Try again.')
        exit(0)
    rag_context= 'query_rag(summary)'
    complete_query = class_prompt.format(summary = summary, rag_context=rag_context)
    class_output = generate_response(complete_query, model, tokenizer)
    # Save this decision to the business summary:
    save_summary("The best business structure for this situation is" + class_output)
    print(class_output)
    print('this is what we have so far concering your business:')
    print(get_summary())

    print('do you have any other questions at this time?')
    ##TODO ADD prompt section 

    ##TODO EXTRACT LLM to get parts of ARTICES of INCORPORATION

    ##TODO we have to manually aprse that fucker.


main()