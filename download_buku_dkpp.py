#!/usr/bin/env python3
"""
Scraper untuk mengunduh buku dari DKPP:
https://dkpp.go.id/buku/

Cara pakai:
    pip install requests beautifulsoup4
    python download_buku_dkpp.py

Cara kerja:
  1. Buka halaman daftar buku + semua halaman berikutnya (pagination).
  2. Kumpulkan link PDF langsung, dan link ke halaman detail tiap buku.
  3. Buka tiap halaman detail untuk mencari link PDF di dalamnya.
  4. Unduh semua PDF unik ke folder ./buku_dkpp/

Script menampilkan ringkasan apa yang ditemukan, dan aman dijalankan
berulang (file yang sudah ada dilewati).
"""

import os
import re
import time
from urllib.parse import urljoin, urlparse, unquote

import requests
from bs4 import BeautifulSoup

START_URL = "https://dkpp.go.id/buku/"
OUTPUT_DIR = "buku_dkpp"
FILE_EXT = (".pdf", ".epub", ".zip", ".doc", ".docx")

# Batas pengaman supaya tidak menjelajah situs tanpa henti
MAX_LISTING_PAGES = 60
MAX_DETAIL_PAGES = 500

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0 Safari/537.36"
    )
}

# Link internal yang TIDAK perlu dikunjungi sebagai halaman detail
SKIP_PAT = re.compile(
    r"(wp-admin|wp-login|/feed|/tag/|/category/|/author/|"
    r"#|mailto:|tel:|javascript:|/page/|\?|/wp-json)",
    re.I,
)


def sanitize(name: str) -> str:
    name = unquote(name).strip()
    name = re.sub(r'[\\/*?:"<>|]', "_", name)
    name = re.sub(r"\s+", " ", name)
    return name[:180] or "file"


def get_soup(session, url):
    resp = session.get(url, timeout=60)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def is_file_link(url):
    return urlparse(url).path.lower().endswith(FILE_EXT)


def crawl_listing(session, host):
    """Telusuri halaman /buku/ dan pagination-nya.
    Kembalikan (pdf_links, detail_links)."""
    pdf_links = {}      # url -> judul
    detail_links = {}   # url -> judul
    to_visit = [START_URL]
    visited = set()

    while to_visit and len(visited) < MAX_LISTING_PAGES:
        url = to_visit.pop(0)
        if url in visited:
            continue
        visited.add(url)
        print(f"[LIST] {url}")
        try:
            soup = get_soup(session, url)
        except Exception as e:
            print(f"   gagal: {e}")
            continue

        for a in soup.find_all("a", href=True):
            full = urljoin(url, a["href"]).split("#")[0]
            if urlparse(full).netloc and urlparse(full).netloc != host:
                continue  # link ke domain lain, lewati
            title = a.get_text(strip=True)

            if is_file_link(full):
                pdf_links.setdefault(full, title or os.path.basename(urlparse(full).path))
            elif re.search(r"/buku/page/\d+", full):
                if full not in visited:
                    to_visit.append(full)
            elif not SKIP_PAT.search(full) and full.rstrip("/") != START_URL.rstrip("/"):
                # kandidat halaman detail buku
                if title:
                    detail_links.setdefault(full, title)

    return pdf_links, detail_links


def harvest_details(session, detail_links):
    """Kunjungi halaman detail untuk menemukan link PDF."""
    found = {}  # pdf_url -> judul
    items = list(detail_links.items())[:MAX_DETAIL_PAGES]
    for i, (url, title) in enumerate(items, 1):
        print(f"[DETAIL {i}/{len(items)}] {title[:60]}")
        try:
            soup = get_soup(session, url)
        except Exception as e:
            print(f"   gagal: {e}")
            continue
        for a in soup.find_all("a", href=True):
            full = urljoin(url, a["href"]).split("#")[0]
            if is_file_link(full):
                found.setdefault(full, title or a.get_text(strip=True))
        time.sleep(0.5)
    return found


def download(session, title, url, idx):
    ext = os.path.splitext(urlparse(url).path)[1] or ".pdf"
    base = sanitize(title)
    if not base.lower().endswith(ext.lower()):
        base += ext
    filename = f"{idx:03d}_{base}"
    dest = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        print(f"[SKIP] {filename}")
        return
    print(f"[GET ] {filename}")
    try:
        with session.get(url, stream=True, timeout=180) as r:
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
    host = urlparse(START_URL).netloc

    print("=== Tahap 1: menelusuri daftar buku ===")
    pdf_links, detail_links = crawl_listing(session, host)
    print(f"\n  PDF langsung di daftar : {len(pdf_links)}")
    print(f"  Kandidat halaman detail: {len(detail_links)}\n")

    print("=== Tahap 2: membuka halaman detail untuk cari PDF ===")
    detail_pdfs = harvest_details(session, detail_links)

    # Gabungkan semua PDF
    all_pdfs = {**pdf_links, **detail_pdfs}
    print(f"\n=== Total PDF ditemukan: {len(all_pdfs)} ===\n")

    if not all_pdfs:
        print(
            "Tidak ada PDF ditemukan.\n"
            "Kemungkinan daftar dimuat lewat JavaScript/API (seperti situs KPU).\n"
            "Buka https://dkpp.go.id/buku/ di Chrome, tekan F12 -> tab Network ->\n"
            "filter Fetch/XHR -> refresh, lalu kirim alamat API yang memuat daftar buku."
        )
        return

    for i, (url, title) in enumerate(sorted(all_pdfs.items()), 1):
        download(session, title, url, i)
        time.sleep(1)

    print("\nSelesai. File ada di folder:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
