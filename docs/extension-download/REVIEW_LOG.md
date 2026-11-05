# Review perubahan download

## Polish setelah screenshot pengguna

Temuan: metadata Chrome/Firefox tidak seimbang dan paragraf pemasangan terlalu mendominasi pilihan unduh. Perbaikan hanya pada footer: ikon dan metadata sejajar, area klik sama tinggi, status sementara tetap terlihat singkat, langkah rinci berada di disclosure keyboard-accessible. Tidak mengubah mesin validator atau isi ZIP. Bukti: 24 tes dan browser responsif dua tema; screenshot telah diperiksa.

## Pilihan browser dan port Firefox

P0 yang dicegah: sender.documentId tidak tersedia pada Firefox lama, sehingga owner tidak boleh diam-diam undefined. Adapter hanya menerima token dari port runtime yang hidup dan cocok dengan extension ID/tab/frame. Token dicabut pada disconnect; claim dokumen baru serta pemeriksaan revisi mencegah dokumen lama menyimpan. Engine persetujuan tetap sama dan proteksi tidak dihapus.

P1 yang dicegah: menyebut ZIP unsigned sebagai installer Firefox permanen. Pilihan Firefox berlabel pemasangan sementara, instruksi about:debugging tampil sebelum klik unduh, README menjelaskan muat ulang dan signing AMO terpisah.

P2 yang dicegah: dua tombol selalu terlihat dan menambah kepadatan footer. Native details/summary mempertahankan satu tombol awal dan tidak menambah JavaScript website. Uji keyboard/responsif dan inspeksi screenshot lulus. Tidak ada perubahan fungsi Excel.

Pengujian Firefox memakai profil khusus di .inspection, remote automation hanya untuk proses uji, seluruh request MyIntress diintersep menjadi fixture lokal. Bukan inspeksi profil pengguna atau uji kirim produksi.

Lingkup: index.html hanya bertambah tiga aturan CSS terlingkup dan satu kelompok footer berisi tepat satu tautan unduh. Tidak ada perubahan mesin validator, hero, aset ilustrasi atau kontrol unggah/ekspor/tema.

P1 yang dicegah: tautan ke ZIP kosong atau fallback HTML. Verifikasi lewat signature ZIP, unduhan browser dan SHA256, bukan hanya keberadaan tombol.

P2 yang dicegah: header makin padat atau tombol meluap di ponsel. Tombol ditempatkan pada footer dengan max-width dan teks dapat membungkus. Bukti screenshot dan geometri browser dibandingkan baseline pada kedua tema.

Kompatibilitas: catatan website menyebut Chrome / Edge. Firefox membutuhkan penyesuaian background/API dan pengujian terpisah; ZIP Chrome tidak dipromosikan sebagai paket Firefox. Rujukan: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background

Tidak ada temuan blocking pada perubahan yang diperiksa. Label Khusus KPPN adalah keterangan sasaran pengguna, bukan kontrol akses/autentikasi baru pada website.
