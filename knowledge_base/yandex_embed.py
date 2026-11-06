"""Yandex Text Embeddings API."""
import json
import logging
import time
from typing import Optional

import requests

from .config import YANDEX_API_KEY, YANDEX_DOC_MODEL, YANDEX_QRY_MODEL, SKIP_SSL_VERIFY

logger = logging.getLogger(__name__)
_URL       = "https://llm.api.cloud.yandex.net/foundationModels/v1/textEmbedding"
_MAX_CHARS = 8000


def embed_document(text: str) -> Optional[list[float]]:
    return _call(YANDEX_DOC_MODEL, text)


def embed_query(text: str) -> Optional[list[float]]:
    return _call(YANDEX_QRY_MODEL, text)


def _call(model_uri: str, text: str, retries: int = 3) -> Optional[list[float]]:
    headers = {
        "Authorization": f"Api-Key {YANDEX_API_KEY}",
        "Content-Type": "application/json; charset=utf-8",
    }
    payload = json.dumps({"modelUri": model_uri, "text": text[:_MAX_CHARS]}).encode()
    for attempt in range(retries):
        try:
            resp = requests.post(_URL, headers=headers, data=payload,
                                 timeout=15, verify=not SKIP_SSL_VERIFY)
            if resp.status_code == 200:
                return resp.json()["embedding"]
            if resp.status_code == 429:
                time.sleep(2 ** attempt)
            else:
                logger.warning("Yandex embed %s: %s", resp.status_code, resp.text[:200])
                return None
        except Exception as e:
            logger.warning("Yandex embed attempt %d: %s", attempt + 1, e)
            if attempt < retries - 1:
                time.sleep(1)
    return None
