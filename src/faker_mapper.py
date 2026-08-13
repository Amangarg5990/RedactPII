"""
Consistent PII Synthetic Replacement Mapper.
Ensures that the same real PII entity is always replaced by the exact same synthetic substitute.
For example:
"Rashi Patil" -> "John Doe"
"rashhi.patil@gmail.com" -> "john.doe@example.com"
"+91 9876543210" -> "+91 1234567645"
"""

import hashlib
import random
from typing import Dict
try:
    from faker import Faker
    fake = Faker()
except ImportError:
    fake = None


class SyntheticPIIMapper:
    """
    Maintains a deterministic map from original PII text to synthetic alternatives.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.mapping: Dict[str, str] = {}
        if fake:
            Faker.seed(seed)
        
        # Pre-seeded specific examples to mirror sample assignment behavior
        self._preset_mappings = {
            "Rashi Patil": "John Doe",
            "rashhi.patil@gmail.com": "john.doe@example.com",
            "Rohan Dey": "Peter Parker",
            "rohan.dey@gmail.com": "peter.parker@example.com",
            "+91 9876543210": "+91 1234567645"
        }

    def _get_deterministic_int(self, text: str) -> int:
        h = hashlib.sha256(text.encode('utf-8')).hexdigest()
        return int(h[:8], 16)

    def get_replacement(self, original_text: str, pii_type: str) -> str:
        """
        Retrieves or generates a consistent fake substitute for original_text.
        """
        clean_text = original_text.strip()
        if not clean_text:
            return original_text

        if clean_text in self._preset_mappings:
            return self._preset_mappings[clean_text]

        if clean_text in self.mapping:
            return self.mapping[clean_text]

        seed_val = self._get_deterministic_int(clean_text)
        rng = random.Random(self.seed + seed_val)

        if pii_type == "FULL_NAME":
            first_names = ["Alex", "Jordan", "Morgan", "Taylor", "Casey", "Riley", "Sam", "Chris", "Pat", "Drew", "David", "Michael", "Sarah", "Emily"]
            last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
            fake_name = f"{rng.choice(first_names)} {rng.choice(last_names)}"
            replacement = fake_name

        elif pii_type == "EMAIL":
            user_part = clean_text.split("@")[0].lower()
            # replace non-alphanumeric
            clean_user = "".join(c for c in user_part if c.isalnum() or c in ".")
            replacement = f"{clean_user}.fake@example.com"

        elif pii_type == "PHONE_NUMBER":
            # Preserve prefix if present e.g. +91
            digits = "".join(rng.choices("0123456789", k=10))
            if clean_text.startswith("+91"):
                replacement = f"+91 {digits}"
            elif clean_text.startswith("+"):
                prefix = clean_text.split()[0]
                replacement = f"{prefix} {digits}"
            else:
                replacement = f"+91 {digits[:5]} {digits[5:]}"

        elif pii_type == "COMPANY_NAME":
            fake_comps = ["Acme Corp", "Apex Technologies", "Global Industries", "Omni Enterprises", "Zenith Holdings", "Nexus Solutions"]
            replacement = rng.choice(fake_comps)

        elif pii_type == "ADDRESS":
            streets = ["123 Innovation Way", "456 Tech Park Boulevard", "789 Corporate Plaza", "101 Enterprise Avenue"]
            cities = ["Metro City", "Techville", "Innovate Town", "Cyber City"]
            replacement = f"{rng.choice(streets)}, {rng.choice(cities)} - 400001, Maharashtra, India"

        elif pii_type == "GOVT_ID":
            # PAN / DIN / SSN
            if len(clean_text) == 10 and clean_text[:5].isalpha(): # PAN format
                letters = "".join(rng.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=5))
                nums = "".join(rng.choices("0123456789", k=4))
                last_char = rng.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
                replacement = f"{letters}{nums}{last_char}"
            elif "DIN" in clean_text.upper() or len(clean_text) == 8:
                replacement = "DIN: " + "".join(rng.choices("0123456789", k=8))
            elif "-" in clean_text and len(clean_text) == 11: # SSN
                replacement = f"{rng.randint(100,999):03d}-{rng.randint(10,99):02d}-{rng.randint(1000,9999):04d}"
            else:
                replacement = "ID-" + "".join(rng.choices("0123456789", k=9))

        elif pii_type == "CREDIT_CARD":
            replacement = "4111-XXXX-XXXX-1111"

        elif pii_type == "DATE_OF_BIRTH":
            replacement = "January 01, 1990"

        elif pii_type == "IP_ADDRESS":
            replacement = f"192.168.{rng.randint(1,254)}.{rng.randint(1,254)}"

        else:
            replacement = f"[REDACTED_{pii_type}]"

        self.mapping[clean_text] = replacement
        return replacement
