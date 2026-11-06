# Mode Konfirmasi ekstensi 0.1.4

Permintaan: tombol tambahan untuk kolom Terkonfirmasi; lewati tepat terkonfirmasi, proses status lain melalui Action Konfirmasi, pilih terkonfirmasi, isi catatan sesuai lalu Kirim. Validasi lama tetap terpisah.

DOM asli diperiksa baca-saja: dialog Tambah Catatan, label Status Terkonfirmasi, dua opsi terkonfirmasi/tidak terkonfirmasi dan satu textarea Catatan wajib. Status/catatan/Kirim produksi tidak diubah. Dialog yang sebelumnya sudah dibuka pengguna dibiarkan tetap terbuka.

UI mempertahankan panel 440px dengan dua tombol mode Validasi/Konfirmasi dan satu tombol proses sesuai mode. Ganti mode mereset deklarasi; mode dikunci selama antrean belum selesai. Antrean, mode, owner dokumen dan revisi disimpan bersama checkpoint. Antrean lama tanpa mode default Validasi. Mode tidak bisa diubah oleh SAVE/Resume yang berbeda.

Adapter hanya mengganti kolom status/action, identitas dialog, opsi dan kewajiban catatan menurut mode yang tersimpan. Konfirmasi memakai fingerprint data non-workflow (dua status dan Catatan boleh berubah setelah konfirmasi); nilai output/keuangan tetap dijaga. Fingerprint Validasi lama dipertahankan. Status pilihan dan catatan diperiksa lagi pada guard terakhir sebelum Kirim. Kiriman ambigu tidak pernah diulang otomatis.

Paket Chrome/Edge dan Firefox menjadi v0.1.4; website hanya memperbarui URL/versi ZIP, layout dan validator Excel tidak diubah. Firefox tetap paket temporary unsigned. Uji unit, DOM, popup, MV3 Edge dan Firefox asli dengan fixture terisolasi, termasuk dua refresh pada URL sama dan pembuktian tidak menjalankan Action Validasi di mode Konfirmasi.
