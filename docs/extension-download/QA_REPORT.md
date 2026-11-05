# Download ekstensi KPPN, QA lokal 5 November 2026

- PASS, RED/GREEN: dua tes download gagal sebelum perubahan dan lulus sesudah tombol/ZIP ditambahkan. Seluruh 22 tes Node lulus.
- PASS: hash paket website sama dengan ZIP v0.1.3 yang telah diserahkan, SHA256 8c45121f328a27d4b8a60d1853735823527f7d414a474db047cf3f4094ad218a. ZIP berisi tepat sepuluh file runtime/README; manifest membatasi host MyIntress dan izin storage/activeTab.
- PASS: browser Chrome terisolasi pada 390/768/1440 px, tema terang dan gelap, tidak overflow. Ukuran/posisi horizontal hero, header dan unggah dibandingkan dengan commit 309b884, selisih di bawah satu piksel. Inline JavaScript validator identik setelah normalisasi CRLF.
- PASS: tombol unduh menerima fokus keyboard, kontras teks di atas 4,5:1, nama unduhan sesuai, unduhan native browser selesai dan hash identik dengan paket.
- PASS: unggah workbook uji, proses dua baris, ekspor Excel, ganti ke workbook format salah dan notifikasi. Tidak ada pageerror.
- PASS: screenshot .qa/download-390-light.png dan .qa/download-1440-dark.png dilihat langsung. Tombol sekunder menyatu dengan footer dan tidak menyaingi Validasi Sekarang. Screenshot lokal diabaikan Git.
- Batas uji: CDN SheetJS disajikan dari salinan lokal dan analytics dinonaktifkan pada harness QA. Tidak menguji persetujuan MyIntress. Firefox tidak diuji dan tidak diklaim didukung.

## Verifikasi setelah push

- PASS: commit fitur 5992e8c dipush ke origin/main pada https://github.com/pangestufm/valput.
- PASS: https://caput079.netlify.app menampilkan tepat satu tombol unduh. HTML aplikasi cocok dengan sumber, diikuti script RUM yang ditambahkan Netlify; script tambahan itu tidak diubah/dihapus.
- PASS: unduhan native browser dari website live selesai dengan nama C3-Persetujuan-Caput-v0.1.3.zip dan SHA256 identik di atas. Tidak ada pageerror pada pemeriksaan live. Screenshot .qa/live-extension-download.png dilihat langsung.
