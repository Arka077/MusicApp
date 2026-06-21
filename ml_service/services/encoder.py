import torch
import numpy as np
import requests
import tempfile
import os
from transformers import AutoProcessor, ClapModel
import librosa

# ─── Constants ───────────────────────────────────────────
MODEL_ID     = "laion/larger_clap_music_and_speech"
TARGET_SR    = 48000
CLIP_SAMPLES = TARGET_SR * 10  # 10 seconds = 480000 samples

# ─── Module-level singletons ─────────────────────────────
_model     = None
_processor = None
_device    = None

def load_model():
    global _model, _processor, _device
    _device    = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _model     = ClapModel.from_pretrained(MODEL_ID).to(_device)
    _processor = AutoProcessor.from_pretrained(MODEL_ID)
    _model.eval()
    print(f"   Model running on: {_device}")

# ─── Audio helpers ────────────────────────────────────────

def _download_audio(url: str) -> str:
    """Download audio from ImageKit URL to a temp file, return path"""
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    # Write to temp file with .mp3 extension so torchaudio knows the format
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tmp.write(response.content)
    tmp.close()
    return tmp.name

def _load_and_resample(file_path: str) -> torch.Tensor:
    """Load audio and convert to mono 48kHz"""

    audio, sr = librosa.load(
        file_path,
        sr=TARGET_SR,
        mono=True
    )

    waveform = torch.tensor(audio, dtype=torch.float32).unsqueeze(0)

    return waveform

def _chunk_waveform(waveform: torch.Tensor) -> list:
    """Split waveform into 10s chunks, discard remainder"""
    total      = waveform.shape[1]
    num_chunks = total // CLIP_SAMPLES
    chunks     = []

    for i in range(num_chunks):
        start = i * CLIP_SAMPLES
        chunk = waveform[:, start:start + CLIP_SAMPLES].squeeze().numpy()
        chunks.append(chunk)

    return chunks

@torch.no_grad()
def _embed_chunks(chunks: list) -> np.ndarray:
    """Embed a list of audio chunks, returns (N, 512) array"""
    inputs = _processor(
        audio=chunks,
        sampling_rate=TARGET_SR,
        return_tensors="pt"
    ).to(_device)

    output = _model.get_audio_features(**inputs)

    if hasattr(output, 'audio_embeds'):
        features = output.audio_embeds
    elif hasattr(output, 'pooler_output'):
        features = output.pooler_output
    else:
        features = output

    features = features / features.norm(dim=-1, keepdim=True)
    return features.cpu().numpy()

# ─── PCA ─────────────────────────────────────────────────

_pca_data = None

def load_pca():
    global _pca_data
    pca_path = os.path.join(os.path.dirname(__file__), "../models/pca_model.npy")
    _pca_data = np.load(pca_path, allow_pickle=True).item()
    print("✅ PCA model loaded")

def _apply_pca(embeddings_512: np.ndarray) -> np.ndarray:
    """Compress 512D → 128D using saved PCA transform"""
    mean       = _pca_data["mean"]
    components = _pca_data["components"]
    compressed = (embeddings_512 - mean) @ components.T
    compressed = compressed / np.linalg.norm(compressed, axis=1, keepdims=True)
    return compressed.astype(np.float32)

# ─── Public API ───────────────────────────────────────────

def embed_audio_from_url(audio_url: str) -> tuple[np.ndarray, np.ndarray]:
    """
    Download audio from URL, chunk it, embed each chunk.
    Returns:
        chunk_embeddings_128d: (N, 128) array — for Qdrant
        song_embedding_128d:   (1, 128) array — averaged song vector
    """
    if _pca_data is None:
        load_pca()

    # Download to temp file
    tmp_path = _download_audio(audio_url)

    try:
        waveform = _load_and_resample(tmp_path)
        chunks   = _chunk_waveform(waveform)

        if not chunks:
            raise ValueError("Audio too short — less than 10 seconds")

        # Embed all chunks in one batch
        embeddings_512 = _embed_chunks(chunks)

        # PCA compress
        embeddings_128 = _apply_pca(embeddings_512)

        # Song-level: average all chunks then renormalize
        song_embedding = np.mean(embeddings_128, axis=0, keepdims=True)
        song_embedding = song_embedding / np.linalg.norm(song_embedding)

        return embeddings_128, song_embedding

    finally:
        os.unlink(tmp_path)  # Always clean up temp file

@torch.no_grad()
def embed_text(query: str) -> np.ndarray:
    """
    Encode a text query to 128D.
    Returns: (1, 128) array
    """
    if _pca_data is None:
        load_pca()

    inputs = _processor(text=[query], return_tensors="pt").to(_device)
    output = _model.get_text_features(**inputs)

    if hasattr(output, 'text_embeds'):
        text_emb = output.text_embeds
    elif hasattr(output, 'pooler_output'):
        text_emb = output.pooler_output
    else:
        text_emb = output

    text_emb = text_emb / text_emb.norm(dim=-1, keepdim=True)
    text_np  = text_emb.cpu().numpy()

    return _apply_pca(text_np)