#!/usr/bin/env python3
"""
Scraper untuk mengunduh seluruh file buku dari halaman KPU:
https://www.kpu.go.id/berita/140/buku-kpu

Cara pakai:
    pip install requests beautifulsoup4
    python download_buku_kpu.py

File akan tersimpan di folder ./buku_kpu/
Script aman dijalankan berulang: file yang sudah ada akan dilewati (resume).
"""

import os
import re
import time
from urllib.parse import urljoin, urlparse, unquote

import requests
from bs4 import BeautifulSoup

START_URL = "https://www.kpu.go.id/berita/140/buku-kpu"
OUTPUT_DIR = "buku_kpu"
# Ekstensi file yang dianggap "buku" untuk diunduh
FILE_EXT = (".pdf", ".epub", ".zip", ".doc", ".docx", ".rar")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0 Safari/537.36"
    )
}


def sanitize(name: str) -> str:
    """Bersihkan nama file dari karakter ilegal."""
    name = unquote(name).strip()
    name = re.sub(r'[\\/*?:"<>|]', "_", name)
    return name[:200] or "file"


def collect_file_links(session: requests.Session, url: str) -> list[tuple[str, str]]:
    """Ambil semua link file (href yang berakhiran FILE_EXT) dari satu halaman."""
    resp = session.get(url, timeout=60)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        full = urljoin(url, href)
        path = urlparse(full).path.lower()
        if path.endswith(FILE_EXT):
            title = a.get_text(strip=True) or os.path.basename(urlparse(full).path)
            links.append((title, full))
    return links


def download(session: requests.Session, title: str, url: str, idx: int):
    """Unduh satu file dengan resume sederhana (skip jika sudah ada)."""
    ext = os.path.splitext(urlparse(url).path)[1] or ".pdf"
    base = sanitize(title)
    if not base.lower().endswith(ext.lower()):
        base += ext
    filename = f"{idx:03d}_{base}"
    dest = os.path.join(OUTPUT_DIR, filename)

    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        print(f"[SKIP] {filename} (sudah ada)")
        return

    print(f"[GET ] {filename}  <-  {url}")
    try:
        with session.get(url, stream=True, timeout=120) as r:
            r.raise_for_status()
            tmp = dest + ".part"
            with open(tmp, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            os.replace(tmp, dest)
        print(f"[OK  ] {filename}")
    except Exception as e:
        print(f"[FAIL] {filename}: {e}")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    session = requests.Session()
    session.headers.update(HEADERS)

    print(f"Mengambil daftar file dari: {START_URL}")
    links = collect_file_links(session, START_URL)

    # Hilangkan duplikat berdasarkan URL, jaga urutan
    seen = set()
    unique = []
    for title, url in links:
        if url not in seen:
            seen.add(url)
            unique.append((title, url))

    print(f"Ditemukan {len(unique)} file untuk diunduh.\n")

    if not unique:
        print(
            "Tidak ada link file ditemukan langsung di HTML.\n"
            "Kemungkinan daftar dimuat lewat JavaScript/API. "
            "Lihat catatan di bawah script untuk solusi (Selenium / inspect API)."
        )
        return

    for i, (title, url) in enumerate(unique, start=1):
        download(session, title, url, i)
        time.sleep(1)  # sopan: jeda 1 detik antar unduhan

    print("\nSelesai.")


if __name__ == "__main__":
    main()
