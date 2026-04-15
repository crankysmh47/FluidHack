"""
Utility functions for handling string encoding and console output safety.
Specifically designed to handle emojis and special characters on Windows.
"""
import sys
import os
import io

class SafeStreamWrapper:
    """
    A wrapper for stdout/stderr that ensures all writes are sanitized
    for the terminal's encoding by replacing unencodable characters.

    IMPORTANT FIX: The fallback path NEVER uses self.encoding (which could be
    cp1252 on Windows and cannot encode emojis). It always strips to ASCII.
    """
    def __init__(self, original_stream):
        self.original_stream = original_stream
        # Store original encoding only for inspection - never use for fallback encoding
        self.encoding = getattr(original_stream, 'encoding', 'utf-8') or 'utf-8'

    def write(self, data):
        if not isinstance(data, str):
            data = str(data)
        try:
            # Attempt to write directly
            self.original_stream.write(data)
        except (UnicodeEncodeError, LookupError, OSError):
            # CRITICAL: Do NOT re-encode using self.encoding here.
            # self.encoding may be 'cp1252' which also cannot encode the emoji,
            # causing a second crash. Always fall back straight to ASCII replace.
            try:
                safe = data.encode('ascii', errors='replace').decode('ascii')
                self.original_stream.write(safe)
            except Exception:
                pass  # Silently discard if even ASCII fails (pipe broken etc.)

    def flush(self):
        try:
            self.original_stream.flush()
        except Exception:
            pass

    def __getattr__(self, name):
        return getattr(self.original_stream, name)


def install_safe_stdout():
    """
    Globally patches sys.stdout/stderr to prevent encoding crashes on Windows.
    Sets PYTHONIOENCODING env var, tries reconfigure, then wraps streams.
    Call this as early as possible at the top of every entry point.
    """
    # 0. Force env vars so subprocesses also inherit UTF-8 behaviour
    os.environ.setdefault('PYTHONIOENCODING', 'utf-8:replace')
    os.environ.setdefault('PYTHONUTF8', '1')

    # 1. Try modern reconfigure (Python 3.7+) - most reliable on Windows
    for stream_name in ('stdout', 'stderr'):
        stream = getattr(sys, stream_name, None)
        if stream is not None and hasattr(stream, 'reconfigure'):
            try:
                stream.reconfigure(encoding='utf-8', errors='replace')
            except Exception:
                pass

    # 2. Wrap with safety layer regardless of whether reconfigure succeeded
    if not isinstance(sys.stdout, SafeStreamWrapper):
        try:
            sys.stdout = SafeStreamWrapper(sys.stdout)
        except Exception:
            pass
    if not isinstance(sys.stderr, SafeStreamWrapper):
        try:
            sys.stderr = SafeStreamWrapper(sys.stderr)
        except Exception:
            pass


def safe_str(val) -> str:
    """Safely convert any value to an ASCII-friendly string."""
    if val is None:
        return ""
    try:
        s = str(val)
        # Force to ASCII replace for absolute safety
        return s.encode('ascii', 'replace').decode('ascii')
    except Exception:
        return "[Unencodable String]"


def clean_data(data):
    """Recursively strips non-ASCII characters from all strings in a data structure."""
    if isinstance(data, dict):
        return {clean_data(k): clean_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_data(v) for v in data]
    elif isinstance(data, str):
        return safe_str(data)
    else:
        return data


if __name__ == "__main__":
    install_safe_stdout()
    print("Test Output: [Bell Emoji U+1F514] should appear as '?'")
    print(f"Safe string: {safe_str(chr(0x1F514) + ' Signal')}")
