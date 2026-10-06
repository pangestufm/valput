# Update Excel C3

Tujuan: menerima hanya Excel kertas kerja capaian output, menolak format salah dengan pesan pengguna, dan mengekspor hasil validasi yang ditampilkan ke Excel.

## Batasan

- Dasar perubahan adalah index.html versi V12 pada pangestufm/valput.
- Unggah .xlsx dan .xls; CSV ditolak, termasuk yang diganti ekstensi.
- Pesan format salah: "format salah, pastikan file excel diambil dari rekap kertas kerja capaian output".
- Periksa header bertingkat dan posisi kolom A–V; posisi baris judul boleh berubah.
- Pertahankan aturan PCRO, RVRO, kode 99, tema, dan rekapan.
- Gunakan aturan L yang sudah disetujui: normalisasi angka, toleransi 0,01 poin, fallback K/J*100, dan pembagian nol yang aman.
- Ekspor semua baris dengan status, alasan, rekomendasi, serta sumber persentase realisasi; simpan angka dan persentase sebagai angka Excel.
- Pilihan file baru harus menghapus hasil lama dan menonaktifkan ekspor. Pemrosesan yang gagal harus menghentikan loading.
- Publikasi melalui GitHub main akan memicu deployment produksi Netlify yang telah terhubung.

## Langkah dan verifikasi

1. Tulis pengujian Node terhadap JavaScript asli dalam index.html: format header bertingkat, file rusak/CSV, anomali L, aturan kode 99, dan round-trip hasil ekspor menggunakan SheetJS yang sama dengan aplikasi. Jalankan dan pastikan fitur baru belum tersedia.
2. Tambahkan keterangan Excel, accept .xlsx/.xls, notifikasi role=alert, serta tombol ekspor yang aktif hanya setelah validasi sukses. Pisahkan normalisasi/pemeriksaan format dan pembentukan workbook dari operasi UI agar dapat diuji.
3. Periksa signature ZIP/OLE sebelum membaca workbook. Periksa header dan angka wajib sebelum renderTable. Bungkus parsing dan ekspor dengan penanganan kegagalan; hapus state hasil lama saat input berubah.
4. Simpan hasil terstruktur saat renderTable memproses tiap baris. Bentuk workbook dua sheet: Hasil Validasi dan Ringkasan. Terapkan format persentase 0.00%, nominal #,##0, lebar kolom, dan autofilter.
5. Jalankan pengujian, kemudian uji browser melalui unggah contoh sintetis, format salah, tombol ekspor/download, tema, dan perubahan input. Workbook asli Agustus sudah tidak tersedia; fixture mengikuti struktur dan dua kasus data yang diperiksa pada percakapan awal.
6. Periksa diff, commit hanya perubahan aplikasi/dokumentasi/pengujian, push ke main tanpa force, dan pastikan deployment Netlify Published serta halaman publik berisi versi baru.
