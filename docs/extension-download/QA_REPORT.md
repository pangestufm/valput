# Download ekstensi KPPN, QA lokal 5 November 2026

## Versi 0.1.4, mode Konfirmasi (6 November 2026)

- DOM asli dibaca tanpa mengisi/mengirim: dialog Tambah Catatan, Status Terkonfirmasi, pilihan tepat terkonfirmasi/tidak terkonfirmasi, textarea Catatan wajib. Tidak ada konfirmasi produksi dijalankan.
- 46 tes ekstensi lulus. Mode terkunci pada antrean, SAVE tidak bisa mengubah mode, checkbox direset saat memilih mode lain, dan antrean lama tanpa mode tetap Validasi.
- Smoke native Edge MV3 dan Firefox 154.0.1 lulus: dua konfirmasi sintetis dengan catatan sesuai, Cek tanpa kirim nol pengiriman, dan mode tetap Konfirmasi melalui dua reload saat URL tetap/tabel hilang. Tidak menjalankan Action Validasi di mode Konfirmasi.
- Website hanya memperbarui URL dan versi dua ZIP menjadi v0.1.4. Layout pilihan browser dan engine Excel tidak diubah; 24 tes website lulus. Paket lama tetap tersedia untuk backup.
- Firefox tetap temporary unsigned seperti versi sebelumnya. Pengujian memakai profil terisolasi dan intersepsi seluruh request MyIntress menjadi fixture; bukan akun produksi.

## Polish pilihan browser

- PASS RED/GREEN: tes metadata seragam, batasan Firefox tetap terlihat dan instruksi terlipat gagal sebelum perubahan, kemudian seluruh 24 tes website lulus.
- PASS: kartu sejajar memakai ikon browser, label/versi seragam dan ikon unduh; petunjuk panjang menjadi daftar langkah dalam disclosure Cara pasang Firefox. Peringatan pemasangan sementara tetap terlihat sebelum unduh.
- PASS: 390/768/1440 px terang/gelap, chooser tertutup/terbuka, tanpa overflow; Enter/Space/Tab untuk chooser dan bantuan, kedua hash ZIP, unggah-validasi-ekspor-notifikasi format salah, tanpa pageerror. Hero/header/unggah dan inline engine tetap identik baseline.
- PASS: screenshot mobile terang dan desktop gelap dilihat langsung. Paket ekstensi tidak diubah.

## Dua pilihan browser, pembaruan Firefox

- PASS RED/GREEN: tes disclosure dan paket Firefox gagal sebelum implementasi, lalu seluruh 23 tes website lulus. Engine/adapter ekstensi lokal lulus 40 tes, termasuk port mati, owner baru, pesan tanpa port dan frame lain.
- PASS native Firefox 154.0.1 pada profil anonim terisolasi: instalasi temporary add-on, popup, Cek tanpa kirim (dua X, nol kiriman), dua persetujuan fixture sintetis, dan pemulihan tabel hilang dengan URL sama. Refresh pertama masih form filter, refresh kedua pulih; owner port berubah dan tepat dua kiriman total. Tidak mengakses sesi/akun produksi.
- PASS: paket Firefox berisi 13 file whitelist dan engine yang sama dengan Chrome. Event-page manifest, tiga adapter Firefox, popup loader dan README khusus; tidak menyertakan fixture/profil/riwayat. Paket Chrome tidak berubah: SHA256 8c45121f328a27d4b8a60d1853735823527f7d414a474db047cf3f4094ad218a.
- PASS browser chooser: 390/768/1440 px, terang/gelap, tertutup/terbuka, tanpa overflow; hero/header/unggah dibandingkan baseline tetap. Enter/Space membuka-menutup, Tab mencapai Chrome lalu Firefox, kedua unduhan native selesai dan hash cocok. Upload-validasi-export-notifikasi format salah masih lulus, tanpa pageerror.
- PASS: screenshot browser-choice-390-light-open.png dan browser-choice-1440-dark-open.png dilihat langsung. Pilihan bertumpuk di ponsel dan dua kolom di desktop, tidak tampil sebelum tombol dibuka.
- Batas distribusi: Firefox ZIP belum ditandatangani Mozilla; temporary add-on perlu dimuat ulang sesudah browser ditutup. Label sebelum unduh dan README menyebutkan batas ini. Pemasangan permanen/AMO dan persetujuan MyIntress produksi NOT RUN. Tidak mematikan signature di profil pengguna.
- PASS live setelah push 70c6748: disclosure tertutup saat mulai, dibuka lewat tombol footer, kedua unduhan native selesai dengan nama yang benar dan hash cocok. SHA256 Firefox: 9a239d83773adf17b776d12e63eea587fcdbafcf38f122216d2b76a48a642d52. HTML aplikasi cocok dengan sumber; hanya tambahan RUM Netlify seperti sebelumnya. Tidak ada pageerror. Screenshot .qa/live-browser-choice.png dilihat langsung.

## Catatan versi satu tombol sebelumnya

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
