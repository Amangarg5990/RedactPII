/**
 * In-Browser Benchmark Evaluator & Metrics Suite
 */

const BENCHMARK_TEST_CASES = [
    { text: "Please contact Rashi Patil at rashhi.patil@gmail.com for details.", expected: [{ type: "EMAIL", val: "rashhi.patil@gmail.com" }, { type: "FULL_NAME", val: "Rashi Patil" }] },
    { text: "Reach out to info@kshinternational.com or support.team@domain.co.in", expected: [{ type: "EMAIL", val: "info@kshinternational.com" }, { type: "EMAIL", val: "support.team@domain.co.in" }] },
    { text: "Contact number: +91 9876543210 or 020-27401234.", expected: [{ type: "PHONE_NUMBER", val: "+91 9876543210" }, { type: "PHONE_NUMBER", val: "020-27401234" }] },
    { text: "Call Rohan Dey at +91 9812345678", expected: [{ type: "FULL_NAME", val: "Rohan Dey" }, { type: "PHONE_NUMBER", val: "+91 9812345678" }] },
    { text: "Mr. Rajesh Sharma and Ms. Priya Verma are appointed as Directors.", expected: [{ type: "FULL_NAME", val: "Rajesh Sharma" }, { type: "FULL_NAME", val: "Priya Verma" }] },
    { text: "Shri Amit Kumar serves as Chief Financial Officer.", expected: [{ type: "FULL_NAME", val: "Amit Kumar" }] },
    { text: "CORPORATE IDENTITY NUMBER: U28129PN1979PLC141032", expected: [{ type: "GOVT_ID", val: "U28129PN1979PLC141032" }] },
    { text: "Permanent Account Number (PAN): ABCDE1234F", expected: [{ type: "GOVT_ID", val: "ABCDE1234F" }] },
    { text: "Director Identification Number (DIN): 01234567", expected: [{ type: "GOVT_ID", val: "01234567" }] },
    { text: "US Taxpayer SSN is 219-09-8811", expected: [{ type: "GOVT_ID", val: "219-09-8811" }] },
    { text: "Payment processed using card 4532015589123456.", expected: [{ type: "CREDIT_CARD", val: "4532015589123456" }] },
    { text: "Date of Birth: 15/08/1985 for candidate.", expected: [{ type: "DATE_OF_BIRTH", val: "15/08/1985" }] },
    { text: "Born on March 22, 1990 in Mumbai.", expected: [{ type: "DATE_OF_BIRTH", val: "March 22, 1990" }] },
    { text: "Server log entry from IP 192.168.1.105 accessing database.", expected: [{ type: "IP_ADDRESS", val: "192.168.1.105" }] },
    { text: "Registered office at 11/3, Village Birdewadi Chakan Taluka, Khed Pune - 410501, Maharashtra, India", expected: [{ type: "ADDRESS", val: "11/3, Village Birdewadi Chakan Taluka, Khed Pune - 410501, Maharashtra, India" }] },
    { text: "KSH INTERNATIONAL LIMITED is issuing shares.", expected: [{ type: "COMPANY_NAME", val: "KSH INTERNATIONAL LIMITED" }] },
    
    // Negative examples (testing Precision)
    { text: "Order #98765 was processed under Section 32 of Companies Act, 2013.", expected: [] },
    { text: "100% Book Built Offer with minimum bid size of 1000 shares.", expected: [] },
    { text: "Ticket ID TK-991823 status updated to RESOLVED.", expected: [] }
];

class BenchmarkEvaluator {
    static runEvaluation(detector) {
        let tp = 0, fp = 0, fn = 0, tn = 0;
        const categoryStats = {};

        Object.keys(PII_CATEGORIES).forEach(cat => {
            categoryStats[cat] = { tp: 0, fp: 0, fn: 0 };
        });

        BENCHMARK_TEST_CASES.forEach(testCase => {
            const matches = detector.detect(testCase.text);
            const detectedTuples = matches.map(m => ({ type: m.type, val: m.text.trim() }));
            const expected = testCase.expected;

            if (!expected.length && !detectedTuples.length) {
                tn++;
                return;
            }

            const expectedMatched = new Array(expected.length).fill(false);
            const detectedMatched = new Array(detectedTuples.length).fill(false);

            expected.forEach((exp, i) => {
                const cat = exp.type;
                let found = false;
                detectedTuples.forEach((det, j) => {
                    if (det.type === exp.type && (exp.val.toLowerCase().includes(det.val.toLowerCase()) || det.val.toLowerCase().includes(exp.val.toLowerCase()))) {
                        found = true;
                        expectedMatched[i] = true;
                        detectedMatched[j] = true;
                    }
                });

                if (found) {
                    tp++;
                    if (categoryStats[cat]) categoryStats[cat].tp++;
                } else {
                    fn++;
                    if (categoryStats[cat]) categoryStats[cat].fn++;
                }
            });

            detectedTuples.forEach((det, j) => {
                if (!detectedMatched[j]) {
                    fp++;
                    if (categoryStats[det.type]) categoryStats[det.type].fp++;
                }
            });
        });

        const precision = (tp + fp) > 0 ? (tp / (tp + fp)) : 1.0;
        const recall = (tp + fn) > 0 ? (tp / (tp + fn)) : 1.0;
        const f1 = (precision + recall) > 0 ? (2 * precision * recall / (precision + recall)) : 0.0;
        const accuracy = (tp + tn + fp + fn) > 0 ? ((tp + tn) / (tp + tn + fp + fn)) : 1.0;

        return {
            tp, fp, fn, tn,
            accuracy: accuracy * 100,
            precision: precision * 100,
            recall: recall * 100,
            f1Score: f1 * 100,
            categoryStats
        };
    }
}
