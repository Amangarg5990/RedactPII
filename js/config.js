/**
 * Configuration & PII Entity Metadata
 */

const PII_CATEGORIES = {
    FULL_NAME: {
        id: "FULL_NAME",
        name: "Full Names",
        color: "#6366f1",
        badgeBg: "rgba(99, 102, 241, 0.15)",
        badgeText: "#818cf8",
        description: "Person names, titles, and director identifiers"
    },
    EMAIL: {
        id: "EMAIL",
        name: "Email Addresses",
        color: "#06b6d4",
        badgeBg: "rgba(6, 182, 212, 0.15)",
        badgeText: "#22d3ee",
        description: "Corporate and personal email addresses"
    },
    PHONE_NUMBER: {
        id: "PHONE_NUMBER",
        name: "Phone Numbers",
        color: "#10b981",
        badgeBg: "rgba(16, 185, 129, 0.15)",
        badgeText: "#34d399",
        description: "International, landline, and mobile numbers"
    },
    COMPANY_NAME: {
        id: "COMPANY_NAME",
        name: "Company Names",
        color: "#a855f7",
        badgeBg: "rgba(168, 85, 247, 0.15)",
        badgeText: "#c084fc",
        description: "Corporations, Ltd, Inc, LLP entities"
    },
    ADDRESS: {
        id: "ADDRESS",
        name: "Physical Addresses",
        color: "#f59e0b",
        badgeBg: "rgba(245, 158, 11, 0.15)",
        badgeText: "#fbbf24",
        description: "Street, postal, and office locations"
    },
    GOVT_ID: {
        id: "GOVT_ID",
        name: "Government & Tax IDs",
        color: "#ec4899",
        badgeBg: "rgba(236, 72, 153, 0.15)",
        badgeText: "#f472b6",
        description: "SSN, PAN, CIN, DIN, Aadhaar"
    },
    CREDIT_CARD: {
        id: "CREDIT_CARD",
        name: "Credit Cards",
        color: "#ef4444",
        badgeBg: "rgba(239, 68, 68, 0.15)",
        badgeText: "#f87171",
        description: "Visa, Mastercard, Amex numbers"
    },
    DATE_OF_BIRTH: {
        id: "DATE_OF_BIRTH",
        name: "Dates of Birth",
        color: "#8b5cf6",
        badgeBg: "rgba(139, 92, 246, 0.15)",
        badgeText: "#a78bfa",
        description: "Birthdates and explicit age mentions"
    },
    IP_ADDRESS: {
        id: "IP_ADDRESS",
        name: "IP Addresses",
        color: "#3b82f6",
        badgeBg: "rgba(59, 130, 246, 0.15)",
        badgeText: "#60a5fa",
        description: "IPv4 and IPv6 network identifiers"
    }
};

const REGEX_PATTERNS = {
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi,
    IP_ADDRESS: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    CREDIT_CARD: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
    GOVT_ID_SSN: /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g,
    GOVT_ID_PAN: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g,
    GOVT_ID_CIN: /\b[LU]\d{5}[A-Z]{2}\d{4}[PLC]{3}\d{6}\b/gi,
    GOVT_ID_DIN: /\b(?:DIN|Director Identification Number)\s*[:\-]?\s*([0-9]{8})\b/gi,
    PHONE_NUMBER: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}\b/g,
    DATE_OF_BIRTH: /\b(?:Born\s+on|DOB|Date of Birth)[\s:]+([0-9]{1,2}[/\.-][0-9]{1,2}[/\.-][0-9]{2,4}|[A-Z][a-z]+\s+\d{1,2},\s+\d{4})\b|\b(?:19|20)\d{2}[/\.-](?:0[1-9]|1[0-2])[/\.-](?:0[1-9]|[12]\d|3[01])\b/gi,
    COMPANY_NAME: /\b[A-Z0-9\s&]{2,40}\s+(?:LIMITED|LTD\.?|PRIVATE LIMITED|PVT\.?\s*LTD\.?|INC\.?|CORPORATION|LLP|HOLDINGS|ENTERPRISES)\b/g
};

const NAME_CONTEXT_KEYWORDS = [
    "Mr.", "Ms.", "Mrs.", "Dr.", "Shri", "Smt.", "Promoter", "Director",
    "Key Managerial Personnel", "Company Secretary", "Chief Financial Officer",
    "Contact Person", "Auditor", "Advocate", "Chairman", "Compliance Officer"
];

const NON_NAME_HEADERS = new Set([
    "SELLING SHAREHOLDER", "SELLING SHAREHOLDERS", "PROMOTER GROUP", 
    "COMPANY SECRETARY", "COMPLIANCE OFFICER", "STATUTORY AUDITOR", "BOOK RUNNING LEAD MANAGER"
]);
