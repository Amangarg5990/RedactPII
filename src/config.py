"""
Configuration module for PII Redaction Tool.
Defines entity types, regex patterns, contextual keywords, and replacement mapping parameters.
"""

import re

PII_TYPES = [
    "FULL_NAME",
    "EMAIL",
    "PHONE_NUMBER",
    "COMPANY_NAME",
    "ADDRESS",
    "GOVT_ID",       # SSN, PAN, CIN, DIN, Aadhaar
    "CREDIT_CARD",
    "DATE_OF_BIRTH",
    "IP_ADDRESS"
]

# Regex patterns for deterministic PII types
REGEX_PATTERNS = {
    "EMAIL": re.compile(
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',
        re.IGNORECASE
    ),
    "IP_ADDRESS": re.compile(
        r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b'
    ),
    "CREDIT_CARD": re.compile(
        r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b'
    ),
    "GOVT_ID_SSN": re.compile(
        r'\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b'
    ),
    "GOVT_ID_PAN": re.compile(
        r'\b[A-Z]{5}[0-9]{4}[A-Z]\b'
    ),
    "GOVT_ID_CIN": re.compile(
        r'\b[LU]\d{5}[A-Z]{2}\d{4}[PLC]{3}\d{6}\b',
        re.IGNORECASE
    ),
    "GOVT_ID_DIN": re.compile(
        r'\b(?:DIN|Director Identification Number)\s*[:\-]?\s*([0-9]{8})\b',
        re.IGNORECASE
    ),
    "PHONE_NUMBER": re.compile(
        r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}\b'
    ),
    "DATE_OF_BIRTH": re.compile(
        r'\b(?:Born\s+on|DOB|Date of Birth)[\s:]+([0-9]{1,2}[/\.-][0-9]{1,2}[/\.-][0-9]{2,4}|[A-Z][a-z]+\s+\d{1,2},\s+\d{4})\b|\b(?:19|20)\d{2}[/\.-](?:0[1-9]|1[0-2])[/\.-](?:0[1-9]|[12]\d|3[01])\b',
        re.IGNORECASE
    ),
    "COMPANY_NAME": re.compile(
        r'\b[A-Z0-9\s&]{2,40}\s+(?:LIMITED|LTD\.?|PRIVATE LIMITED|PVT\.?\s*LTD\.?|INC\.?|CORPORATION|LLP|HOLDINGS|ENTERPRISES)\b'
    )
}

# Contextual keywords for identifying names, addresses, companies in document sections
NAME_CONTEXT_KEYWORDS = [
    "Mr.", "Ms.", "Mrs.", "Dr.", "Shri", "Smt.", "Promoter", "Director", 
    "Key Managerial Personnel", "Company Secretary", "Chief Financial Officer",
    "Contact Person", "Auditor", "Advocate", "Chairman", "Compliance Officer"
]

NON_NAME_HEADERS = {
    "SELLING SHAREHOLDER", "SELLING SHAREHOLDERS", "PROMOTER GROUP", 
    "COMPANY SECRETARY", "COMPLIANCE OFFICER", "STATUTORY AUDITOR", "BOOK RUNNING LEAD MANAGER"
}
