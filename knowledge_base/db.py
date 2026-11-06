"""SQLite-хранилище: посты + их эмбеддинги (FTS5 + косинусный поиск)."""
import json
import math
import sqlite3
from typing import Optional

from .config import DB_PATH, TOP_K, MIN_SCORE

SCHEMA = """
CREATE TABLE IF NOT EXISTS posts (
    id        INTEGER PRIMARY KEY,
    channel   TEXT    NOT NULL,
    date      TEXT    NOT NULL,
    text      TEXT    NOT NULL,
    url       TEXT,
    embedding TEXT
);
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts
    USING fts5(text, content='posts', content_rowid='id');
CREATE TRIGGER IF NOT EXISTS posts_ai AFTER INSERT ON posts BEGIN
    INSERT INTO posts_fts(rowid, text) VALUES (new.id, new.text);
END;
CREATE TRIGGER IF NOT EXISTS posts_ad AFTER DELETE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rowid, text) VALUES ('delete', old.id, old.text);
END;
"""


def _con() -> sqlite3.Connection:
    con = sqlite3.connect(str(DB_PATH))
    con.row_factory = sqlite3.Row
    con.executescript(SCHEMA)
    con.commit()
    return con


def upsert_post(post_id: int, channel: str, date: str, text: str,
                url: Optional[str], embedding: Optional[list[float]]) -> bool:
    with _con() as con:
        if con.execute("SELECT 1 FROM posts WHERE id=?", (post_id,)).fetchone():
            if embedding:
                con.execute("UPDATE posts SET embedding=? WHERE id=? AND embedding IS NULL",
                            (json.dumps(embedding), post_id))
            return False
        con.execute(
            "INSERT INTO posts(id, channel, date, text, url, embedding) VALUES (?,?,?,?,?,?)",
            (post_id, channel, date, text, url, json.dumps(embedding) if embedding else None),
        )
        return True


def update_embedding(post_id: int, embedding: list[float]) -> None:
    with _con() as con:
        con.execute("UPDATE posts SET embedding=? WHERE id=?",
                    (json.dumps(embedding), post_id))


def count_posts() -> int:
    with _con() as con:
        return con.execute("SELECT COUNT(*) FROM posts").fetchone()[0]


def max_post_id(channel: str) -> int:
    with _con() as con:
        row = con.execute("SELECT MAX(id) FROM posts WHERE channel=?", (channel,)).fetchone()
        return row[0] or 0


def posts_without_embeddings(limit: int = 50) -> list[dict]:
    with _con() as con:
        rows = con.execute("SELECT id, text FROM posts WHERE embedding IS NULL LIMIT ?",
                           (limit,)).fetchall()
        return [dict(r) for r in rows]


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na  = math.sqrt(sum(x * x for x in a))
    nb  = math.sqrt(sum(x * x for x in b))
    return dot / (na * nb) if na and nb else 0.0


def search_by_embedding(query_emb: list[float], top_k: int = TOP_K) -> list[dict]:
    with _con() as con:
        rows = con.execute(
            "SELECT id, channel, date, text, url, embedding FROM posts WHERE embedding IS NOT NULL"
        ).fetchall()
    results = []
    for row in rows:
        score = _cosine(query_emb, json.loads(row["embedding"]))
        if score >= MIN_SCORE:
            results.append({**dict(row), "score": score, "date": row["date"][:10]})
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


def search_by_keyword(query: str, top_k: int = TOP_K) -> list[dict]:
    with _con() as con:
        rows = con.execute(
            """SELECT p.id, p.channel, p.date, p.text, p.url
               FROM posts_fts f JOIN posts p ON p.id = f.rowid
               WHERE posts_fts MATCH ? ORDER BY rank LIMIT ?""",
            (query, top_k),
        ).fetchall()
    return [dict(r) for r in rows]
