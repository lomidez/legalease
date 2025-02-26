import os
import numpy as np
import pandas as pd
from langchain_community.embeddings import GPT4AllEmbeddings
from langchain_chroma import Chroma

CHROMA_PATH = "chroma_db"

def get_embedding_function():
  model_name = "all-MiniLM-L6-v2.gguf2.f16.gguf"
  gpt4all_kwargs = {'allow_download': 'True'}
  embeddings = GPT4AllEmbeddings(
      model_name=model_name,
      gpt4all_kwargs=gpt4all_kwargs
  )
  return embeddings


def query_rag(query_text: str):
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    results = db.similarity_search_with_score(query_text, k=1)

    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])

    sources_names = []

    for doc, _score in results:
        raw_id = doc.metadata.get("id", "")
        if raw_id:
            file_name = os.path.basename(raw_id.split(":")[0])
            sources_names.append(file_name)

    return context_text, sources_names
