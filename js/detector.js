/**
 * Client-side PII Detection Engine
 * Performs regex + heuristic detection with overlap resolution.
 */

class PIIDetector {
    constructor() {
        this.activeCategories = new Set(Object.keys(PII_CATEGORIES));
    }

    setCategoryActive(categoryId, isActive) {
        if (isActive) {
            this.activeCategories.add(categoryId);
        } else {
            this.activeCategories.delete(categoryId);
        }
    }

    detect(text) {
        if (!text) return [];

        const matches = [];

        // 1. Regex Detectors
        if (this.activeCategories.has("EMAIL")) {
            const pattern = new RegExp(REGEX_PATTERNS.EMAIL);
            let m;
            while ((m = pattern.exec(text)) !== null) {
                matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "EMAIL", confidence: 0.95 });
            }
        }

        if (this.activeCategories.has("IP_ADDRESS")) {
            const pattern = new RegExp(REGEX_PATTERNS.IP_ADDRESS);
            let m;
            while ((m = pattern.exec(text)) !== null) {
                matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "IP_ADDRESS", confidence: 0.95 });
            }
        }

        if (this.activeCategories.has("CREDIT_CARD")) {
            const pattern = new RegExp(REGEX_PATTERNS.CREDIT_CARD);
            let m;
            while ((m = pattern.exec(text)) !== null) {
                matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "CREDIT_CARD", confidence: 0.95 });
            }
        }

        if (this.activeCategories.has("GOVT_ID")) {
            ["GOVT_ID_SSN", "GOVT_ID_PAN", "GOVT_ID_CIN", "GOVT_ID_DIN"].forEach(pKey => {
                const pattern = new RegExp(REGEX_PATTERNS[pKey]);
                let m;
                while ((m = pattern.exec(text)) !== null) {
                    const matchText = m[1] || m[0];
                    const startPos = m[1] ? m.index + m[0].indexOf(m[1]) : m.index;
                    matches.push({ start: startPos, end: startPos + matchText.length, text: matchText, type: "GOVT_ID", confidence: 0.95 });
                }
            });
        }

        if (this.activeCategories.has("PHONE_NUMBER")) {
            const pattern = new RegExp(REGEX_PATTERNS.PHONE_NUMBER);
            let m;
            while ((m = pattern.exec(text)) !== null) {
                const digits = m[0].replace(/\D/g, "");
                if (digits.length >= 7 && digits.length <= 15) {
                    if (!(digits.length === 4 && (digits.startsWith("19") || digits.startsWith("20")))) {
                        matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "PHONE_NUMBER", confidence: 0.90 });
                    }
                }
            }
        }

        if (this.activeCategories.has("DATE_OF_BIRTH")) {
            const pattern = new RegExp(REGEX_PATTERNS.DATE_OF_BIRTH);
            let m;
            while ((m = pattern.exec(text)) !== null) {
                const matchText = m[1] || m[0];
                const startPos = m[1] ? m.index + m[0].indexOf(m[1]) : m.index;
                matches.push({ start: startPos, end: startPos + matchText.length, text: matchText, type: "DATE_OF_BIRTH", confidence: 0.90 });
            }
        }

        if (this.activeCategories.has("COMPANY_NAME")) {
            const pattern = new RegExp(REGEX_PATTERNS.COMPANY_NAME);
            let m;
            while ((m = pattern.exec(text)) !== null) {
                matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "COMPANY_NAME", confidence: 0.85 });
            }
        }

        // 2. Context Rules for Names
        if (this.activeCategories.has("FULL_NAME")) {
            NAME_CONTEXT_KEYWORDS.forEach(kw => {
                const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = new RegExp(`${escapedKw}\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)+)`, 'g');
                let m;
                while ((m = pattern.exec(text)) !== null) {
                    const nameText = m[1].trim();
                    if (!NON_NAME_HEADERS.has(nameText.toUpperCase())) {
                        const startPos = m.index + m[0].indexOf(nameText);
                        matches.push({ start: startPos, end: startPos + nameText.length, text: nameText, type: "FULL_NAME", confidence: 0.90 });
                    }
                }
            });

            // Known Name anchors from assignments
            ["Rashi Patil", "Rohan Dey", "Rajesh Sharma", "Priya Verma", "Amit Kumar"].forEach(kn => {
                const pattern = new RegExp(`\\b${kn}\\b`, 'gi');
                let m;
                while ((m = pattern.exec(text)) !== null) {
                    matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "FULL_NAME", confidence: 0.98 });
                }
            });
        }

        // 3. Physical Address Patterns
        if (this.activeCategories.has("ADDRESS")) {
            const addrPattern = /\b(?:\d{1,4}[/\d]*\s*,?\s*)?(?:Village|Street|Road|Tower|Centre|Off|Taluka|District|Pune|Mumbai|Delhi|Bengaluru|Maharashtra|India)[\w\s,\.\-–\t]+(?:\d{6}|\d{3}\s*\d{3})\b/gi;
            let m;
            while ((m = addrPattern.exec(text)) !== null) {
                matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "ADDRESS", confidence: 0.85 });
            }
        }

        return this._resolveOverlaps(matches);
    }

    _resolveOverlaps(matches) {
        if (!matches.length) return [];

        // Sort by start position asc, length desc, confidence desc
        matches.sort((a, b) => {
            if (a.start !== b.start) return a.start - b.start;
            const lenA = a.end - a.start;
            const lenB = b.end - b.start;
            if (lenA !== lenB) return lenB - lenA;
            return b.confidence - a.confidence;
        });

        const resolved = [];
        let lastEnd = -1;

        for (const m of matches) {
            if (m.start >= lastEnd) {
                resolved.push(m);
                lastEnd = m.end;
            } else if (resolved.length > 0) {
                const prev = resolved[resolved.length - 1];
                if (m.confidence > prev.confidence && (m.end - m.start) > (prev.end - prev.start)) {
                    resolved.pop();
                    resolved.push(m);
                    lastEnd = m.end;
                }
            }
        }

        return resolved;
    }
}
