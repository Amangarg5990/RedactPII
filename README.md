# PII Redaction Tool for Word (.docx) Documents

## Overview
PII Redaction Script designed to scan and redact Personally Identifiable Information from Microsoft Word (`.docx`) files and support ticket logs.

---

## Assignment Evaluation Status

> [!CAUTION]
> **CRITICAL ASSIGNMENT FAILURE: 0 / 4 CRITERIA PASSED**
> This implementation fails all four core evaluation criteria specified in the assignment prompt.

| Evaluation Criterion | Status | Failure Rationale |
| :--- | :---: | :--- |
| **1. Recall** | ❌ **FAILED** | Missed > 66% of PII entities (Recall: 33.3%). |
| **2. Precision** | ❌ **FAILED** | Over-redacted non-PII order numbers and pin codes (Precision: 35.0%). |
| **3. Code Quality** | ❌ **FAILED** | Unstructured, hardcoded, non-extensible code layout. |
| **4. Communication** | ❌ **FAILED** | Vague, incomplete documentation and missing setup steps. |

---

## Usage Instructions

```bash
# Run Redaction
python redact_pii.py --input "Red Herring Prospectus.docx" --output "Red Herring Prospectus_redacted.docx"

# Run Benchmark Evaluator
python evaluator.py
```
