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

input_ids = inputs["input_ids"].to(device)
attention_mask = inputs["attention_mask"].to(device)


print("\nStarting autoregressive generation...\n")

generated_ids = input_ids.clone()

max_new_tokens = 20

with torch.no_grad():

    for step in range(max_new_tokens):

        outputs = model(
            input_ids=generated_ids,
            attention_mask=attention_mask,
        )

        # Logits for the next token
        next_token_logits = outputs.logits[:, -1, :]

        # Convert logits into probabilities
        probabilities = torch.softmax(
            next_token_logits,
            dim=-1
        )

        # Select the highest-probability token
        next_token_id = torch.argmax(
            probabilities,
            dim=-1
        )

        # Probability assigned to the selected token
        selected_token_probability = probabilities[
            0,
            next_token_id.item()
        ].item()

        # Decode the selected token
        selected_token = tokenizer.decode(
            [next_token_id.item()]
        )

        print(
            f"Step {step + 1:02d} | "
            f"Token: {repr(selected_token)} | "
            f"Probability: {selected_token_probability:.4f}"
        )

        # Append selected token to the generated sequence
        generated_ids = torch.cat(
            [generated_ids, next_token_id.unsqueeze(0)],
            dim=-1
        )

        # Extend attention mask
        attention_mask = torch.cat(
            [
                attention_mask,
                torch.ones(
                    (attention_mask.shape[0], 1),
                    dtype=attention_mask.dtype,
                    device=device,
                ),
            ],
            dim=-1
        )

        # Stop if EOS token is generated
        if (
            tokenizer.eos_token_id is not None
            and next_token_id.item() == tokenizer.eos_token_id
        ):
            break


generated_text = tokenizer.decode(
    generated_ids[0],
    skip_special_tokens=True
)

print("\nFinal generated text:")
print(generated_text)
