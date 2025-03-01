from transformers import AutoModelForCausalLM, AutoTokenizer, StoppingCriteriaList
from rag import query_rag  # Assuming query_rag retrieves relevant RAG context
import torch
import pandas as pd

file_path = "/media/volume/LegalEaseMaxim/CPSC5830-Team1/LegalEaseMk1/datasets/eval_business_type_true.csv"
df = pd.read_csv(file_path)


output_file = "/media/volume/LegalEaseMaxim/CPSC5830-Team1/LegalEaseMk1/datasets/eval_business_type_results.csv"
df = pd.read_csv(output_file)
print(df.head())