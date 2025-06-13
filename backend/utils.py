# utils.py - helper functions for MP3 processing & Whisper API
import os
import tempfile
from typing import List
from pydub import AudioSegment


def split_mp3_if_needed(file_path: str, chunk_size_mb: int = 25) -> List[str]:
    """If file is larger than chunk_size_mb, split into parts. Returns list of file paths."""
    chunk_byte_limit = chunk_size_mb * 1024 * 1024
    if os.path.getsize(file_path) <= chunk_byte_limit:
        return [file_path]

    # Load the MP3 file
    audio = AudioSegment.from_mp3(file_path)
    duration_ms = len(audio)
    # Estimate how much ms fits in chunk_byte_limit
    avg_bitrate = os.path.getsize(file_path) / duration_ms  # bytes per ms
    chunk_ms = int(chunk_byte_limit / avg_bitrate)

    parts = []
    start = 0
    index = 0
    while start < duration_ms:
        end = min(start + chunk_ms, duration_ms)
        chunk = audio[start:end]
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_part{index}.mp3") as tf:
            chunk.export(tf.name, format="mp3")
            parts.append(tf.name)
        start = end
        index += 1

    return parts


def delete_file(path: str):
    if os.path.exists(path):
        os.remove(path)
