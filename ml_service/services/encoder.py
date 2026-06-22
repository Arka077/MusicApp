import torch
import numpy as np
import requests
import tempfile
import os
import librosa
from transformers import AutoProcessor, ClapModel
from huggingface_hub import hf_hub_download

MODEL_ID = "laion/larger_clap_music_and_speech"
TARGET_SR = 48000
CLIP_SAMPLES = TARGET_SR * 10

_model = None
_processor = None
_device = None
_pca_data = None

# ---------------------------
# MODEL LOADING
# ---------------------------
def ensure_model():
    global _model, _processor, _device
    if _model is None:
        print("🚀 Loading CLAP model...", flush=True)
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        _model = ClapModel.from_pretrained(MODEL_ID).to(_device)
        _processor = AutoProcessor.from_pretrained(MODEL_ID)
        _model.eval()
        print(f"✅ CLAP loaded on {_device}", flush=True)

def load_pca():
    global _pca_data
    if _pca_data is None:
        print("📊 Loading PCA...", flush=True)
        path = hf_hub_download(
            repo_id="arka7/music-pca-model",
            filename="pca_model.npy"
        )
        _pca_data = np.load(path, allow_pickle=True).item()
        print("✅ PCA loaded", flush=True)

# ---------------------------
# AUDIO HELPERS
# ---------------------------
def _download_audio(url: str) -> str:
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tmp.write(r.content)
    tmp.close()
    return tmp.name

def _load_audio(path: str):
    audio, _ = librosa.load(path, sr=TARGET_SR, mono=True)
    return torch.tensor(audio, dtype=torch.float32).unsqueeze(0)

def _chunk(waveform):
    total = waveform.shape[1]
    n = total // CLIP_SAMPLES
    chunks = []
    for i in range(n):
        start = i * CLIP_SAMPLES
        end = (i + 1) * CLIP_SAMPLES
        chunk = waveform[:, start:end].squeeze().numpy()
        chunks.append(chunk)
    return chunks

# ---------------------------
# EMBEDDING CORE
# ---------------------------
@torch.no_grad()
def _embed_chunks(chunks):
    ensure_model()
    inputs = _processor(
        audio=chunks,
        sampling_rate=TARGET_SR,
        return_tensors="pt"
    ).to(_device)
    
    features = _model.get_audio_features(**inputs)
    
    if isinstance(features, torch.Tensor):
        emb = features
    else:
        emb = features
        
    emb = emb / emb.norm(dim=-1, keepdim=True)
    return emb.cpu().numpy()

def _apply_pca(x):
    load_pca()
    mean = _pca_data["mean"]
    comp = _pca_data["components"]
    
    x = x - mean
    x = x @ comp.T
    
    norm = np.linalg.norm(x, axis=1, keepdims=True) + 1e-8
    x = x / norm
    return x.astype(np.float32)

# ---------------------------
# PUBLIC API
# ---------------------------
def embed_audio_from_url(url):
    tmp = _download_audio(url)
    try:
        waveform = _load_audio(tmp)
        chunks = _chunk(waveform)
        
        if len(chunks) == 0:
            raise ValueError("Audio too short (< 10s chunks)")
            
        emb512 = _embed_chunks(chunks)
        emb128 = _apply_pca(emb512)
        
        song = np.mean(emb128, axis=0, keepdims=True)
        song = song / (np.linalg.norm(song) + 1e-8)
        
        return emb128, song
    finally:
        os.unlink(tmp)

def embed_text(query: str):
    ensure_model()
    load_pca()
    
    inputs = _processor(
        text=[query],
        return_tensors="pt"
    ).to(_device)
    
    # We use torch.no_grad() or detach() to prevent the gradient error
    with torch.no_grad():
        features = _model.get_text_features(**inputs)
    
    if isinstance(features, torch.Tensor):
        emb = features
    else:
        emb = features
        
    emb = emb / emb.norm(dim=-1, keepdim=True)
    
    # ADDED .detach() BEFORE .cpu()
    emb = emb.detach().cpu().numpy() 
    
    return _apply_pca(emb)
