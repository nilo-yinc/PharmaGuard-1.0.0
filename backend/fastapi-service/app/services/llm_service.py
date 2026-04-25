import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

def generate_explanation(gene: str, phenotype: str, drug: str, risk: str) -> dict:
    prompt = f"""
    Explain in simple medical language:
    A patient has {gene} {phenotype} phenotype.
    They are prescribed {drug}.
    The predicted risk is {risk}.
    
    Provide:
    1. A short patient-friendly summary.
    2. A brief mechanism explanation.
    """

    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set")

        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        text = response.choices[0].message.content
        parts = text.split("\n", 1)
        summary = parts[0]
        mechanism = parts[1] if len(parts) > 1 else "Mechanism explanation unavailable."

        return {"summary": summary, "mechanism": mechanism}

    except Exception:
        return {
            "summary": f"{gene} {phenotype} may affect response to {drug}.",
            "mechanism": f"Genetic variation can lead to {risk.lower()} drug response."
        }
