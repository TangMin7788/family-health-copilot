import html
from typing import List, Tuple

def find_spans(text: str, needle: str) -> List[Tuple[int, int]]:
    """Find all occurrences of needle in text (exact substring match)."""
    if not needle:
        return []
    spans = []
    start = 0
    while True:
        idx = text.find(needle, start)
        if idx == -1:
            break
        spans.append((idx, idx + len(needle)))
        start = idx + 1
    return spans

def merge_spans(spans: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    """Merge overlapping spans."""
    if not spans:
        return []
    spans = sorted(spans, key=lambda x: x[0])
    merged = [spans[0]]
    for s, e in spans[1:]:
        ps, pe = merged[-1]
        if s <= pe:
            merged[-1] = (ps, max(pe, e))
        else:
            merged.append((s, e))
    return merged

def render_highlight(text: str, spans: List[Tuple[int, int]]) -> str:
    """
    Render text with <mark> highlight based on spans.
    Escapes HTML to avoid injection, then injects <mark>.
    """
    safe = html.escape(text)
    # IMPORTANT: spans are based on original text indices, but we escaped it.
    # To keep it simple and correct, we rebuild using slices before escaping per slice:
    out = []
    last = 0
    for s, e in merge_spans(spans):
        out.append(html.escape(text[last:s]))
        out.append(f"<mark>{html.escape(text[s:e])}</mark>")
        last = e
    out.append(html.escape(text[last:]))
    # Use <pre> for preserving formatting
    return "<pre style='white-space: pre-wrap; word-wrap: break-word;'>" + "".join(out) + "</pre>"
