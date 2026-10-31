# Redesign C3: inventaris fungsi sebelum perubahan

Dasar: `index.html` commit `c2c3fa3` (V13, produksi Netlify `caput079` sejak 22 Okt 2026).
Aturan redesign: tampilan boleh diganti total, fungsi hanya boleh bertambah.

## Fungsi yang harus tetap sama

| # | Fungsi | Elemen / fungsi JS | Cara membuktikan |
| --- | --- | --- | --- |
| 1 | Analitik Umami | `<script defer src="https://cloud.umami.is/script.js" data-website-id=...>` | Tag identik di diff |
| 2 | Judul tab | `<title>Cepat Cek Caput (C3) - V13</title>` | Tag identik |
| 3 | Pembaca Excel | SheetJS 0.18.5 dari cdnjs | Tag identik |
| 4 | Tema terang/gelap | `#toggleThemeBtn` → `toggleTheme()`, atribut `data-theme="dark"` pada `<html>`, label "Dark Mode"/"Light Mode", `localStorage.theme` | Klik di browser, muat ulang, label dan atribut sama |
| 5 | Pilih file | `#excelFileInput` (`accept=".xlsx, .xls"`, `aria-describedby`), `updateFileName()` | Tes Node + uji browser |
| 6 | Nama file | `#fileNameDisplay`: "Belum ada file yang dipilih..." / "<nama> dipilih." | Tes Node + uji browser |
| 7 | Validasi | `#processButton` → `startProcessing()` → `readValidationRows()` → `renderTable()` | Tes Node + uji browser dengan file sintetis |
| 8 | Notifikasi | `#uploadNotification` (`role="alert"`), pesan `FORMAT_ERROR` dan pesan lain | Tes Node + uji browser (file .csv) |
| 9 | Loading | `#loading` "Menganalisis Kertas Kerja..." | Inspeksi kode (tidak diubah) |
| 10 | Ringkasan | `#summaryGrid`, `#countTotal`, `#countValid`, `#countError` | Uji browser: angka sama dengan versi lama |
| 11 | Pesan per satker | `#recap-section`, `#recap-list`, tombol "Salin Pesan" → `copyToClipboard()` + `alert` | Uji browser: teks pesan identik |
| 12 | Ekspor | `#exportActions`, `#exportButton` → `exportValidation()` → `Hasil_Validasi_<nama>.xlsx` (2 sheet) | Tes Node round-trip + unduhan di browser |
| 13 | Tabel hasil | `#result-container`, `#result` (11 kolom, baris error berlatar `--error-bg`) | Uji browser: HTML tabel identik dengan versi lama |
| 14 | Footer | "Powered by KPPN Sintang" | Teks identik |
| 15 | Responsif | breakpoint 768px | Screenshot 390px |

## Batas teknis yang ditemukan

- `tests/app.test.cjs` menjalankan **semua** tag `<script>` inline di `index.html` dalam VM tanpa DOM sungguhan.
  Kode hero 3D wajib berada di file terpisah (`assets/hero.js`) supaya tes tetap menguji kode aplikasi saja.
- Variabel CSS `--error-bg`, `--text-muted`, `--primary-color` dipakai oleh HTML yang dibangun JavaScript
  (style inline). Namanya dipertahankan, hanya nilainya yang berubah.
- Blok `<script>` aplikasi tidak diubah satu karakter pun. Dibuktikan dengan hash SHA-256 sebelum dan sesudah.

## Baseline tes (sebelum perubahan)

`node --test tests/app.test.cjs`: 14 tes, 12 lulus, 2 gagal.
Dua kegagalan sudah ada sebelum redesign: tes masih mengharapkan pesan "...diambil dari **rekap** kertas kerja...",
sedangkan commit `c2c3fa3` mengganti pesan aplikasi menjadi "...diambil dari **detail** kertas kerja...".
Redesign tidak memperbaikinya (di luar lingkup, keputusan teks ada di tangan pemilik).

## Hasil verifikasi setelah redesign (31 Okt 2026, lokal)

- Blok `<script>` aplikasi: hash SHA-256 `8a72fffbf27cc17e…` sama sebelum dan sesudah.
- `node --test tests/app.test.cjs`: 12 lulus, 2 gagal, identik dengan baseline (dua kegagalan lama di atas).
- Uji kesetaraan di Chrome headless (Playwright, Umami diblokir) dengan workbook sintetis 4 baris
  (2 satker, kasus PCRO kurang, kode 99, RVRO = target, pagu 0, nama satker berisi `<` dan `&`):
  21 hal yang diamati dibandingkan versi lama, **0 perbedaan**. Termasuk: HTML tabel hasil, HTML dan teks
  pesan per satker, isi clipboard dan alert setelah "Salin Pesan", nama file dan seluruh isi dua sheet ekspor
  (kecuali "Waktu ekspor"), notifikasi CSV, tema + `localStorage` + muat ulang, reset hasil saat pilih file baru.
- Tambahan yang diuji: urutan Tab (lompat ke aplikasi, Mulai validasi, Jeda gerak, Sapa Caput, petunjuk scroll,
  lalu kontrol aplikasi seperti sebelumnya), fokus terlihat pada semua kontrol, Enter/Space bekerja,
  render 3D berhenti saat dijeda dan saat hero di luar layar (0 frame/detik), `prefers-reduced-motion`
  memakai gambar diam tanpa mengunduh three.js, tanpa overflow horizontal di 1440/768/390 px.
- Kontras WCAG semua pasangan warna teks terang dan gelap: terendah 5,36:1 (AA).
