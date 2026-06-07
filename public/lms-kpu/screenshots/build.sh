#!/usr/bin/env bash
# Regenerasi ikon PWA & screenshot store dari sumber SVG.
# Prasyarat: rsvg-convert (paket: librsvg2-bin) + node.
#   sudo apt-get install -y librsvg2-bin
# Jalankan dari folder ini:  ./build.sh
set -euo pipefail
cd "$(dirname "$0")"
ICONS="../icons"
TMP="$(mktemp -d)"

echo "▶ Ikon (dari icons/icon.svg & icons/maskable.svg)"
rsvg-convert -w 192 -h 192 "$ICONS/icon.svg"     -o "$ICONS/icon-192.png"
rsvg-convert -w 512 -h 512 "$ICONS/icon.svg"     -o "$ICONS/icon-512.png"
rsvg-convert -w 512 -h 512 "$ICONS/maskable.svg" -o "$ICONS/maskable-512.png"

echo "▶ Screenshot (dari generate.mjs)"
node generate.mjs "$TMP"
for f in 01-beranda 02-alur 03-knowledge 04-ai; do rsvg-convert -w 1080 -h 1920 "$TMP/$f.svg" -o "$f.png"; done
for f in 05-arsitektur 06-talent;             do rsvg-convert -w 1920 -h 1080 "$TMP/$f.svg" -o "$f.png"; done

echo "▶ Slide sisipan Usulan HNP (dari usulan-slides.mjs)"
node usulan-slides.mjs "$TMP"
for f in usulan-sipinter-slide usulan-akronim-slide; do rsvg-convert -w 1920 -h 1080 "$TMP/$f.svg" -o "$f.png"; done

rm -rf "$TMP"
echo "✓ Selesai. PNG ter-update di icons/ dan screenshots/."
