import os
import numpy as np
import torch
import gdown
import pandas as pd

# https://python.langchain.com/api_reference/community/embeddings.html <- list of all embeddings models we can use from
from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain_community.embeddings.bedrock import BedrockEmbeddings # <- this does not exist anymore
from langchain_community.embeddings import GPT4AllEmbeddings

# def get_embedding_function():
#   model_name = "all-MiniLM-L6-v2.gguf2.f16.gguf"
#   gpt4all_kwargs = {'allow_download': 'True'}
#   embeddings = GPT4AllEmbeddings(
#       model_name=model_name,
#       gpt4all_kwargs=gpt4all_kwargs
#   )
#   return embeddings

# # Retrieve top-k relevant documents

# query_text = "I want to start a business to sell coffee beans, what are my restrictions?"

# # Prepare the DB.
# embedding_function = get_embedding_function()
# db = Chroma(embedding_function=embedding_function) # in-memory db
# db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function) # persistent db

# # Search the DB.
# results = db.similarity_search_with_score(query_text, k=5) # ChromaDB is Cosine Similarity by default

# context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
# context_text