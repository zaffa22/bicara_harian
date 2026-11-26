# Bicara Harian
Latihan bicara bahasa Inggris untuk pemula: satu kalimat per hari.

## Membuat APK di GitHub (paling mudah pakai laptop/PC)
1. Ekstrak file zip.
2. Di github.com buat repository baru, misalnya `bicara-harian`.
3. Klik "uploading an existing file", seret SEMUA isi folder (bukan file zip-nya), lalu Commit.
4. Folder `.github` kadang tersembunyi dan tidak ikut. Cek di repository. Jika tidak ada:
   Add file > Create new file, ketik nama `.github/workflows/build-apk.yml`,
   tempel isi file itu, lalu Commit.
5. Buka tab Actions > "Buat APK". Jika belum jalan, klik "Run workflow". Tunggu sampai centang hijau.
6. Klik hasil run, unduh `BicaraHarian-apk` di bagian Artifacts, ekstrak, lalu pasang
   `BicaraHarian.apk` di HP (izinkan "instal dari sumber tidak dikenal").

## Di HP
- Butuh aplikasi Google (pengenal suara) dan suara bahasa Inggris di Text-to-speech.
- Sambungkan internet supaya pengenalan suara lebih lancar.

## Catatan
- Nilai menunjukkan apakah kata-katamu dikenali, bukan penilaian aksen secara rinci.
- Tata bahasa tidak dikoreksi.
- Progres tersimpan di HP; hilang jika aplikasi dihapus.
- `scripts/debug.keystore` hanya kunci uji untuk pemakaian pribadi. Jangan dipakai untuk Play Store.

## Mengubah kalimat
Edit `www/data.js`. Tambahkan kalimat baru di bagian akhir.
