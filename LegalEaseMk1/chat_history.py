import os
CHAT_HISTORY_FILE = "chat_history.txt"

def get_chat_history():
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, 'r') as file:
            lines = file.readlines()
        return [line.strip() for line in lines]
    else:
        return ""

def save_chat_history(user_query, llm_output):
    with open(CHAT_HISTORY_FILE, "a", encoding="utf-8") as file:
        file.write(f'"User: {user_query}",\n')
        file.write(f'"LegalEase: {llm_output}",\n')