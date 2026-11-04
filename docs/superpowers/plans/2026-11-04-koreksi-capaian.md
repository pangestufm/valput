# Koreksi capaian bulanan

Rancangan disetujui pengguna pada 4 November 2026. Push GitHub dan deployment Netlify diizinkan setelah verifikasi.

## Batas perubahan

- Hanya mesin validator dan teks hasilnya dalam script `index.html`. HTML statis, CSS, template tabel, font, tombol, dan struktur ekspor tetap sama.
- PCRO sebelumnya = T - Q. Rekomendasi Q = batas minimal - PCRO sebelumnya, termasuk nilai negatif. Batas minimal tetap mengikuti aturan terbesar %belanja/TPCRO dan kewajiban 100% bila RVRO sama dengan target.
- Untuk kesalahan PCRO dengan PCRO sebelumnya 100%, Q negatif, target positif dan RVRO masih di bawah target: tampilkan dua alternatif dalam rekomendasi dan rekap yang sudah tersedia.
- Alternatif pertama mempertahankan RVRO dan mengoreksi PCRO. Alternatif kedua bersyarat volume benar-benar terealisasi: RVRO sebelumnya = R - O, rekomendasi O = M - RVRO sebelumnya dan Q = 0. Tidak mengasumsikan O selalu negatif atau mengubah data sumber.
- Jika O tidak tersedia/valid, jangan mengarang nilai alternatif RVRO. Pertahankan rekomendasi PCRO.
- Ekspor mengikuti hasil dan rekomendasi yang sama; tidak menambah kolom.

## Pelaksanaan

- [x] Tambahkan tes gagal: -16,70%, -20%, RVRO 0/+3/minus, batas %belanja, R=M, serta pembulatan dan O kosong.
- [x] Hapus penjepitan Q ke nol dan tambahkan dua alternatif bersyarat, tanpa mengganti template tampilan.
- [x] Jalankan semua tes; verifikasi ulang workbook pengguna secara lokal, jangan masukkan data satker ke Git.
- [x] Bandingkan HTML/CSS dan template dengan versi awal, serta round-trip ekspor. Basis sinkronisasi: GitHub main `04601e4`, termasuk landing page ayam terbaru; seluruh kode di luar blok rekomendasi identik.
- [ ] Commit/push ke main dan pastikan situs produksi menyajikan script baru.
