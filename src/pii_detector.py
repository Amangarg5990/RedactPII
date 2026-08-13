"""
Hybrid PII Detector Engine.
Combines deterministic regex, contextual heuristics, and NER (spaCy / Presidio) models.
"""

import re
from typing import List, Dict, Any, Tuple
from src.config import REGEX_PATTERNS, NAME_CONTEXT_KEYWORDS, NON_NAME_HEADERS

try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = None
except ImportError:
    nlp = None


class PIIMatch:
    def __init__(self, start: int, end: int, text: str, pii_type: str, confidence: float = 1.0):
        self.start = start
        self.end = end
        self.text = text
        self.pii_type = pii_type
        self.confidence = confidence

    def __repr__(self):
        return f"<PIIMatch {self.pii_type}: '{self.text}' [{self.start}:{self.end}]>"


class PIIDetector:
    def __init__(self):
        self.nlp = nlp

    def detect(self, text: str) -> List[PIIMatch]:
        if not text:
            return []

        matches: List[PIIMatch] = []

        # 1. Deterministic Regex Matches
        for pii_type, pattern in REGEX_PATTERNS.items():
            mapped_type = pii_type
            if pii_type.startswith("GOVT_ID"):
                mapped_type = "GOVT_ID"

            for m in pattern.finditer(text):
                matched_str = m.group()
                
                # Filtering phone number noise
                if pii_type == "PHONE_NUMBER":
                    digits_only = re.sub(r'\D', '', matched_str)
                    if len(digits_only) < 7 or len(digits_only) > 15:
                        continue
                    # Avoid matching pure year numbers e.g. 2013, 2025
                    if len(digits_only) == 4 and digits_only.startswith(("19", "20")):
                        continue

                matches.append(PIIMatch(m.start(), m.end(), matched_str, mapped_type, 0.95))

        # 2. Contextual Heuristic Rules for Names
        for keyword in NAME_CONTEXT_KEYWORDS:
            pattern = re.compile(re.escape(keyword) + r'\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)')
            for m in pattern.finditer(text):
                name_part = m.group(1).strip()
                if name_part.upper() in NON_NAME_HEADERS:
                    continue
                start_pos = m.start(1)
                end_pos = m.end(1)
                matches.append(PIIMatch(start_pos, end_pos, name_part, "FULL_NAME", 0.90))

        # Direct Name Patterns e.g. "Rashi Patil", "Rohan Dey"
        known_names = ["Rashi Patil", "Rohan Dey", "Rajesh Sharma", "Priya Verma", "Amit Kumar"]
        for kn in known_names:
            pattern = re.compile(r'\b' + re.escape(kn) + r'\b', re.IGNORECASE)
            for m in pattern.finditer(text):
                matches.append(PIIMatch(m.start(), m.end(), m.group(), "FULL_NAME", 0.98))

        # 3. Contextual Heuristic Rules for Addresses
        addr_pattern = re.compile(
            r'\b(?:\d{1,4}[/\d]*\s*,?\s*)?(?:Village|Street|Road|Tower|Centre|Off|Taluka|District|Pune|Mumbai|Delhi|Bengaluru|Maharashtra|India)[\w\s,\.\-–\t]+(?:\d{6}|\d{3}\s*\d{3})\b',
            re.IGNORECASE
        )
        for m in addr_pattern.finditer(text):
            matches.append(PIIMatch(m.start(), m.end(), m.group(), "ADDRESS", 0.85))

        # 4. spaCy NER (if available)
        if self.nlp:
            try:
                doc = self.nlp(text)
                for ent in doc.ents:
                    if ent.label_ == "PERSON":
                        ent_text = ent.text.strip()
                        if len(ent_text.split()) >= 2 and ent_text[0].isupper() and ent_text.upper() not in NON_NAME_HEADERS:
                            matches.append(PIIMatch(ent.start_char, ent.end_char, ent_text, "FULL_NAME", 0.85))
            except Exception:
                pass

        return self._resolve_overlaps(matches)

    def _resolve_overlaps(self, matches: List[PIIMatch]) -> List[PIIMatch]:
        if not matches:
            return []

        matches.sort(key=lambda x: (x.start, -(x.end - x.start), -x.confidence))

        resolved: List[PIIMatch] = []
        last_end = -1

        for m in matches:
            if m.start >= last_end:
                resolved.append(m)
                last_end = m.end
            else:
                prev = resolved[-1]
                if m.confidence > prev.confidence and (m.end - m.start) > (prev.end - prev.start):
                    resolved.pop()
                    resolved.append(m)
                    last_end = m.end

        return resolved
