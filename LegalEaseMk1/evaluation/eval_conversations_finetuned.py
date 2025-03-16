import csv
import torch
import pandas as pd
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel
from rag import query_rag  # Ensure this function is correctly implemented

def init_model():
    """Initialize the fine-tuned LegalEaseV2 model with optional quantization."""
    model_name = "XCIT3D247/LegalEaseV2"  # Use the fine-tuned model
    
    # Enable quantization for efficient inference
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,  
        bnb_4bit_use_double_quant=True,  
        bnb_4bit_quant_type="nf4",  
        bnb_4bit_compute_dtype=torch.bfloat16  
    )

    # Load the model with quantization
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto"
    )

    # Load fine-tuned weights (LoRA adapters)
    model = PeftModel.from_pretrained(model, model_name)

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    # Set tokenizer padding and EOS token
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "left"  # Ensures better performance in batch decoding

    return model, tokenizer

def get_prompt():
    """Reads the system instruction prompt from a file."""
    with open("prompt.txt", "r") as file:
        return file.read().strip()

def generate_responses(model, tokenizer, questions):
    system_prompt = get_prompt()
    messages = [{"role": "system", "content": system_prompt}]
    results = []
    
    for question in questions:
        rag_context, _ = query_rag(question)  # Retrieve RAG context
        formatted_input = f"Relevant information: {rag_context}\n\nUser: {question}"
        messages.append({"role": "user", "content": formatted_input})
        
        # Tokenization
        model_inputs = tokenizer.apply_chat_template(messages, return_tensors="pt", padding=True).to("cuda")
        
        # Generate response
        with torch.no_grad():
            generated_ids = model.generate(model_inputs, max_new_tokens=500, do_sample=True)
        
        output = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        llm_response = output.split('[/INST]')[-1].strip()
        
        results.append({"User": question, "LegalEase": llm_response, "Evaluation": ""})
        messages.append({"role": "assistant", "content": llm_response})
    
    return pd.DataFrame(results)

def save_to_csv(df, filename="LegalEase_Responses.csv"):
    df.to_csv(filename, index=False, encoding="utf-8")

if __name__ == "__main__":
    test_questions = [
        # "I am starting a consulting business and want to avoid self-employment tax  as much as possible. What structure should I use?",
        # "I want to start a business that promotes environmental conservation. What  are the key steps?",
        # "I want to form a charity to raise funds for children's education. What  structure should I choose?",
        # "I am an independent software developer. Should I form an LLC or an S- Corp?", 
        # "I plan to open a business that provides free medical services to low-income  families. What steps do I need to take?", 
        # "I want to open a bakery but want to protect my personal assets in case of  lawsuits. What structure should I choose?", 
        # "I am starting a business and want to avoid paying both corporate and  personal income tax. What should I do?", 
        # "I want to create a business that allows me to seek donations and grants.  What structure should I choose?", 
        # "I want to start a business with limited liability and the ability to choose how  it is taxed. What should I do?", 
        # "I plan to run a organization that provides meals to the homeless.  What legal steps should I take?", 
        # "I want to start a business with multiple owners and avoid corporate double  taxation. What structure should I choose?", 
        # "I want to register a business that provides legal services. What structure should I use?",
        # "I want to form a business that qualifies for tax-exempt donations. What  should I do?",
        # "I have a small business and want to ensure I do not pay corporate  taxes. What structure should I choose?", 
        # "I plan to start a small family business and want to protect my personal  assets. What structure should I choose?"
        # "I want to start a organization focused on community outreach.  What legal requirements should I follow?", 
        # "I want to start a business but plan to raise investment funds later. Should I  choose an LLC or an S-Corp?", 
        # "I plan to start a business that offers housing assistance.", 
        # "I want to open a gym and need liability protection from potential lawsuits.",
        # "I plan to start a nonprofit for animal rescue.",
        # "I want to start a consulting business but want to avoid strict corporate formalities.", 
        # "I want to start a business that provides job training to low-income  individuals.", 
        # "I plan to start an online retail business and want to protect my personal  assets.", 
        # "I plan to start S-Corporation that has more than 100 shareholders.", # should be wrong

        "I am starting a consulting business and want to avoid self-employment tax  as much as possible.", 
        "I want to start a nonprofit that promotes environmental conservation.", 
        "I plan to create a business that helps veterans transition to civilian careers.", 
        "I want to start a company for providing free coding bootcamps to students.", 
        "I plan to start a coffee shop with my spouse and want to protect  our personal assets.", 
        "I’m starting a digital marketing agency and want to pay myself a salary while reducing self-employment taxes.",
        "I want to start a business that provides scholarships for underprivileged  students.",
        "I want to open a tech startup and attract investors.", 
        "I am launching a small home-based bakery and want liability protection  without excessive paperwork."
        "I want to start an event planning company with a business partner and want  liability protection.", 
        "I want to start a graphic design business and limit my liability.", 
        "I am opening a fitness coaching business and want to avoid personal liability for business debts.", 
        "I am opening a fitness coaching business", 
        "I want to start an e-commerce business and need flexibility in taxation.", 
        "I want to open a photography business.",
        "I plan to start a business selling handmade jewelry online. I want liability  protection but minimal paperwork.", 
        "I plan to start a software development company and want to reduce self- employment taxes.", 
        "I want to open a restaurant with a few business partners and avoid corporate  double taxation.", 
        "I am a freelance consultant and want liability protection.", 
        "I want to start a business that allows me to seek grants and donations.", 
        "I plan to start a business that helps small businesses.", 
        "I want to start a nonprofit to promote STEM education", 
        "I want to open a family-owned grocery store with limited liability.",
        "I am opening a bakery and want liability protection.", 
        "I want to open a co-working space with a few business partners.", 
        "I want to start a renewable energy startup and attract venture capital investment.", 
        "I am a musician and want to create a business entity to manage my royalties and avoid personal liability.", 
        "I want to form a cooperative bakery where all employees have ownership stakes."
    ]
    

    
    print("Initializing Model...")
    model, tokenizer = init_model()
    print("Generating responses...")
    responses = generate_responses(model, tokenizer, test_questions)
    print("Saving responses to CSV...")
    output_file = "/media/volume/LegalEaseMaxim/CPSC5830-Team1/LegalEaseMk1/datasets/eval_LegalEase_Responses2_finetuned.csv"
    responses.to_csv(output_file, index=False, encoding="utf-8")
    print("Done!")
