from transformers import AutoModelForCausalLM, AutoTokenizer
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import torch
import pandas as pd
from rag import query_rag

embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def compute_hallucination_score(rag_context, generated_response):
    if not rag_context.strip():
        return 1.0

    # Generate embeddings
    context_embedding = embedding_model.encode([rag_context])
    response_embedding = embedding_model.encode([generated_response])
    
    # Compute cosine similarity
    similarity = cosine_similarity(context_embedding, response_embedding)[0][0]
    
    # Hallucination score (Lower similarity = More hallucination)
    hallucination_score = 1 - similarity
    
    return hallucination_score

def init_model():
    model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2", device_map="auto")  # Base model
    tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.2")
    tokenizer.pad_token = tokenizer.eos_token
    return model, tokenizer

def get_prompt():
    with open("prompt.txt", "r") as file:
        return file.read().strip()

def generate_response(user_input, model, tokenizer, use_rag=True):
    
    rag_context, sources = query_rag(user_input) if use_rag else ("", [])

    formatted_input = f"Relevant information: {rag_context}\n\nUser: {user_input}" if use_rag else user_input
    messages = [{"role": "system", "content": get_prompt()}, {"role": "user", "content": formatted_input}]

    model_inputs = tokenizer.apply_chat_template(messages, return_tensors="pt", padding=True).to("cuda")
    
    generated_ids = model.generate(model_inputs, max_new_tokens=500, do_sample=True)
    
    output = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    llm_response = output.split('[/INST]')[-1].strip()
    
    return llm_response, rag_context

# Run Evaluation with RAG vs. No RAG
def evaluate_rag_vs_no_rag():
    model, tokenizer = init_model()
    
    # 110 questions
    test_questions = [
        "What business structure is best for startups?",
        "What are the tax benefits of an LLC?",
        "How do I register a C-Corp?",
        "How can I verify if a charity is legitimate?",
        "If starting a business in the financial sector, what activities are considered part of the security business?",
        "What is the liability structure for a corporation?",
        "What operational requirements must a corporation meet?",
        "How is a corporation taxed, and what options do owners have regarding taxation?",
        "How can a market analysis help determine if my product or service has a demand in Washington?",
        "What factors should I consider when describing my target market for a business in Washington?",
        "How can I estimate sales volume and revenue for my new business in Washington?",
        "What factors should I consider when choosing a business name for my new venture in Washington?",
        "How can I check if my desired business name is already in use in Washington?",
        "What is the difference between a legal entity name, trade name, and trademark?",
        "How do I reserve or register a business name in Washington?",
        "What do I need to do if I choose a corporation or LLC structure for my business in Washington?",
        "Should I register my business entity in Washington or another state?",
        "What is the role of a 'registered agent' in a business entity?",
        "What are the governance documents required when forming a corporation or LLC?",
        "What factors should I consider when choosing a location for my business?",
        "Are there any restrictions I should be aware of for a home-based business?",
        "What do I need to do if I want to obtain a federal tax number for my LLC or corporation?",
        "How do LLCs handle federal tax filing and what options are available?",
        "How do I form an LLC in Washington State?",
        "What is the filing fee to create an LLC in Washington State?",
        "Do I need a registered agent for my Washington LLC?",
        "Can I be my own registered agent in Washington?",
        "What information is required in the Washington LLC Certificate of Formation?",
        "Does Washington allow professional LLCs (PLLCs)?",
        "How long does it take to form an LLC in Washington?",
        "Can I reserve an LLC name before filing in Washington?",
        "Are Washington LLCs required to have an operating agreement?",
        "What is a Unified Business Identifier (UBI) in Washington?",
        "Does Washington have an annual LLC fee?",
        "When is the Washington LLC Annual Report due?",
        "What happens if I don’t file my Washington LLC Annual Report?",
        "Does Washington State have a corporate income tax for LLCs?",
        "How much is the B&O tax for Washington LLCs?",
        "Does Washington require LLCs to pay sales tax?",
        "Do single-member LLCs in Washington need an EIN?",
        "Can an LLC in Washington be taxed as an S-Corp?",
        "Are LLC members required to pay self-employment tax in Washington?",
        "Can a Washington LLC opt out of B&O tax?",
        "Does an LLC protect my personal assets in Washington?",
        "Can a Washington LLC member be personally sued?",
        "Can my LLC be sued in Washington?",
        "Does Washington require LLCs to carry liability insurance?",
        "What happens if my Washington LLC is sued?",
        "Can I operate a home-based business as an LLC in Washington?",
        "Does Washington allow LLCs to have non-U.S. members?",
        "Can my LLC own real estate in Washington?",
        "Does Washington require LLCs to have a business license?",
        "Can I change my Washington LLC’s name?",
        "Can a Washington LLC be owned by another LLC?",
        "What is a manager-managed LLC in Washington?",
        "What is a member-managed LLC in Washington?",
        "Does Washington allow anonymous LLC ownership?",
        "Can a Washington LLC have just one owner?",
        "Do I need to notify creditors before dissolving a Washington LLC?",
        "What happens if I don’t formally dissolve my LLC in Washington?",
        "Can a Washington LLC open a bank account?",
        "Does Washington require LLCs to file for a DBA?",
        "Can a Washington LLC own another LLC?",
        "Can I convert a sole proprietorship to an LLC in Washington?",
        "Can an LLC operate under multiple business names in Washington?",
        "What is the difference between an LLC and a PLLC in Washington?",
        "Can an LLC be taxed as a corporation in Washington?",
        "What is the first step to forming an LLC in Washington State?",
        "How much does it cost to form an LLC in Washington State?",
        "Do I need a registered agent for my Washington LLC?",
        "Can I be my own registered agent in Washington?",
        "I want to start a nonprofit that provides job training to low-income individuals. How should I structure it?",
        "I plan to start an online retail business and want to protect my personal assets. What structure should I choose?",
        "Can an S-Corporation have more than 100 shareholders?",
        "I am starting a consulting business and want to avoid self-employment tax as much as possible. What structure should I use?",
        "What are the main tax benefits of an LLC compared to a sole proprietorship?",
        "I want to start a nonprofit that promotes environmental conservation. What are the key steps?",
        "I own a rental property business. Would an LLC help me?",
        "What are the annual reporting requirements for an S-Corporation?",
        "I plan to create a nonprofit that helps veterans transition to civilian careers. What should I do?",
        "What happens if I don't file an annual report for my LLC?",
        "I want to start a nonprofit for providing free coding bootcamps to underprivileged students. What steps should I take?",
        "I plan to start a coffee shop with my spouse and want to protect our personal assets. What business structure should we choose?",
        "I’m starting a digital marketing agency and want to pay myself a salary while reducing self-employment taxes. What structure should I choose?",
        "Can a nonprofit organization pay its employees?",
        "I want to open a tech startup and attract investors. Should I form an LLC or an S-Corp?",
        "What are the legal requirements for forming an S-Corp?",
        "I am launching a small home-based bakery and want liability protection without excessive paperwork. What should I do?",
        "Can a nonprofit organization make a profit?",
        "I want to start an event planning company with a business partner and want liability protection. Should we choose an LLC or an S-Corp?",
        "What happens if an S-Corp fails to follow corporate formalities?",
        "I plan to start a nonprofit that provides free mental health services to veterans. What business structure should I choose?",
        "I want to start a graphic design business and limit my liability. What structure should I pick?",
        "Can an LLC be converted into an S-Corporation later?",
        "I am opening a fitness coaching business and want to avoid personal liability for business debts. Should I form an LLC or an S-Corp?",
        "I want to start a nonprofit that provides scholarships for underprivileged students. What are my next steps?",
        "What are the disadvantages of an S-Corporation compared to an LLC?",
        "I want to start an e-commerce business and need flexibility in taxation. Should I choose an LLC or an S-Corp?",
        "How do I maintain compliance as a Non-Profit Corporation?",
        "I want to open a photography business with liability protection. What structure is best?",
        "What happens if an LLC does not file its annual reports?",
        "I plan to start a business selling handmade jewelry online. I want liability protection but minimal paperwork. What structure should I choose?",
        "I want to start a nonprofit to provide disaster relief. What are the legal steps?",
        "What are the benefits of forming an LLC instead of operating as a sole proprietorship?",
        "I plan to start a software development company and want to reduce self-employment taxes. Should I choose an LLC or S-Corp?",
        "I want to start a nonprofit that provides free legal assistance to immigrants. How should I register my organization?",
        "I want to open a restaurant with a few business partners and avoid corporate double taxation. What structure should we choose?",
        "I am a freelance consultant and want liability protection. Should I choose an LLC or an S-Corp?",
        "What are the compliance requirements for an S-Corporation?",
        "I want to start a business that allows me to seek grants and donations. What structure should I choose?"
    ]

    results = []
    
    for question in test_questions:
        response_no_rag, _ = generate_response(question, model, tokenizer, use_rag=False)
        response_with_rag, rag_context = generate_response(question, model, tokenizer, use_rag=True)
        
        hallucination_score_no_rag = compute_hallucination_score(rag_context, response_no_rag)
        hallucination_score_with_rag = compute_hallucination_score(rag_context, response_with_rag)

        results.append({
            "Question": question,
            "Response": response_with_rag,
            "No_RAG": hallucination_score_no_rag,
            "RAG": hallucination_score_with_rag
        })
    
    df_results = pd.DataFrame(results)
    print(df_results.head())

    output_file = "/media/volume/LegalEaseMaxim/CPSC5830-Team1/LegalEaseMk1/datasets/eval_RAG_results.csv"
    df_results.to_csv(output_file, index=False)
    print(f"Results saved to {output_file}")


if __name__ == "__main__":
    evaluate_rag_vs_no_rag()
