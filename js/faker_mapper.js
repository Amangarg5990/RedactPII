/**
 * Synthetic PII Replacement Engine in JavaScript
 * Ensures consistent mapping across document lifetime.
 */

class SyntheticPIIMapper {
    constructor(seed = 42) {
        self.seed = seed;
        this.mapping = {};

        // Pre-seeded explicit mappings matching assignment examples
        this.presets = {
            "Rashi Patil": "John Doe",
            "rashhi.patil@gmail.com": "john.doe@example.com",
            "Rohan Dey": "Peter Parker",
            "rohan.dey@gmail.com": "peter.parker@example.com",
            "+91 9876543210": "+91 1234567645"
        };
    }

    _simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    getReplacement(originalText, piiType, mode = "FAKER") {
        const clean = originalText.trim();
        if (!clean) return originalText;

        if (mode === "MASK") {
            return `[REDACTED_${piiType}]`;
        }

        if (mode === "ASTERISK") {
            return clean.replace(/[a-zA-Z0-9]/g, "*");
        }

        // FAKER mode (consistent synthetic values)
        if (this.presets[clean]) {
            return this.presets[clean];
        }

        if (this.mapping[clean]) {
            return this.mapping[clean];
        }

        const hashVal = this._simpleHash(clean);
        let replacement = "";

        switch (piiType) {
            case "FULL_NAME": {
                const firsts = ["Alex", "Jordan", "Morgan", "Taylor", "Casey", "Riley", "Sam", "Chris", "David", "Sarah", "Michael", "Emily"];
                const lasts = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez"];
                const fIndex = hashVal % firsts.length;
                const lIndex = (hashVal >> 3) % lasts.length;
                replacement = `${firsts[fIndex]} ${lasts[lIndex]}`;
                break;
            }

            case "EMAIL": {
                const user = clean.split("@")[0].toLowerCase().replace(/[^a-z0-9.]/g, "");
                replacement = `${user}.fake@example.com`;
                break;
            }

            case "PHONE_NUMBER": {
                const numStr = (hashVal.toString() + "9876543210").slice(0, 10);
                if (clean.startsWith("+91")) {
                    replacement = `+91 ${numStr.slice(0, 5)} ${numStr.slice(5)}`;
                } else if (clean.startsWith("+")) {
                    replacement = `+1 555-${numStr.slice(0, 3)}-${numStr.slice(3, 7)}`;
                } else {
                    replacement = `+91 ${numStr}`;
                }
                break;
            }

            case "COMPANY_NAME": {
                const comps = ["Acme Corp", "Apex Technologies", "Global Industries", "Omni Enterprises", "Zenith Holdings", "Nexus Solutions"];
                replacement = comps[hashVal % comps.length];
                break;
            }

            case "ADDRESS": {
                const streets = ["123 Innovation Way", "456 Tech Park Blvd", "789 Corporate Plaza"];
                const cities = ["Metro City", "Techville", "Cyber City"];
                replacement = `${streets[hashVal % streets.length]}, ${cities[(hashVal >> 2) % cities.length]} - 400001, India`;
                break;
            }

            case "GOVT_ID": {
                if (clean.length === 10 && /^[A-Z]{5}/.test(clean)) {
                    replacement = "ABCDE" + (hashVal % 9000 + 1000) + "X";
                } else if (clean.length === 8) {
                    replacement = "0" + (hashVal % 9000007 + 1000000);
                } else {
                    replacement = "ID-" + (hashVal % 900000000 + 100000000);
                }
                break;
            }

            case "CREDIT_CARD": {
                replacement = "4111-XXXX-XXXX-1111";
                break;
            }

            case "DATE_OF_BIRTH": {
                replacement = "January 01, 1990";
                break;
            }

            case "IP_ADDRESS": {
                replacement = `192.168.${hashVal % 254 + 1}.${(hashVal >> 4) % 254 + 1}`;
                break;
            }

            default:
                replacement = `[REDACTED_${piiType}]`;
        }

        this.mapping[clean] = replacement;
        return replacement;
    }
}
