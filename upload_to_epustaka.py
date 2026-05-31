#!/usr/bin/env python3
"""
Bulk-upload jurnal hasil scraping ke E-Pustaka Pemilu (backend Supabase).

Menjadikan SEMUA jurnal "gratis diakses": tiap PDF diunggah ke Storage bucket
`ebooks`, lalu satu baris dibuat di tabel `books` dengan price=0 & premium=false.

Berpasangan dengan scrape_kpu_journal.py (membaca metadata.json + folder PDF-nya).
Hanya butuh `requests` (memakai REST API Supabase langsung — tanpa supabase-py).

Konfigurasi (lewat argumen, variabel lingkungan, atau file .env di repo):
  SUPABASE_URL / VITE_SUPABASE_URL          : https://xxxx.supabase.co
  SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY: anon public key
  EPUSTAKA_ADMIN_EMAIL                       : email admin (user Supabase Auth)
  EPUSTAKA_ADMIN_PASSWORD                    : password admin

Pemakaian (di komputer yang punya internet):
  pip install requests
  python upload_to_epustaka.py --dir ./jurnal_kpu \
      --url https://xxxx.supabase.co --anon-key eyJ... \
      --email admin@contoh.id            # password ditanyakan aman saat runtime
  python upload_to_epustaka.py --dir ./jurnal_kpu --env ./.env --dry-run
"""

import argparse
import getpass
import json
import os
import re
import sys

try:
    import requests
except ImportError:
    sys.exit("Modul belum terpasang. Jalankan:  pip install requests")

BUCKET = "ebooks"
COVER_PALETTES = [
    ("#1e3a8a", "#3b82f6"), ("#047857", "#10b981"), ("#7c2d12", "#ea580c"),
    ("#581c87", "#a855f7"), ("#9d174d", "#ec4899"), ("#0e7490", "#06b6d4"),
    ("#c2410c", "#fbbf24"), ("#155e75", "#22d3ee"),
]


def slugify(text, maxlen=120):
    """Sama persis dengan scraper agar nama file PDF cocok."""
    text = re.sub(r"\s+", " ", (text or "").strip())
    text = re.sub(r'[<>:"/\\|?*\n\r\t]+', "", text)
    text = text.replace(" ", "_")
    return text[:maxlen].strip("_") or "tanpa_judul"


def cover_for(title):
    h = 0
    for ch in title:
        h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return list(COVER_PALETTES[h % len(COVER_PALETTES)])


def year_from(date_str):
    m = re.search(r"(19|20)\d{2}", date_str or "")
    return int(m.group(0)) if m else None


def load_env_file(path):
    """Baca file .env sederhana -> dict (untuk VITE_SUPABASE_*)."""
    env = {}
    if not path or not os.path.exists(path):
        return env
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


class EpustakaUploader:
    def __init__(self, url, anon_key, storage_prefix="jurnal"):
        self.url = url.rstrip("/")
        self.anon = anon_key
        self.token = None
        self.prefix = storage_prefix.strip("/")
        self.s = requests.Session()

    def login(self, email, password):
        r = self.s.post(
            f"{self.url}/auth/v1/token?grant_type=password",
            headers={"apikey": self.anon, "Content-Type": "application/json"},
            json={"email": email, "password": password},
            timeout=30,
        )
        if r.status_code != 200:
            raise SystemExit(f"Login gagal ({r.status_code}): {r.text}")
        self.token = r.json()["access_token"]
        print(f"  Login admin berhasil: {email}")

    def _auth_headers(self):
        return {"apikey": self.anon, "Authorization": f"Bearer {self.token}"}

    def existing_titles(self):
        """Ambil judul yang sudah ada agar tidak dobel saat dijalankan ulang."""
        r = self.s.get(
            f"{self.url}/rest/v1/books",
            headers={**self._auth_headers(), "Accept": "application/json"},
            params={"select": "title"},
            timeout=60,
        )
        if r.status_code != 200:
            print(f"  ! tidak bisa baca koleksi ({r.status_code}); lanjut tanpa cek dobel.")
            return set()
        return {row["title"] for row in r.json()}

    def upload_pdf(self, local_path, title):
        path = f"{self.prefix}/{slugify(title, 100)}.pdf"
        with open(local_path, "rb") as f:
            data = f.read()
        r = self.s.post(
            f"{self.url}/storage/v1/object/{BUCKET}/{path}",
            headers={
                **self._auth_headers(),
                "Content-Type": "application/pdf",
                "x-upsert": "true",  # aman bila diulang
            },
            data=data,
            timeout=180,
        )
        if r.status_code not in (200, 201):
            raise RuntimeError(f"upload storage gagal ({r.status_code}): {r.text}")
        return f"{self.url}/storage/v1/object/public/{BUCKET}/{path}"

    def insert_book(self, book):
        r = self.s.post(
            f"{self.url}/rest/v1/books",
            headers={
                **self._auth_headers(),
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
            json=book,
            timeout=60,
        )
        if r.status_code not in (200, 201, 204):
            raise RuntimeError(f"insert books gagal ({r.status_code}): {r.text}")


def build_book(rec, pdf_url, ctype, category, themes, publisher):
    authors = rec.get("authors") or []
    author = ", ".join(authors) if authors else "Tidak diketahui"
    parts = []
    if authors:
        parts.append("Penulis: " + author + ".")
    if rec.get("issue"):
        parts.append("Terbitan: " + rec["issue"] + ".")
    if rec.get("doi"):
        parts.append("DOI: " + rec["doi"] + ".")
    if rec.get("article_url"):
        parts.append("Sumber: " + rec["article_url"])
    return {
        "title": rec["title"],
        "author": author,
        "publisher": publisher,
        "type": ctype,
        "category": category,
        "themes": themes,
        "year": year_from(rec.get("date")),
        "price": 0,           # GRATIS
        "premium": False,     # bukan premium
        "rating": 0,
        "pages": 0,
        "cover": cover_for(rec["title"]),
        "synopsis": " ".join(parts),
        "pdf_url": pdf_url,
    }


def find_pdf(base_dir, rec):
    """Cari file PDF lokal untuk satu record (folder per-terbitan)."""
    fname = slugify(rec["title"]) + ".pdf"
    # 1) sesuai struktur scraper: <base>/<slug_issue>/<slug_title>.pdf
    if rec.get("issue"):
        cand = os.path.join(base_dir, slugify(rec["issue"], 80), fname)
        if os.path.exists(cand):
            return cand
    # 2) fallback: cari di mana saja di bawah base_dir
    for root, _, files in os.walk(base_dir):
        if fname in files:
            return os.path.join(root, fname)
    return None


def main():
    ap = argparse.ArgumentParser(description="Bulk-upload jurnal ke E-Pustaka (gratis)")
    ap.add_argument("--dir", default="./jurnal_kpu", help="folder hasil scraping")
    ap.add_argument("--env", help="path file .env berisi VITE_SUPABASE_*")
    ap.add_argument("--url", help="Supabase URL (atau dari env)")
    ap.add_argument("--anon-key", help="Supabase anon key (atau dari env)")
    ap.add_argument("--email", help="email admin (atau env EPUSTAKA_ADMIN_EMAIL)")
    ap.add_argument("--password", help="password admin (atau env / ditanya saat runtime)")
    ap.add_argument("--type", default="buku", choices=["buku", "majalah", "koran"],
                    help="jenis koleksi (default buku)")
    ap.add_argument("--category", default="Jurnal Pemilu", help="kategori koleksi")
    ap.add_argument("--themes", default="pemilu",
                    help="ID tema dipisah koma (lihat src/data/themes.ts), mis. pemilu,hukum-konstitusi")
    ap.add_argument("--publisher", default="Jurnal KPU (TKP)", help="nama penerbit")
    ap.add_argument("--dry-run", action="store_true", help="tampilkan rencana tanpa upload")
    args = ap.parse_args()

    env = load_env_file(args.env)
    url = args.url or env.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    anon = args.anon_key or env.get("VITE_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")
    email = args.email or os.environ.get("EPUSTAKA_ADMIN_EMAIL")
    password = args.password or os.environ.get("EPUSTAKA_ADMIN_PASSWORD")

    meta_path = os.path.join(args.dir, "metadata.json")
    if not os.path.exists(meta_path):
        sys.exit(f"Tidak menemukan {meta_path}. Jalankan scrape_kpu_journal.py dulu.")
    with open(meta_path, encoding="utf-8") as f:
        records = json.load(f)
    themes = [t.strip() for t in args.themes.split(",") if t.strip()]

    print(f"Ditemukan {len(records)} artikel di {meta_path}.")

    if args.dry_run:
        ok = sum(1 for r in records if find_pdf(args.dir, r))
        print(f"[dry-run] {ok}/{len(records)} artikel punya PDF lokal yang siap diunggah.")
        print(f"[dry-run] semua akan dibuat GRATIS (price=0, premium=false), "
              f"type={args.type}, kategori={args.category}, tema={themes}.")
        for r in records[:5]:
            print(f"   - {r['title'][:70]}  -> {find_pdf(args.dir, r) or 'PDF TIDAK ADA'}")
        return

    if not url or not anon:
        sys.exit("URL/anon key Supabase belum ada. Pakai --url & --anon-key atau --env .env")
    if not email:
        email = input("Email admin Supabase: ").strip()
    if not password:
        password = getpass.getpass("Password admin Supabase: ")

    up = EpustakaUploader(url, anon)
    up.login(email, password)
    existing = up.existing_titles()
    print(f"  {len(existing)} judul sudah ada di koleksi (akan dilewati bila sama).")

    done = skipped = failed = 0
    for i, rec in enumerate(records, 1):
        title = rec.get("title") or "(tanpa judul)"
        if title in existing:
            skipped += 1
            print(f"[{i}/{len(records)}] = sudah ada: {title[:60]}")
            continue
        pdf = find_pdf(args.dir, rec)
        if not pdf:
            failed += 1
            print(f"[{i}/{len(records)}] ! PDF lokal tidak ditemukan: {title[:60]}")
            continue
        try:
            pdf_url = up.upload_pdf(pdf, title)
            book = build_book(rec, pdf_url, args.type, args.category, themes, args.publisher)
            up.insert_book(book)
            existing.add(title)
            done += 1
            print(f"[{i}/{len(records)}] + GRATIS diunggah: {title[:60]}")
        except Exception as e:
            failed += 1
            print(f"[{i}/{len(records)}] ! gagal: {title[:50]} -> {e}")

    print(f"\nSelesai. Diunggah: {done}, dilewati: {skipped}, gagal: {failed}.")
    print("Semua koleksi baru tampil GRATIS untuk semua pengunjung E-Pustaka.")


if __name__ == "__main__":
    main()
