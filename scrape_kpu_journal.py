#!/usr/bin/env python3
"""
Scraper & downloader untuk jurnal OJS KPU (Open Journal Systems).
Target default: https://journal.kpu.go.id/index.php/TKP/issue/archive

Cara kerja:
  1. Buka halaman arsip -> kumpulkan semua link "issue" (terbitan).
  2. Untuk tiap issue -> kumpulkan semua link "article".
  3. Untuk tiap article -> ambil metadata + link unduh PDF (galley).
  4. Unduh PDF ke folder, dengan nama file rapi, + simpan metadata.json.

Bersikap sopan: ada jeda (delay) antar request supaya tidak membebani server.

Pemakaian:
  pip install requests beautifulsoup4 lxml
  python3 scrape_kpu_journal.py
  python3 scrape_kpu_journal.py --out ./jurnal_kpu --delay 1.5
  python3 scrape_kpu_journal.py --list-only          # hanya daftar, tanpa unduh
  python3 scrape_kpu_journal.py --max-issues 3       # batasi jumlah terbitan (uji coba)
"""

import argparse
import json
import os
import re
import sys
import time
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit(
        "Modul belum terpasang. Jalankan:\n"
        "    pip install requests beautifulsoup4 lxml"
    )

ARCHIVE_URL = "https://journal.kpu.go.id/index.php/TKP/issue/archive"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}


def slugify(text, maxlen=120):
    """Ubah judul jadi nama file aman."""
    text = re.sub(r"\s+", " ", (text or "").strip())
    text = re.sub(r'[<>:"/\\|?*\n\r\t]+', "", text)
    text = text.replace(" ", "_")
    return text[:maxlen].strip("_") or "tanpa_judul"


class OJSScraper:
    def __init__(self, archive_url, out_dir, delay=1.0, list_only=False):
        self.archive_url = archive_url
        self.base = "{0.scheme}://{0.netloc}".format(urlparse(archive_url))
        self.out_dir = out_dir
        self.delay = delay
        self.list_only = list_only
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.records = []

    def get(self, url):
        time.sleep(self.delay)
        r = self.session.get(url, timeout=60)
        r.raise_for_status()
        return r

    def soup(self, url):
        return BeautifulSoup(self.get(url).text, "lxml")

    # ---- Langkah 1: kumpulkan semua issue dari (semua halaman) arsip ----
    def collect_issues(self):
        issues, seen, page = [], set(), 1
        url = self.archive_url
        while url:
            print(f"[arsip] memuat halaman {page}: {url}")
            s = self.soup(url)
            found_here = 0
            for a in s.select('a[href*="/issue/view/"]'):
                href = urljoin(url, a["href"].split("#")[0])
                if "/issue/view/" in href and href not in seen:
                    seen.add(href)
                    issues.append((href, a.get_text(strip=True)))
                    found_here += 1
            # cari link "halaman berikutnya" (pagination OJS)
            nxt = s.find("a", string=re.compile(r"^\s*>+\s*$")) or s.select_one(
                'a[href*="/issue/archive/"]'
            )
            next_url = None
            for a in s.select('a[href*="/issue/archive/"]'):
                href = urljoin(url, a["href"])
                m = re.search(r"/issue/archive/(\d+)", href)
                if m and int(m.group(1)) > page:
                    next_url = href
                    break
            if next_url and found_here:
                page += 1
                url = next_url
            else:
                url = None
        print(f"[arsip] total {len(issues)} terbitan ditemukan.")
        return issues

    # ---- Langkah 2: kumpulkan artikel dalam satu issue ----
    def collect_articles(self, issue_url):
        s = self.soup(issue_url)
        arts, seen = [], set()
        for a in s.select('a[href*="/article/view/"]'):
            href = urljoin(issue_url, a["href"].split("#")[0])
            if "/article/view/" in href and href not in seen:
                seen.add(href)
                arts.append(href)
        return arts

    # ---- Langkah 3: metadata + link PDF dari satu artikel ----
    def parse_article(self, article_url):
        s = self.soup(article_url)

        def meta(name):
            tag = s.find("meta", attrs={"name": name})
            return tag["content"].strip() if tag and tag.get("content") else ""

        title = meta("citation_title") or (
            s.title.get_text(strip=True) if s.title else ""
        )
        authors = [m["content"] for m in s.find_all("meta", attrs={"name": "citation_author"}) if m.get("content")]
        pdf_url = meta("citation_pdf_url")

        # fallback: cari tautan galley PDF di halaman
        if not pdf_url:
            for a in s.select('a[href*="/article/view/"]'):
                href = a.get("href", "")
                if "/download/" in href or re.search(r"/view/\d+/\d+", href):
                    pdf_url = urljoin(article_url, href)
                    break

        return {
            "article_url": article_url,
            "title": title,
            "authors": authors,
            "date": meta("citation_publication_date") or meta("citation_date"),
            "doi": meta("citation_doi"),
            "pdf_url": pdf_url,
        }

    def download_pdf(self, rec, issue_dir):
        url = rec.get("pdf_url")
        if not url:
            print(f"    ! tidak ada PDF: {rec['title'][:60]}")
            return
        # OJS sering pakai /view/ untuk galley; ubah ke /download/ agar dapat file
        dl = url.replace("/view/", "/download/") if "/article/view/" in url and "/download/" not in url else url
        fname = slugify(rec["title"]) + ".pdf"
        path = os.path.join(issue_dir, fname)
        if os.path.exists(path):
            print(f"    = sudah ada: {fname}")
            return path
        try:
            r = self.get(dl)
            ctype = r.headers.get("Content-Type", "")
            if "pdf" not in ctype.lower() and not r.content[:4] == b"%PDF":
                print(f"    ! bukan PDF ({ctype}) -> {dl}")
                return
            with open(path, "wb") as f:
                f.write(r.content)
            print(f"    + tersimpan: {fname} ({len(r.content)//1024} KB)")
            return path
        except Exception as e:
            print(f"    ! gagal unduh {dl}: {e}")

    def run(self, max_issues=None):
        os.makedirs(self.out_dir, exist_ok=True)
        issues = self.collect_issues()
        if max_issues:
            issues = issues[:max_issues]

        for i, (issue_url, issue_title) in enumerate(issues, 1):
            label = issue_title or urlparse(issue_url).path.rstrip("/").split("/")[-1]
            print(f"\n[{i}/{len(issues)}] Terbitan: {label}\n    {issue_url}")
            issue_dir = os.path.join(self.out_dir, slugify(label, 80))
            if not self.list_only:
                os.makedirs(issue_dir, exist_ok=True)

            for art_url in self.collect_articles(issue_url):
                rec = self.parse_article(art_url)
                rec["issue"] = label
                self.records.append(rec)
                print(f"  - {rec['title'][:70]}")
                if not self.list_only:
                    self.download_pdf(rec, issue_dir)

        meta_path = os.path.join(self.out_dir, "metadata.json")
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(self.records, f, ensure_ascii=False, indent=2)
        print(f"\nSelesai. {len(self.records)} artikel. Metadata -> {meta_path}")


def main():
    ap = argparse.ArgumentParser(description="Scraper jurnal OJS KPU")
    ap.add_argument("--url", default=ARCHIVE_URL, help="URL halaman arsip OJS")
    ap.add_argument("--out", default="./jurnal_kpu", help="folder keluaran")
    ap.add_argument("--delay", type=float, default=1.0, help="jeda detik antar request")
    ap.add_argument("--list-only", action="store_true", help="hanya daftar, tanpa unduh")
    ap.add_argument("--max-issues", type=int, default=None, help="batasi jumlah terbitan")
    args = ap.parse_args()

    OJSScraper(args.url, args.out, args.delay, args.list_only).run(args.max_issues)


if __name__ == "__main__":
    main()
