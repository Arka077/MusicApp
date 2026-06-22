FROM python:3.10-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirements first (IMPORTANT for caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Now copy application code
COPY . .

# Runtime config
ENV PORT=7860
EXPOSE 7860

CMD ["sh", "-c", "PYTHONUNBUFFERED=1 uvicorn main:app --host 0.0.0.0 --port ${PORT} --log-level debug --access-log"]
