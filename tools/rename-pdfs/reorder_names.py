#!/usr/bin/env python3
# ──────────────────────────────────────────────────────────────────────────
# reorder_names.py — Susun ulang nama file dari pola Mendeley
#                    "Penulis - Tahun - Judul"  →  "Tahun_Penulis_Judul".
#
# TANPA AI, tanpa kunci API, tanpa membaca isi file — hanya mengolah NAMA file.
# Cocok untuk koleksi besar yang sudah dinamai Mendeley (Author - Year - Title).
#
# Konektor:  "_" antar-bagian utama,  "-" antar-kata di dalam bagian.
# Tahun ditaruh di depan agar file otomatis urut kronologis saat di-sort.
#
# AMAN secara default: hanya PRATINJAU. File baru benar-benar di-rename hanya
# bila kamu menambahkan flag --apply. Setiap perubahan dicatat ke file log CSV
# yang juga bisa dipakai untuk MEMBATALKAN (--undo).
#
# Pemakaian:
#   python reorder_names.py "D:\folder"                 # pratinjau (default)
#   python reorder_names.py "D:\folder" -r              # termasuk subfolder
#   python reorder_names.py "D:\folder" -r --apply      # terapkan
#   python reorder_names.py --undo rename-log.csv       # batalkan dari log
#
# Tidak butuh dependensi apa pun (Python standar saja).
# ──────────────────────────────────────────────────────────────────────────

from __future__ import annotations

import argparse
import csv
import datetime as dt
import re
import sys
from pathlib import Path

# Karakter yang tidak boleh ada di nama file Windows.
FORBIDDEN = re.compile(r'[<>:"/\\|?*\x00-\x1f]')
# Pemisah pola Mendeley: " - " (spasi-strip-spasi) atau "_-_".
SEPARATORS = (" - ", "_-_")


def slug_field(value: str) -> str:
    """Rapikan satu bagian: buang karakter ilegal, spasi → '-'. Unicode dipertahankan."""
    value = FORBIDDEN.sub("", value.strip())
    value = re.sub(r"\s+", "-", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-_ ")


def parse_meta(stem: str) -> tuple[str, str, str] | None:
    """Pisahkan 'Penulis - Tahun - Judul'. Kembalikan (penulis, tahun, judul) atau None."""
    for sep in SEPARATORS:
        if sep in stem:
            parts = stem.split(sep)
            if len(parts) >= 3:
                author, year = parts[0], parts[1]
                title = sep.join(parts[2:])
                return author, year, title
    return None


def build_name(author: str, year: str, title: str) -> str:
    parts = [slug_field(year), slug_field(author), slug_field(title)]
    parts = [p for p in parts if p]
    return "_".join(parts) or "Dokumen"


def unique_target(folder: Path, stem: str, ext: str, taken: set[str]) -> Path:
    candidate = f"{stem}{ext}"
    n = 2
    while candidate.lower() in taken or (folder / candidate).exists():
        candidate = f"{stem}-{n}{ext}"
        n += 1
    taken.add(candidate.lower())
    return folder / candidate


def match_ext(path: Path, exts: list[str] | None) -> bool:
    return exts is None or path.suffix.lower() in exts


def do_undo(log_path: Path) -> int:
    if not log_path.is_file():
        sys.exit(f"File log tidak ditemukan: {log_path}")
    rows = list(csv.DictReader(log_path.open(encoding="utf-8")))
    restored = failed = 0
    # Balik urutan agar tidak bentrok dengan rename berantai.
    for row in reversed(rows):
        new_p, old_p = Path(row["new_path"]), Path(row["old_path"])
        try:
            if new_p.is_file() and not old_p.exists():
                new_p.rename(old_p)
                print(f"  [undo] {new_p.name}  ->  {old_p.name}")
                restored += 1
        except Exception as e:
            print(f"  [FAIL] {new_p.name}  ->  {e}")
            failed += 1
    print(f"\nUndo selesai: {restored} dikembalikan, {failed} gagal.")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Susun ulang nama 'Penulis - Tahun - Judul' menjadi 'Tahun_Penulis_Judul' (tanpa AI).",
    )
    ap.add_argument("folder", nargs="?", default=".", help="Folder berisi file (default: folder ini).")
    ap.add_argument("--apply", action="store_true", help="Benar-benar me-rename (default: pratinjau saja).")
    ap.add_argument("-r", "--recursive", action="store_true", help="Sertakan subfolder.")
    ap.add_argument(
        "--ext",
        default=".pdf",
        help="Ekstensi yang diproses, dipisah koma (mis. '.pdf,.docx'). Pakai '*' untuk semua. Default: .pdf",
    )
    ap.add_argument("--log", default="", help="Path file log CSV (default: rename-log-<waktu>.csv di folder).")
    ap.add_argument("--undo", metavar="LOG_CSV", help="Batalkan rename berdasarkan file log CSV.")
    args = ap.parse_args()

    if args.undo:
        return do_undo(Path(args.undo).expanduser().resolve())

    folder = Path(args.folder).expanduser().resolve()
    if not folder.is_dir():
        sys.exit(f"Folder tidak ditemukan: {folder}")

    exts = None if args.ext.strip() == "*" else [
        e if e.startswith(".") else "." + e for e in (x.strip().lower() for x in args.ext.split(",")) if e
    ]

    pattern = "**/*" if args.recursive else "*"
    files = sorted(p for p in folder.glob(pattern) if p.is_file() and match_ext(p, exts))
    if not files:
        print(f"Tidak ada file cocok di {folder}")
        return 0

    taken: set[str] = set()
    plan: list[tuple[Path, Path]] = []
    skipped = 0

    for f in files:
        meta = parse_meta(f.stem)
        if not meta:
            skipped += 1
            continue
        new_stem = build_name(*meta)
        target = unique_target(f.parent, new_stem, f.suffix.lower(), taken)
        if target.name == f.name:
            skipped += 1
            continue
        plan.append((f, target))

    mode = "APPLY (file di-rename)" if args.apply else "PRATINJAU (tidak ada perubahan)"
    print(f"[{mode}] {len(files)} file, {len(plan)} akan disusun ulang, {skipped} dilewati\n")

    for src, dst in plan:
        print(f"  {src.name}\n    -> {dst.name}")

    if not plan:
        print("Tidak ada yang perlu diubah.")
        return 0

    # Tulis log CSV (selalu, agar bisa di-undo / sebagai catatan).
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    log_path = Path(args.log).expanduser().resolve() if args.log else folder / f"rename-log-{stamp}.csv"

    if args.apply:
        renamed = failed = 0
        with log_path.open("w", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            w.writerow(["old_path", "new_path"])
            for src, dst in plan:
                try:
                    src.rename(dst)
                    w.writerow([str(src), str(dst)])
                    renamed += 1
                except Exception as e:
                    print(f"  [FAIL] {src.name}  ->  {e}")
                    failed += 1
        print(f"\nSelesai: {renamed} di-rename, {skipped} dilewati, {failed} gagal.")
        print(f"Log tersimpan: {log_path}")
        print(f"Untuk membatalkan:  python reorder_names.py --undo \"{log_path}\"")
    else:
        print(f"\n[PRATINJAU] {len(plan)} file siap disusun ulang, {skipped} dilewati.")
        print("Tambahkan --apply untuk menerapkan.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
