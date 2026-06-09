# rename-pdfs — Rename PDF lokal ke `Tahun_Penulis_Judul`

Skrip CLI untuk mengganti nama file PDF **di folder komputermu** menggunakan AI
(Claude). Ini versi lokal dari fitur "AI rename" pada aplikasi web ReNamer-Pro —
bedanya, skrip ini benar-benar mengubah nama file di disk (browser tidak bisa).

Hasilnya mengikuti konvensi yang sama: **`Tahun_Penulis_Judul.pdf`**
(`_` memisahkan antar-bagian, `-` memisahkan kata di dalam satu bagian).

Contoh: `Usulan Honorarium 2024.pdf` → `2024_KPU_Usulan-Honorarium-Non-PNS.pdf`

## 1. Prasyarat

- Python 3.9+
- Kunci API Anthropic (Claude)

## 2. Pasang dependensi

```bash
cd tools/rename-pdfs
pip install -r requirements.txt
```

## 3. Set kunci API

```bash
# macOS / Linux
export ANTHROPIC_API_KEY=sk-ant-...

# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="sk-ant-..."
```

## 4. Jalankan

```bash
# Pratinjau dulu (AMAN — tidak mengubah file):
python rename_pdfs.py "/path/ke/folder" --dry-run

# Langsung rename:
python rename_pdfs.py "/path/ke/folder"

# Termasuk subfolder:
python rename_pdfs.py "/path/ke/folder" -r
```

## Opsi

| Flag | Fungsi |
|------|--------|
| `folder` | Folder berisi PDF (default: folder saat ini `.`) |
| `--dry-run` | Tampilkan rencana nama baru tanpa mengubah file |
| `-r`, `--recursive` | Sertakan PDF di subfolder |
| `--model` | Model Claude (default: `claude-opus-4-8`) |
| `--max-pages` | Jumlah halaman awal yang dibaca (default: 5) |

## Catatan

- **Aman dari tabrakan nama**: bila ada dua file menghasilkan nama sama, otomatis
  ditambah sufiks (`-2`, `-3`, …).
- **PDF hasil scan** (gambar tanpa teks) dilewati dengan peringatan — tidak diubah.
- Hanya halaman awal yang dibaca, jadi hemat token & cepat.
- Disarankan coba `--dry-run` dulu pada folder besar sebelum menerapkan.
