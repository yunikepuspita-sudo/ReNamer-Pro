# Kolom — Tip Menulis

Naskah untuk kolom **Tip Menulis** di [yunikepuspita.com](https://yunikepuspita.com):
catatan praktis seputar menulis akademik dan produktivitas riset, ditulis dengan
gaya tutur reflektif ala Kang Jalal—percakapan, bukan ceramah.

## Konvensi penulisan

- Satu artikel = satu berkas Markdown, nama berkas memakai *slug* (huruf kecil,
  dipisah tanda hubung).
- Setiap berkas diawali *front matter* YAML: `kolom`, `judul`, `subjudul`,
  `penulis`, `situs`, `tanggal` (`YYYY-MM-DD`), `slug`, `ringkasan`, dan `tag`.
- Bahasa Indonesia baku yang hangat; istilah teknis asing dimiringkan dan
  diberi padanan saat pertama kali muncul.
- Sitasi ditulis lengkap di bagian *Bacaan yang sepadan*; **tidak pernah**
  mengandalkan AI untuk membuat sitasi.

## Daftar naskah

| Tanggal | Judul | Naskah (MD) | Halaman publish (HTML) |
|---------|-------|-------------|------------------------|
| 2026-06-10 | Menyortir 50 Paper Sebelum Anda Membacanya | [`menyortir-50-paper-sebelum-membaca.md`](./menyortir-50-paper-sebelum-membaca.md) | [`public/tip-menulis/…html`](../../public/tip-menulis/menyortir-50-paper-sebelum-membaca.html) |

## Versi siap-publish (HTML)

Halaman HTML mandiri (self-contained) untuk di-deploy lewat GitHub Pages ada di
`public/tip-menulis/`. Setiap halaman:

- Berdiri sendiri — CSS ditanam inline, **ilustrasi berupa SVG** (tanpa aset
  gambar eksternal, mengikuti konvensi repo).
- Responsif, menyertakan meta Open Graph, tipografi *Fraunces* + *Inter*.
- Tayang di `…/tip-menulis/<slug>.html` setelah build/deploy.
