# 📧 Email Certificate Blaster - Upstream Force

Sistem untuk mengirim 200 sertifikat via email dengan gambar embedded dan attachment.

---

## 📁 Struktur Folder

Buat folder project dengan struktur ini:

```
upstream-force-certificates/
├── certificates/              # Taruh semua JPG sertifikat di sini
│   ├── CERT001.jpg
│   ├── CERT002.jpg
│   └── ...
├── recipients.csv             # Data penerima
├── send-certificates.js       # Script utama
├── .env                       # Konfigurasi
├── package.json              # Dependencies
└── logs/                     # Auto-generated untuk log hasil
```

---

## 🚀 Langkah Setup

### 1. Install Node.js

Download dan install dari: https://nodejs.org (pilih versi LTS)

### 2. Buat Folder Project

```bash
mkdir upstream-force-certificates
cd upstream-force-certificates
```

### 3. Install Dependencies

Buka terminal di folder project, jalankan:

```bash
npm install
```

### 4. Setup File

1. **Edit `.env`**: Ganti `YOUR_SENDGRID_API_KEY_HERE` dengan API key SendGrid kamu
2. **Isi `recipients.csv`**: Masukkan data 200 penerima
3. **Upload JPG**: Taruh semua file JPG sertifikat di folder `certificates/`

### 5. Jalankan!

```bash
npm start
```

atau

```bash
node send-certificates.js
```

---

## 📊 Yang Terjadi Saat Running

1. **Validasi** - Cek CSV dan semua file JPG ada
2. **Test SMTP** - Cek koneksi ke SendGrid
3. **Preview** - Tampilkan ringkasan
4. **Konfirmasi** - Minta konfirmasi kamu (ketik `yes`)
5. **Kirim** - Progress bar realtime
6. **Summary** - Laporan hasil + save logs

---

## 🎯 Tips

### Untuk 200 Email dengan SendGrid Free (100/day):

**Opsi 1: Split 2 Hari**

- Hari 1: Kirim 100 email pertama
- Hari 2: Kirim 100 sisanya

**Opsi 2: Upgrade SendGrid**

- $20/month untuk 50,000 email
- Bisa kirim 200 sekaligus

### Split Manual:

Edit `recipients.csv`:

- Hari 1: Baris 1-101 (header + 100 data)
- Hari 2: Baris 1 + 102-201 (header + 100 data sisanya)

---

## ⚠️ Troubleshooting

### Error: "Invalid login"

- Pastikan API key SendGrid benar di `.env`
- API key harus "Full Access"

### Error: "File not found"

- Cek nama file di CSV sama dengan file di folder `certificates/`
- Perhatikan huruf besar/kecil (case-sensitive)

### Email masuk spam

- Pastikan domain `pertamina@hulu.com` verified di SendGrid
- Atau pakai email SendGrid verified sender

### Rate limit exceeded

- Tunggu 24 jam untuk reset quota SendGrid
- Atau upgrade plan SendGrid
