from langchain.memory import ConversationBufferMemory
import os

CHAT_HISTORY_FILE = "chat_history.txt"

# Initialize LangChain Memory
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

def get_chat_history():
    """Retrieve chat history from LangChain memory."""
    return memory.load_memory_variables({})["chat_history"]

def save_chat_history(user_query, llm_output):
    """Store chat history in LangChain memory and a file."""
    memory.save_context({"input": user_query}, {"output": llm_output})
    
    with open(CHAT_HISTORY_FILE, "a", encoding="utf-8") as file:
        file.write(f"User: {user_query}\n")
        file.write(f"Assistant: {llm_output}\n\n")

def clear_chat_history():
    """Clear chat history (useful for resetting the session)."""
    memory.clear()
    if os.path.exists(CHAT_HISTORY_FILE):
        os.remove(CHAT_HISTORY_FILE)


'''
import os
CHAT_HISTORY_FILE = "chat_history.txt"
SUMMARY_FILE = 'summary.txt'

def get_chat_history():
    """Retrieve the last few lines of chat history and format properly."""
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, "r", encoding="utf-8") as file:
            lines = file.readlines()
        return lines[-2:]  # Keep only the last 10 exchanges
    else:
        return []

def save_chat_history(user_query, llm_output):
    """Save chat history in a properly formatted way."""
    with open(CHAT_HISTORY_FILE, "a", encoding="utf-8") as file:
        # Clean up user query and LLM output
        user_query = user_query.replace("\n", " ").replace("\r", " ")
        llm_output = llm_output.replace("\n", " ").replace("\r", " ")

        # Store as clean plain-text conversation
        file.write(f"User: {user_query}\n")
        file.write(f"Assistant: {llm_output}\n\n")

def get_summary():
    """Retrieve the full summary format properly."""
    if os.path.exists(SUMMARY_FILE):
        with open(SUMMARY_FILE, "r", encoding="utf-8") as file:
            lines = file.readlines()
        # We want to keep the whole summary.
        return lines
    else:
        return []

def save_summary(llm_output):
    """Save chat history in a properly formatted way."""
    with open(SUMMARY_FILE, "a", encoding="utf-8") as file:
        # Clean up LLM output
        llm_output = llm_output.replace("\n", " ").replace("\r", " ")
        # Store
        file.write(f"Assistant: {llm_output}\n\n")
'''