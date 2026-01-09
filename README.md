# 📖 Panduan Mudah Kirim Sertifikat

Halo! Ini adalah panduan cara menggunakan alat pengirim sertifikat otomatis. Jangan khawatir, caranya gampang kok!

---

## 1️⃣ Siapkan Data Penerima (File CSV)

1.  Buka file bernama `recipients.csv` di folder ini.
2.  Anda bisa membukanya pake **Excel** atau **Notepad**.
3.  Isi datanya dengan urutan kolom:
    - **nama**: Nama lengkap penerima (muncul di email)
    - **kampus**: Asal instansi/kampus
    - **email**: Alamat email tujuan
    - **sertifikat_jpg**: Nama file gambar sertifikat (harus pas!)

**Contoh isi:**

```csv
nama,kampus,email,sertifikat_jpg
Budi Santoso,UI,budi@gmail.com,Sertifikat-Budi.jpg
Siti Aminah,ITB,siti@yahoo.com,Sertifikat-Siti.jpg
```

---

## 2️⃣ Siapkan Gambar Sertifikat

1.  Masuk ke folder bernama `certificates`.
2.  Masukkan semua gambar sertifikat (format JPG) ke dalam folder itu.
3.  ⚠️ **PENTING:** Nama file gambar harus **SAMA PERSIS** dengan yang Anda tulis di `recipients.csv`.
    - Kalau di CSV tulis `Sertifikat-Budi.jpg`, nama filenya juga harus `Sertifikat-Budi.jpg`. Besar kecil huruf berpengaruh!

---

## 3️⃣ Cara Menjalankan

1.  Buka aplikasi **Terminal** atau **Command Prompt**.
2.  Arahkan ke folder ini.
3.  Ketik perintah ini lalu tekan **Enter**:
    ```bash
    npm start
    ```

---

## 4️⃣ Apa yang Akan Terjadi?

1.  **Pengecekan Otomatis**: Program akan mengecek apakah semua gambar sertifikat sudah ada. Kalau ada yang hilang, program akan memberitahu Anda.
2.  **Konfirmasi**: Kalau semua aman, program akan tanya "Kirim email sekarang?".
3.  **Ketik `yes`** lalu tekan **Enter** untuk mulai mengirim.
4.  **Selesai!** Anda bisa melihat proses pengiriman satu per satu.

---

## ❓ Masalah Umum

- **Error "File tidak ditemukan"**: Cek lagi nama file gambar di folder `certificates`. Apakah ada salah ketik?
- **Program tidak jalan**: Pastikan sudah install Node.js (tanya tim teknis jika bingung).

Selamat mengirim! 🚀
