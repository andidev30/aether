#!/usr/bin/env python3
"""Delete the Aether evidence index in Elasticsearch."""

from __future__ import annotations

import argparse
import sys

from elasticsearch import NotFoundError

from elastic_client import DEFAULT_INDEX, build_client


def delete_index(force: bool) -> None:
  if not force:
    print("Refusing to delete index without --force flag.", file=sys.stderr)
    return

  client = build_client()
  try:
    client.indices.delete(index=DEFAULT_INDEX)
    print(f"Deleted index '{DEFAULT_INDEX}'.")
  except NotFoundError:
    print(f"Index '{DEFAULT_INDEX}' does not exist.", file=sys.stderr)


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(description="Delete the Aether Elasticsearch index.")
  parser.add_argument(
    "--force",
    action="store_true",
    help="Required to confirm deletion."
  )
  return parser.parse_args()


def main() -> int:
  args = parse_args()
  delete_index(force=args.force)
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
