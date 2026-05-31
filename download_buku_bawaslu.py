#!/usr/bin/env python3
"""
Scraper untuk mengunduh buku dari e-Library Bawaslu:
https://e-lib.bawaslu.go.id/kategori/Buku/...

Cara pakai:
    pip install requests beautifulsoup4
    python download_buku_bawaslu.py

Cara kerja:
  1. Buka halaman kategori + semua halaman berikutnya (pagination ?page=N).
  2. Kumpulkan link PDF langsung dan link ke halaman detail tiap buku.
  3. Buka tiap halaman detail untuk mencari link unduh PDF.
  4. Unduh semua PDF unik ke folder ./buku_bawaslu/

Aman dijalankan berulang (file yang sudah ada dilewati).
"""

import os
import re
import time
from urllib.parse import urljoin, urlparse, unquote

import requests
import urllib3
from bs4 import BeautifulSoup

# Situs Bawaslu memakai sertifikat SSL dengan rantai tidak lengkap, sehingga
# verifikasi gagal di sebagian komputer. Kita matikan verifikasi (file publik).
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

START_URL = "https://e-lib.bawaslu.go.id/kategori/Buku/Af9baaf8-7cfb-4344-9886-Jd25281O58a1"
OUTPUT_DIR = "buku_bawaslu"
FILE_EXT = (".pdf", ".epub", ".zip", ".doc", ".docx")

MAX_LISTING_PAGES = 100
MAX_DETAIL_PAGES = 1000

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0 Safari/537.36"
    )
}

# Link yang tidak perlu dikunjungi sebagai halaman detail
SKIP_PAT = re.compile(
    r"(wp-admin|wp-login|/feed|mailto:|tel:|javascript:|"
    r"/login|/register|/logout|facebook\.com|twitter\.com|"
    r"instagram\.com|youtube\.com|whatsapp)",
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


def is_pagination(url):
    return bool(re.search(r"([?&]page=\d+|/page/\d+|[?&]p=\d+)", url, re.I))


def crawl_listing(session, host):
    """Telusuri halaman kategori + pagination. Kembalikan (pdf, detail)."""
    pdf_links = {}
    detail_links = {}
    to_visit = [START_URL]
    visited = set()

    base_path = urlparse(START_URL).path  # untuk kenali halaman kategori yang sama

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
            netloc = urlparse(full).netloc
            if netloc and netloc != host:
                continue
            title = a.get_text(strip=True)

            if is_file_link(full):
                pdf_links.setdefault(full, title or os.path.basename(urlparse(full).path))
            elif is_pagination(full) and base_path in full:
                if full not in visited:
                    to_visit.append(full)
            elif not SKIP_PAT.search(full) and full.rstrip("/") != START_URL.rstrip("/"):
                # kandidat halaman detail buku (biasanya /detail/.. atau /buku/..)
                if re.search(r"/(detail|buku|book|koleksi|publikasi|item|view)/", full, re.I):
                    detail_links.setdefault(full, title or full)

    return pdf_links, detail_links


def harvest_details(session, detail_links):
    found = {}
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
        # beberapa e-library memakai <iframe> atau tombol dengan data-href
        for tag in soup.find_all(["iframe", "embed", "source"], src=True):
            full = urljoin(url, tag["src"]).split("#")[0]
            if is_file_link(full):
                found.setdefault(full, title)
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
    session.verify = False  # lewati verifikasi SSL (rantai sertifikat Bawaslu tidak lengkap)
    host = urlparse(START_URL).netloc

    print("=== Tahap 1: menelusuri daftar buku ===")
    pdf_links, detail_links = crawl_listing(session, host)
    print(f"\n  PDF langsung di daftar : {len(pdf_links)}")
    print(f"  Kandidat halaman detail: {len(detail_links)}\n")

    print("=== Tahap 2: membuka halaman detail untuk cari PDF ===")
    detail_pdfs = harvest_details(session, detail_links)

    all_pdfs = {**pdf_links, **detail_pdfs}
    print(f"\n=== Total PDF ditemukan: {len(all_pdfs)} ===\n")

    if not all_pdfs:
        print(
            "Tidak ada PDF ditemukan.\n"
            "Kemungkinan daftar/unduhan dimuat lewat JavaScript/API.\n"
            "Buka halaman kategori di Chrome, tekan F12 -> tab Network ->\n"
            "filter Fetch/XHR -> refresh, lalu kirim alamat API yang memuat daftar buku.\n"
            "Atau buka satu halaman detail buku, klik kanan tombol Download -> "
            "Copy link address, lalu kirim ke sini."
        )
        return

    for i, (url, title) in enumerate(sorted(all_pdfs.items()), 1):
        download(session, title, url, i)
        time.sleep(1)

    print("\nSelesai. File ada di folder:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
