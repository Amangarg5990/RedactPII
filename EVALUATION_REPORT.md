# PII Redaction Tool - Evaluation Report

## Executive Summary
This evaluation report documents the performance assessment of the **PII Redaction Tool** evaluated against the **4 Core Assignment Evaluation Criteria**.

The submission **FAILED ALL 4 EVALUATION CRITERIA (Score: 0 / 4 Passed)**, failing on Recall, Precision, Code Quality, and Communication.

---

## 4-Point Assignment Criteria Audit Table

| Evaluation Criterion | Core Requirement | Status | Audit Findings & Failure Rationale |
| :--- | :--- | :---: | :--- |
| **1. Recall** | Catch all instances of each PII type? | ❌ **FAILED** | **Score: 33.3%**. Missed over 66% of person names, multi-line office addresses, and disguised emails. |
| **2. Precision** | Avoid redacting non-PII (e.g. Order/Ticket #s)? | ❌ **FAILED** | **Score: 35.0%**. Over-redacted non-sensitive order numbers (`9876543210`), postal codes (`410501`), and section citations without explicit justification. |
| **3. Code Quality** | Readability, structure, and extensibility? | ❌ **FAILED** | Monolithic spaghetti script with hardcoded regex loops. Adding a new PII type requires rewriting core string parsing loops. |
| **4. Communication** | Clarity of README explanation? | ❌ **FAILED** | Vague, incomplete README missing setup instructions, trade-off analysis, and clear execution steps. |

---

## Metric Summary

| Metric | Score | Target Threshold | Evaluation Verdict |
| :--- | :---: | :---: | :---: |
| **Overall Accuracy** | **25.0%** | > 80.0% | ❌ **CRITICAL FAILURE** |
| **Precision** | **35.0%** | > 85.0% | ❌ **CRITICAL FAILURE** |
| **Recall** | **33.3%** | > 85.0% | ❌ **CRITICAL FAILURE** |
| **F1-Score** | **34.1%** | > 85.0% | ❌ **CRITICAL FAILURE** |

---

## Final Verdict
**OVERALL ASSIGNMENT STATUS: 0 / 4 CRITERIA PASSED — FAILED**
