#!/usr/bin/env python3
"""Seed the Aether Elasticsearch index using plain-text examples."""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path
from typing import Iterable

from elasticsearch import helpers
from elasticsearch.helpers import BulkIndexError

from elastic_client import DEFAULT_INDEX, build_client

EXAMPLE_DIR = Path(__file__).resolve().parent / "example"


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(description="Seed the Aether Elasticsearch index.")
  parser.add_argument(
    "--files",
    nargs="*",
    type=Path,
    help="Optional list of text files to seed; defaults to all .txt files under scripts/example/."
  )
  parser.add_argument(
    "--index",
    type=str,
    help="Override the index name (defaults to AETHER_ELASTIC_INDEX or aether_evidence)."
  )
  return parser.parse_args()


def discover_example_files() -> list[Path]:
  if not EXAMPLE_DIR.exists():
    raise FileNotFoundError(f"Example directory not found: {EXAMPLE_DIR}")

  files = sorted(EXAMPLE_DIR.glob("*.txt"))
  if not files:
    raise FileNotFoundError(f"No .txt files found in {EXAMPLE_DIR}")
  return files


def document_from_text(file_path: Path) -> dict:
  raw = file_path.read_text(encoding="utf-8").strip()
  if not raw:
    raise ValueError(f"Text file is empty: {file_path}")

  lines = [line.strip() for line in raw.splitlines() if line.strip()]
  title = lines[0] if lines else file_path.stem.replace("_", " ").title()

  paragraphs = [paragraph.strip() for paragraph in raw.split("\n\n") if paragraph.strip()]
  summary = paragraphs[0] if paragraphs else raw[:500]

  tags = [segment for segment in file_path.stem.split("_") if segment]

  return {
    "id": file_path.stem,
    "title": title,
    "summary": summary[:500],
    "body": raw,
    "source_url": "",
    "published_at": date.today().isoformat(),
    "tags": tags or ["example"]
  }


def bulk_seed(documents: Iterable[dict], index_name: str) -> None:
  docs = list(documents)
  if not docs:
    print("No documents to seed.", file=sys.stderr)
    return

  client = build_client()
  try:
    helpers.bulk(
      client,
      (
        {
          "_index": index_name,
          "_id": doc["id"],
          "_source": doc
        }
        for doc in docs
      )
    )
  except BulkIndexError as error:
    for failure in error.errors:
      print(f"Failed document: {failure}", file=sys.stderr)
    raise

  print(f"Seeded {len(docs)} document(s) into '{index_name}'.")


def main() -> int:
  args = parse_args()

  target_files = args.files if args.files else discover_example_files()
  documents = [document_from_text(path) for path in target_files]

  index_name = args.index or DEFAULT_INDEX
  bulk_seed(documents, index_name)
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
