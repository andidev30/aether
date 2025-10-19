import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv
from elasticsearch import Elasticsearch

REPO_ROOT = Path(__file__).resolve().parent.parent

# Attempt to load environment variables in priority order.
dotenv_paths = [
  find_dotenv(usecwd=True),
  REPO_ROOT / '.env',
  REPO_ROOT / '.env.local',
  REPO_ROOT / 'backend' / '.env',
  REPO_ROOT / 'frontend' / '.env'
]

for dotenv_path in dotenv_paths:
  if not dotenv_path:
    continue
  load_dotenv(dotenv_path, override=False)

DEFAULT_INDEX = os.getenv("ELASTIC_INDEX", "aether_evidence")


def build_client() -> Elasticsearch:
  """Create an Elasticsearch client using environment variables."""
  url = os.getenv("ELASTIC_URL")
  api_key = os.getenv("ELASTIC_API_KEY")

  if not url:
    url = "http://localhost:9200"
    print("Warning: ELASTIC_URL not set. Defaulting to http://localhost:9200", flush=True)

  if api_key:
    return Elasticsearch(url, api_key=api_key)

  if url.startswith("https://"):
    raise RuntimeError(
      "ELASTIC_API_KEY must be set when connecting to Elastic Cloud over HTTPS."
    )

  return Elasticsearch(url)
