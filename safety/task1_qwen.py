import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

device = "cuda" if torch.cuda.is_available() else "cpu"

print("CUDA available:", torch.cuda.is_available())
print("Using device:", device)

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))

print("\nLoading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

print("Loading model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
)

model = model.to(device)
model.eval()

print("Model loaded successfully.")

prompt = "Explain what artificial intelligence is in simple words."

inputs = tokenizer(
    prompt,
    return_tensors="pt"
)

inputs = {
    key: value.to(device)
    for key, value in inputs.items()
}

print("\nGenerating response...\n")

with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        do_sample=False,
    )

generated_text = tokenizer.decode(
    outputs[0],
    skip_special_tokens=True
)

print("Prompt:")
print(prompt)

print("\nGenerated response:")
print(generated_text)
