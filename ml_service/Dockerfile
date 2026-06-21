FROM python:3.10-slim

# Install system dependencies (libsndfile1 is required by librosa/soundfile)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first
COPY requirements.txt .

# Install CPU versions of torch and torchaudio to keep container size reasonable,
# then install the rest of requirements
RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose port (Hugging Face Spaces expects 7860, Google Cloud Run/Render expect $PORT or 8080/8000)
ENV PORT=7860
EXPOSE 7860

# Run FastAPI app
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
