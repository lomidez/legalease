from chat_history import get_chat_history, save_chat_history, clear_chat_history
from langchain.llms import HuggingFacePipeline
from langchain.chains import ConversationalRetrievalChain
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch

# Load Local LLM (Change Model Name as Needed)
MODEL_NAME = "mistralai/Mistral-7B-v0.1"  # Replace with an offline model path
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype=torch.float16, device_map="auto")

# Create Hugging Face Pipeline
pipeline = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_length=2048,
    temperature=0.7,
    do_sample=True,
)

# Wrap Pipeline in LangChain LLM
llm = HuggingFacePipeline(pipeline=pipeline)

# Initialize FAISS-based Retriever (Offline)
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = FAISS.load_local("faiss_index", embeddings=embedding)
retriever = vector_db.as_retriever()

# Define Prompt Template
template = """
You are a legal expert AI named LegalEase. Answer the user’s query concisely with accurate legal insights.

Chat History:
{chat_history}

Relevant Context:
{retrieved_docs}

User Question:
{user_input}
"""
prompt = PromptTemplate(input_variables=["chat_history", "retrieved_docs", "user_input"], template=template)

# Define Conversational Retrieval Chain
qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=retriever,
    return_source_documents=True,
)

def main():
    print("Welcome to LegalEase! (Offline Mode) Ask a legal question or type 'quit' to exit.")
    
    while True:
        user_input = input("\nAsk a question: ")
        if user_input.lower() == "quit":
            print("Clearing chat history and exiting...")
            clear_chat_history()
            break
        
        chat_history = "\n".join(get_chat_history())  # Retrieve previous chat context
        response = qa_chain({"question": user_input, "chat_history": chat_history})
        
        print("\nLegalEase:", response["answer"])
        save_chat_history(user_input, response["answer"])  # Store new interaction

if __name__ == "__main__":
    main()

'''
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

main()'''