# Tombol unduh ekstensi KPPN

Permintaan: satu tombol "Khusus KPPN - Validator Caput", ZIP ekstensi Chrome terbaru, langsung push, tanpa merombak tampilan.

Tombol berupa tautan download native di footer aplikasi, memakai gaya tombol sekunder/tema yang sudah ada. Satu catatan kecil menyebut Chrome / Edge, versi 0.1.3 dan README di ZIP. Hero, unggah, tema dan mesin validasi tetap. Footer dipilih agar alat persetujuan menjadi langkah sesudah pemeriksaan C3, bukan menyaingi tombol Validasi Sekarang. Tombol di header akan menambah kepadatan; banner baru tidak diperlukan.

Paket statis di downloads/C3-Persetujuan-Caput-v0.1.3.zip berisi sepuluh file runtime/README saja. Bukan installer otomatis, bukan versi Firefox. Paket tidak berisi fixture, profil browser, checkpoint, token atau data satker. Distribusi publik tidak mengubah kewenangan akun MyIntress.

Verifikasi: tes download statis dan seluruh regresi validator; unduhan browser beserta hash; viewport 390/768/1440 dan tema terang/gelap; push ke origin/main lalu cek HTML dan ZIP live Netlify. Jika deployment belum tampil, laporkan terpisah dari keberhasilan push.
