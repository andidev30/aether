#!/usr/bin/env python3
"""Create the Aether evidence index in Elasticsearch using environment variables."""

from __future__ import annotations

import sys

from elasticsearch import Elasticsearch
from elasticsearch.exceptions import RequestError

from elastic_client import DEFAULT_INDEX, build_client


def create_index(client: Elasticsearch) -> None:
  mappings = {
    "dynamic": "strict",
    "properties": {
      "id": {"type": "keyword"},
      "title": {"type": "text", "fields": {"raw": {"type": "keyword"}}},
      "summary": {"type": "text"},
      "body": {"type": "text"},
      "source_url": {"type": "keyword"},
      "published_at": {"type": "date"},
      "tags": {"type": "keyword"}
    }
  }

  try:
    if client.indices.exists(index=DEFAULT_INDEX):
      print(f"Index '{DEFAULT_INDEX}' already exists. Skipping creation.", file=sys.stderr)
      return

    client.indices.create(index=DEFAULT_INDEX, mappings=mappings)
    print(f"Created index '{DEFAULT_INDEX}'.")
  except RequestError as error:
    print(f"Failed to create index '{DEFAULT_INDEX}': {error}", file=sys.stderr)
    raise


def main() -> int:
  client = build_client()
  create_index(client)
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
