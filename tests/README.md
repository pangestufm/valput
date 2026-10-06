# Pengujian C3

Gunakan Node.js. Unduh versi SheetJS yang sama dengan aplikasi ke direktori lokal yang diabaikan Git, lalu jalankan pengujian:

```powershell
New-Item -ItemType Directory -Force .qa | Out-Null
Invoke-WebRequest 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js' -OutFile '.qa/xlsx.cjs'
node --test tests/app.test.cjs
```

Fixture memakai data sintetis. Pengujian menjalankan JavaScript asli dari index.html dan membaca ulang hasil ekspor untuk memastikan nilai Excel identik dengan hasil di layar.
