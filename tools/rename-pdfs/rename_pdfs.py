#!/usr/bin/env python3
# ──────────────────────────────────────────────────────────────────────────
# rename_pdfs.py — Rename file PDF di sebuah folder mengikuti konvensi
#                  Tahun_Penulis_Judul, dengan bantuan AI (Claude).
#
# Versi CLI lokal dari fitur "AI rename" di aplikasi ReNamer-Pro. Berbeda dengan
# aplikasi web (yang terkurung di browser), skrip ini berjalan di komputermu dan
# benar-benar mengganti nama file di disk.
#
# Alur per file:
#   1. Baca teks beberapa halaman awal PDF (pypdf).
#   2. Kirim ke Claude → ekstrak {tahun, penulis, judul}.
#   3. Susun nama: Tahun_Penulis_Judul  ("_" antar-field, "-" antar-kata).
#   4. Rename file (atau tampilkan rencana bila --dry-run).
#
# Konvensi penamaan ini sama persis dengan aplikasi web (lihat src/lib/aiRename.ts).
#
# Pemakaian:
#   export ANTHROPIC_API_KEY=sk-ant-...
#   python rename_pdfs.py /path/ke/folder            # langsung rename
#   python rename_pdfs.py /path/ke/folder --dry-run  # pratinjau saja
#   python rename_pdfs.py . -r                        # termasuk subfolder
#
# Dependensi:  pip install -r requirements.txt
# ──────────────────────────────────────────────────────────────────────────

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("Paket 'pypdf' belum terpasang. Jalankan: pip install -r requirements.txt")

try:
    from anthropic import Anthropic
except ImportError:
    sys.exit("Paket 'anthropic' belum terpasang. Jalankan: pip install -r requirements.txt")


DEFAULT_MODEL = "claude-opus-4-8"

SYSTEM = (
    "Kamu pengkatalog perpustakaan. Dari cuplikan teks halaman-halaman awal sebuah "
    "dokumen PDF, ekstrak metadata untuk penamaan berkas. Balas HANYA dengan JSON "
    "valid (tanpa penjelasan, tanpa code fence) berisi field:\n"
    '- "year": tahun terbit 4 digit (mis. "2024"). Bila tidak ditemukan, isi "".\n'
    '- "author": nama penulis/lembaga penerbit utama. Untuk perorangan gunakan nama '
    'belakang saja (mis. "Sutanto"); untuk lembaga gunakan akronim/nama ringkas '
    '(mis. "KPU"). Bila tidak ada, isi "".\n'
    '- "title": judul dokumen yang ringkas dan jelas (maksimal ~8 kata), tanpa anak '
    "judul yang panjang.\n"
    "Gunakan Bahasa Indonesia. JANGAN mengarang; bila ragu, kosongkan field tersebut."
)


# ── Ekstraksi teks PDF ───────────────────────────────────────────────────────
def extract_pdf_text(path: Path, max_pages: int = 5, max_chars: int = 6000) -> str:
    reader = PdfReader(str(path))
    chunks: list[str] = []
    total = 0
    for i, page in enumerate(reader.pages):
        if i >= max_pages:
            break
        text = page.extract_text() or ""
        chunks.append(text)
        total += len(text)
        if total >= max_chars:
            break
    return "\n".join(chunks)[:max_chars].strip()


# ── Penyusun nama berkas (paralel dengan fieldSlug/buildFileName di aplikasi) ──
def field_slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(c for c in value if not unicodedata.combining(c))  # buang diakritik
    value = re.sub(r"[^\w\s-]", " ", value, flags=re.ASCII)  # karakter aneh → spasi
    value = value.strip()
    value = re.sub(r"\s+", "-", value)  # spasi → hyphen
    value = re.sub(r"-+", "-", value)  # rapikan hyphen ganda
    return value


def build_filename(meta: dict) -> str:
    parts = [
        str(meta.get("year", "")).strip(),
        field_slug(str(meta.get("author", ""))),
        field_slug(str(meta.get("title", ""))),
    ]
    parts = [p for p in parts if p]
    return "_".join(parts) or "Dokumen"


# ── Panggil Claude untuk metadata ─────────────────────────────────────────────
def suggest_meta(client: Anthropic, text: str, model: str) -> dict:
    resp = client.messages.create(
        model=model,
        max_tokens=300,
        system=SYSTEM,
        messages=[{"role": "user", "content": text[:6000]}],
    )
    raw = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text").strip()
    # Buang code fence bila model tetap membungkus JSON.
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.IGNORECASE).strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {"year": "", "author": "", "title": ""}
    return {
        "year": str(data.get("year", "")).strip(),
        "author": str(data.get("author", "")).strip(),
        "title": str(data.get("title", "")).strip(),
    }


# ── Resolusi tabrakan nama ────────────────────────────────────────────────────
def unique_target(folder: Path, stem: str, ext: str, taken: set[str]) -> Path:
    candidate = f"{stem}{ext}"
    n = 2
    while candidate.lower() in taken or (folder / candidate).exists():
        candidate = f"{stem}-{n}{ext}"
        n += 1
    taken.add(candidate.lower())
    return folder / candidate


def find_pdfs(folder: Path, recursive: bool) -> list[Path]:
    pattern = "**/*.pdf" if recursive else "*.pdf"
    return sorted(p for p in folder.glob(pattern) if p.is_file())


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Rename PDF dalam folder ke format Tahun_Penulis_Judul dengan AI (Claude).",
    )
    ap.add_argument("folder", nargs="?", default=".", help="Folder berisi PDF (default: folder ini).")
    ap.add_argument("--dry-run", action="store_true", help="Tampilkan rencana tanpa mengubah file.")
    ap.add_argument("-r", "--recursive", action="store_true", help="Sertakan subfolder.")
    ap.add_argument("--model", default=DEFAULT_MODEL, help=f"Model Claude (default: {DEFAULT_MODEL}).")
    ap.add_argument("--max-pages", type=int, default=5, help="Jumlah halaman awal yang dibaca (default: 5).")
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("ANTHROPIC_API_KEY belum di-set. Contoh: export ANTHROPIC_API_KEY=sk-ant-...")

    folder = Path(args.folder).expanduser().resolve()
    if not folder.is_dir():
        sys.exit(f"Folder tidak ditemukan: {folder}")

    pdfs = find_pdfs(folder, args.recursive)
    if not pdfs:
        print(f"Tidak ada file PDF di {folder}" + (" (termasuk subfolder)" if args.recursive else ""))
        return 0

    client = Anthropic()
    taken: set[str] = set()
    renamed = skipped = failed = 0

    mode = "DRY-RUN (tidak ada file yang diubah)" if args.dry_run else "RENAME"
    print(f"[{mode}] {len(pdfs)} PDF di {folder}\n")

    for pdf in pdfs:
        rel = pdf.relative_to(folder)
        try:
            text = extract_pdf_text(pdf, max_pages=args.max_pages)
            if not text:
                print(f"  ⚠️  {rel}  →  dilewati (tidak ada teks; mungkin hasil scan)")
                skipped += 1
                continue

            meta = suggest_meta(client, text, args.model)
            new_stem = build_filename(meta)
            target = unique_target(pdf.parent, new_stem, pdf.suffix.lower(), taken)

            if target.name == pdf.name:
                print(f"  ✓  {rel}  →  sudah sesuai, dilewati")
                skipped += 1
                continue

            if args.dry_run:
                print(f"  ○  {rel}  →  {target.name}")
            else:
                pdf.rename(target)
                print(f"  ✔  {rel}  →  {target.name}")
            renamed += 1
        except Exception as e:  # per-file: jangan hentikan seluruh batch
            print(f"  ✗  {rel}  →  GAGAL: {e}")
            failed += 1

    verb = "akan di-rename" if args.dry_run else "di-rename"
    print(f"\nSelesai: {renamed} {verb}, {skipped} dilewati, {failed} gagal.")
    if args.dry_run and renamed:
        print("Jalankan lagi tanpa --dry-run untuk menerapkan.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
