# utils.py - helper functions for MP3 processing & Whisper API
import os
import tempfile
from typing import List

def split_mp3_if_needed(file_path: str, chunk_size_mb: int = 25) -> List[str]:
    """If file is larger than chunk_size_mb, split into parts. Returns list of file paths."""
    if os.path.getsize(file_path) <= chunk_size_mb * 1024 * 1024:
        return [file_path]
    # Use pydub to split large mp3 - Placeholder, implement splitting logic later
    # For now, raise error to indicate not implemented
    raise NotImplementedError("Audio splitting not yet implemented.")


def delete_file(path: str):
    if os.path.exists(path):
        os.remove(path)
