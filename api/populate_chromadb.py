"""
apt install python3-pip
pip3 install pandas transformers subword-nmt nltk pypdf langchain_community boto3 gpt4all chromadb langchain

# Must Install all of the following:
!pip install pdfplumber
!pip install gdown
!pip install subword-nmt
!pip install nltk
!pip install pypdf
!pip install langchain_community
!pip install boto3
!pip install gpt4all
!pip install chromadb
"""

import os
import numpy as np
import pandas as pd
import argparse
import shutil
from langchain.document_loaders.pdf import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain.vectorstores import Chroma
from langchain_community.embeddings.ollama import OllamaEmbeddings
from langchain_community.embeddings.bedrock import BedrockEmbeddings
from langchain_community.embeddings import GPT4AllEmbeddings
from langchain.prompts import ChatPromptTemplate
from transformers import pipeline

# Initialize variables
curr_path = os.path.abspath(__file__)
api_index = curr_path.find("/api")

# If "/api" is found in the path, replace it with "/docs"
if api_index != -1:
    new_path = curr_path[:api_index] + "/" 
else:
    new_path = curr_path  # If "/api" is not found, keep the original path


print('      999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999')
FOLDER_WITH_PDFs = "/mnt/c/Users/YourUser/Documents/data_rag"  
CHROMA_PATH = new_path + "datasets/chroma_db" 
DATA_PATH = new_path + 'docs'
print("doc path", DATA_PATH)

print('chroma path', CHROMA_PATH)

def get_embedding_function():
    model_name = "all-MiniLM-L6-v2.gguf2.f16.gguf"
    gpt4all_kwargs = {'allow_download': 'True'}
    embeddings = GPT4AllEmbeddings(
        model_name=model_name,
        gpt4all_kwargs=gpt4all_kwargs
    )
    return embeddings

def add_to_chroma(chunks: list[Document]):
    # Load the existing database.
    db = Chroma(
        persist_directory=CHROMA_PATH, embedding_function=get_embedding_function()
    )

    # Calculate Page IDs.
    chunks_with_ids = calculate_chunk_ids(chunks)

    # Add or Update the documents.
    existing_items = db.get(include=[])
    existing_ids = set(existing_items["ids"])
    print(f"Number of existing documents in DB: {len(existing_ids)}")

    # Only add documents that don't exist in the DB.
    new_chunks = []
    for chunk in chunks_with_ids:
        if chunk.metadata["id"] not in existing_ids:
            new_chunks.append(chunk)

    if len(new_chunks):
        print(f"Adding new documents: {len(new_chunks)}")
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]
        db.add_documents(new_chunks, ids=new_chunk_ids)
        db.persist()
    else:
        print("No new documents to add")

def calculate_chunk_ids(chunks):
    last_page_id = None
    current_chunk_index = 0

    for chunk in chunks:
        source = chunk.metadata.get("source")
        page = chunk.metadata.get("page")
        current_page_id = f"{source}:{page}"

        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0

        chunk_id = f"{current_page_id}:{current_chunk_index}"
        last_page_id = current_page_id

        chunk.metadata["id"] = chunk_id

    return chunks

def clear_database():
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)

def load_documents():
    document_loader = PyPDFDirectoryLoader(DATA_PATH)
    return document_loader.load()

def split_documents(documents: list[Document]):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=80,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)


doc = load_documents()
# Generate Chunks
chunks = split_documents(doc)
# Add chunks to database
add_to_chroma(chunks)
# Save embedding function used by database
embedding_function = get_embedding_function()
data_base = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

# Simple Query of cosine similarity to DB to ensure success
query_text = 'How do I start a business?'
results = data_base.similarity_search_with_score(query_text, k=5)  
context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
print(context_text)