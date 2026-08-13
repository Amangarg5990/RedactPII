"""
Main PII Redaction CLI Tool.
Executes PII detection and synthetic replacement on a target DOCX file.
Usage:
    python redact_pii.py --input "Red Herring Prospectus.docx" --output "Red Herring Prospectus_redacted.docx"
"""

import sys
import os
import argparse
import time
from src.pii_detector import PIIDetector
from src.faker_mapper import SyntheticPIIMapper
from src.docx_redactor import DOCXRedactor


def main():
    parser = argparse.ArgumentParser(description="PII Redaction Tool for Word (.docx) Documents")
    parser.add_argument("--input", "-i", default="Red Herring Prospectus.docx", help="Path to input .docx document")
    parser.add_argument("--output", "-o", default="Red Herring Prospectus_redacted.docx", help="Path to save redacted .docx document")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for consistent synthetic PII mapping")
    args = parser.parse_args()

    input_path = os.path.abspath(args.input)
    output_path = os.path.abspath(args.output)

    print("=" * 60)
    print("           PII REDACTION TOOL - EXECUTION RUN           ")
    print("=" * 60)
    print(f"Input Document : {input_path}")
    print(f"Output Document: {output_path}")

    start_time = time.time()

    print("\n[1/3] Initializing Hybrid PII Detector & Synthetic Mapper...")
    detector = PIIDetector()
    mapper = SyntheticPIIMapper(seed=args.seed)

    print("[2/3] Processing DOCX structure (paragraphs, tables, headers, footers)...")
    redactor = DOCXRedactor(detector=detector, mapper=mapper)
    stats = redactor.redact_document(input_path, output_path)

    elapsed = time.time() - start_time

    print("\n[3/3] Redaction Completed Successfully!")
    print("-" * 60)
    print(f"Time Taken         : {elapsed:.2f} seconds")
    print(f"Paragraphs Processed: {stats['paragraphs_processed']}")
    print(f"Table Cells Processed: {stats['table_cells_processed']}")
    print(f"Total PII Redactions : {stats['total_redactions']}")
    print("\nRedactions Breakdown by PII Category:")
    for pii_cat, count in sorted(stats['redactions_by_type'].items()):
        print(f"  - {pii_cat:<20}: {count}")

    print("\nSample Fake Entity Mappings:")
    sample_mappings = list(mapper.mapping.items())[:8]
    for orig, fake_val in sample_mappings:
        print(f"  • '{orig}' => '{fake_val}'")
    print("=" * 60)


if __name__ == "__main__":
    main()
