import os, re, hashlib, argparse
from datetime import datetime, timezone
from dataclasses import dataclass
from typing import Dict, Optional, List

import firebase_admin
from firebase_admin import credentials, firestore

# ---------------------- Конфиг ----------------------
@dataclass(frozen=True)
class Cfg:
    # DB1 (READ)
    db1_sa: str
    db1_project: str
    db1_groups_root: str  # "~root" для схемы /{gid}/{date}/chunks
    db1_documents_col: str
    db1_chunks_col: str

    # BD2 (WRITE)
    db2_sa: str
    db2_project: str
    db2_root: str
    db2_meta_root: str

    batch_size: int

def cfg_from_env() -> Cfg:
    return Cfg(
        db1_sa=os.environ["DB1_SA"],
        db1_project=os.getenv("DB1_PROJECT_ID", ""),
        db1_groups_root=os.getenv("DB1_GROUPS_ROOT", "~root"),
        db1_documents_col=os.getenv("DB1_DOCUMENTS_COL", "documents"),
        db1_chunks_col=os.getenv("DB1_CHUNKS_COL", "chunks"),
        db2_sa=os.environ["DB2_SA"],
        db2_project=os.getenv("DB2_PROJECT_ID", ""),
        db2_root=os.getenv("DB2_ROOT", "parsed_messages"),
        db2_meta_root=os.getenv("DB2_META_ROOT", "meta"),
        batch_size=int(os.getenv("BATCH_SIZE", "1000")),
    )

# ---------------------- Firestore клиенты ----------------------
def clients(cfg: Cfg):
    app1 = firebase_admin.initialize_app(
        credentials.Certificate(cfg.db1_sa),
        options={"projectId": cfg.db1_project} if cfg.db1_project else None,
        name="db1"
    )
    db1 = firestore.client(app=app1)

    app2 = firebase_admin.initialize_app(
        credentials.Certificate(cfg.db2_sa),
        options={"projectId": cfg.db2_project} if cfg.db2_project else None,
        name="db2"
    )
    db2 = firestore.client(app=app2)
    return db1, db2

# ---------------------- Утилиты ----------------------
URL_RE   = re.compile(r"(https?://\S+)", re.I)
TAG_RE   = re.compile(r"(#\w+)")
MENT_RE  = re.compile(r"(@\w+)")
TOKEN_RE = re.compile(r"[A-Za-zА-Яа-яЁёӘәҚқҢңҒғҮүҰұӨөҺһІіЇїЄє\-']+|\d+")

def normalize(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").replace("\u200b", "")).strip()

def parse_ts(date_id: str, time_str: str) -> Optional[datetime]:
    try:
        dt = datetime.strptime(f"{date_id} {time_str}", "%Y-%m-%d %H:%M:%S")
        return dt.replace(tzinfo=timezone.utc)
    except Exception:
        return None

def stable_id(group_id: str, date_id: str, chunk_id: str, seq: int) -> str:
    return hashlib.sha1(f"{group_id}:{date_id}:{chunk_id}:{seq}".encode()).hexdigest()[:24]

# ---------------------- Обнаружение групп/дат ----------------------
def discover_group_ids(db1, cfg: Cfg) -> List[str]:
    if cfg.db1_groups_root == "~root":
        # верхнеуровневые коллекции-числа: -100...
        return sorted([c.id for c in db1.collections() if re.fullmatch(r"-?\d+", c.id)])
    else:
        return sorted([d.id for d in db1.collection(cfg.db1_groups_root).stream()])

def list_dates_even_if_empty(db1, cfg: Cfg, gid: str) -> List[str]:
    """
    Возвращает список id дат даже если сам doc пустой (только подколлекции).
    Для root-схемы используем list_documents(); для groups/* — обычный stream.
    """
    if cfg.db1_groups_root == "~root":
        docs = list(db1.collection(gid).list_documents())
        return sorted([d.id for d in docs if re.fullmatch(r"\d{4}-\d{2}-\d{2}", d.id)])
    else:
        snaps = list(db1.collection(cfg.db1_groups_root).document(gid)
                        .collection(cfg.db1_documents_col).stream())
        return sorted([s.id for s in snaps if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s.id)])

# ---------------------- Чекпоинты BD2 ----------------------
def read_cp(db2, cfg: Cfg, gid: str) -> Dict:
    ref = (db2.collection(cfg.db2_root).document(gid)
           .collection(cfg.db2_meta_root).document("checkpoints_chunked"))
    snap = ref.get()
    if not snap.exists:
        return {"last_date_id": None, "last_chunk_id": None, "last_msg_seq": None, "last_ts": None}
    d = snap.to_dict() or {}
    ts = d.get("last_ts")
    if hasattr(ts, "to_datetime"):
        d["last_ts"] = ts.to_datetime()
    return d

def write_cp(db2, cfg: Cfg, gid: str, cp: Dict):
    (db2.collection(cfg.db2_root).document(gid)
        .collection(cfg.db2_meta_root).document("checkpoints_chunked")
        .set({
            "last_date_id": cp.get("last_date_id"),
            "last_chunk_id": cp.get("last_chunk_id"),
            "last_msg_seq": cp.get("last_msg_seq"),
            "last_ts": cp.get("last_ts"),
            "updated_at": firestore.SERVER_TIMESTAMP
        }, merge=True))

# ---------------------- Запись в BD2 ----------------------
def parsed_exists(db2, cfg: Cfg, gid: str, mid: str, chash: str) -> bool:
    doc = db2.collection(cfg.db2_root).document(gid).collection("messages").document(mid).get()
    if not doc.exists:
        return False
    d = doc.to_dict() or {}
    return d.get("content_hash") == chash

def write_parsed(db2, cfg: Cfg, gid: str, payload: dict):
    db2.collection(cfg.db2_root).document(gid).collection("messages").document(payload["id"]).set(payload, merge=True)

# ---------------------- Основной проход ----------------------
def process_group(db1, db2, cfg: Cfg, gid: str, limit: int) -> int:
    cp = read_cp(db2, cfg, gid)
    processed = 0

    date_ids = list_dates_even_if_empty(db1, cfg, gid)

    for date_id in date_ids:
        if cp["last_date_id"] and date_id < cp["last_date_id"]:
            continue

        # ссылка на коллекцию чанков
        if cfg.db1_groups_root == "~root":
            chunks_ref = db1.collection(gid).document(date_id).collection(cfg.db1_chunks_col)
        else:
            chunks_ref = (db1.collection(cfg.db1_groups_root).document(gid)
                             .collection(cfg.db1_documents_col).document(date_id)
                             .collection(cfg.db1_chunks_col))

        try:
            chunks = list(chunks_ref.order_by("created_at").stream())
        except Exception:
            chunks = list(chunks_ref.stream())
            chunks.sort(key=lambda c: c.id)

        for ch in chunks:
            chunk_id = ch.id
            if cp["last_date_id"] == date_id and cp["last_chunk_id"] and chunk_id < cp["last_chunk_id"]:
                continue

            data = ch.to_dict() or {}
            msgs = data.get("messages", []) or []

            for seq, m in enumerate(msgs):
                if cp["last_date_id"] == date_id and cp["last_chunk_id"] == chunk_id:
                    if cp["last_msg_seq"] is not None and seq <= cp["last_msg_seq"]:
                        continue

                ts = parse_ts(date_id, str(m.get("time", "")))
                if not ts:
                    continue

                text = m.get("text") or ""
                txtn = normalize(text)
                urls = URL_RE.findall(txtn)
                tags = [t.lower() for t in TAG_RE.findall(txtn)]
                ments = [u.lower() for u in MENT_RE.findall(txtn)]
                toks = [t.lower() for t in TOKEN_RE.findall(txtn)]
                chash = hashlib.sha256(txtn.encode()).hexdigest()
                mid = stable_id(gid, date_id, chunk_id, seq)

                payload = {
                    "id": mid,
                    "chat_id": gid,
                    "ts": ts,
                    "text": text,
                    "text_norm": txtn,
                    "hashtags": tags,
                    "mentions": ments,
                    "urls": urls,
                    "tokens": toks,
                    "emojis": [],
                    "lang_guess": "",
                    "content_hash": chash,
                    "date_id": date_id,
                    "chunk_id": chunk_id,
                    "seq": seq,
                }

                if not parsed_exists(db2, cfg, gid, mid, chash):
                    write_parsed(db2, cfg, gid, payload)
                    processed += 1
                    cp.update({"last_date_id": date_id, "last_chunk_id": chunk_id, "last_msg_seq": seq, "last_ts": ts})

                if processed >= limit:
                    write_cp(db2, cfg, gid, cp)
                    return processed

    write_cp(db2, cfg, gid, cp)
    return processed

# ---------------------- CLI ----------------------
def main():
    parser = argparse.ArgumentParser(description="Specula microservice-2 (MVP v2)")
    parser.add_argument("--groups", default="all", help="CSV чат-идов или 'all'")
    args = parser.parse_args()

    cfg = cfg_from_env()
    db1, db2 = clients(cfg)

    group_ids = discover_group_ids(db1, cfg)
    if args.groups != "all":
        wanted = {x.strip() for x in args.groups.split(",") if x.strip()}
        group_ids = [g for g in group_ids if g in wanted]

    total = 0
    for gid in group_ids:
        n = process_group(db1, db2, cfg, gid, limit=cfg.batch_size)
        print(f"[{gid}] processed={n}")
        total += n
    print("TOTAL:", total)

if __name__ == "__main__":
    main()
