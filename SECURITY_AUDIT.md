# Security Audit Report — PPIC Dashboard Backend

**Tanggal Audit:** 2026-05-18  
**Auditor:** Kiro (AI Security Analysis)  
**Versi Aplikasi:** 1.6.2  
**Stack:** Node.js · Express · MySQL2 · JWT · Argon2 · Multer · Gemini AI

---

## Ringkasan Eksekutif

Dari hasil analisis menyeluruh terhadap seluruh source code backend, ditemukan **5 temuan kritis**, **6 temuan tinggi**, **4 temuan sedang**, dan **3 temuan rendah**. Beberapa celah dapat langsung dieksploitasi tanpa autentikasi.

| Tingkat | Jumlah |
|---------|--------|
| 🔴 Kritis | 5 |
| 🟠 Tinggi | 6 |
| 🟡 Sedang | 4 |
| 🟢 Rendah | 3 |

---

## 🔴 KRITIS

### K-1 · File `.env` Tidak Ada di `.gitignore`

**File:** `.env` (root project)  
**Dampak:** Seluruh secret (DB password, JWT secret, Gemini API key, email password) bisa bocor ke repository publik/tim.

```
.env ditemukan di root project
.gitignore tidak ditemukan / tidak mengecualikan .env
```

**Variabel sensitif yang terekspos jika .env ter-commit:**
- `JWT_SECRET` — seluruh autentikasi bisa dipalsukan
- `DB_PASSWORD` — akses penuh ke database
- `GEMINI_API_KEY` — penyalahgunaan billing AI
- `PASSWORD_EMAIL` — akses akun email pengirim
- `SAP_URL` — endpoint internal SAP

**Rekomendasi:**
```bash
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
# Buat .env.example tanpa nilai sensitif
```

---

### K-2 · Endpoint SAP Dummy Tanpa Autentikasi (Data Leak)

**File:** `src/routes/sap-dummy.js`

```js
// TIDAK ada jwtServices.verifyToken di sini:
sapDummyRouter.get("/single/:projectNo/:identCode", sapDummyController.get.by.projectNo);
sapDummyRouter.get("/single/:projectNo",            sapDummyController.get.by.projectNo);
```

**Dampak:** Siapapun yang mengetahui nomor project dapat mengakses seluruh data material SAP (purchase order, goods receipt, inventory transfer, dll.) tanpa login. Data bisnis sensitif klien terekspos sepenuhnya.

**Rekomendasi:**
```js
sapDummyRouter.get("/single/:projectNo/:identCode", jwtServices.verifyToken.byHeader, sapDummyController.get.by.projectNo);
sapDummyRouter.get("/single/:projectNo",            jwtServices.verifyToken.byHeader, sapDummyController.get.by.projectNo);
```

---

### K-3 · Path Traversal pada File Download Attachment

**File:** `src/controllers/attachment.js` (baris 116–121)

```js
const fileName = await attachmentServices.get.fileName(attachmentId);
const filePath = path.join(
  __dirname,
  "../../../uploads/ppic",
  fileName[0]["FILE_NAME"],  // ← nilai dari database, tidak disanitasi
);
return res.sendFile(filePath, fileName, ...);
```

**Dampak:** Jika database dimanipulasi atau `FILE_NAME` mengandung `../../etc/passwd`, server bisa mengirim file sembarang dari filesystem. Kombinasi dengan K-2 (jika attachment endpoint juga tidak terproteksi) menjadi sangat berbahaya.

**Rekomendasi:**
```js
const safeName = path.basename(fileName[0]["FILE_NAME"]); // strip traversal
const filePath = path.join(__dirname, "../../../uploads/ppic", safeName);
// Tambahkan validasi: pastikan filePath masih dalam direktori uploads
const uploadsDir = path.resolve(__dirname, "../../../uploads/ppic");
if (!filePath.startsWith(uploadsDir)) {
  return res.status(400).json({ message: "Invalid file path" });
}
```

---

### K-4 · Path Traversal pada Delete Attachment

**File:** `src/controllers/attachment.js` (baris 46–53)

```js
const filePath = path.join(
  __dirname,
  "../../../uploads/ppic",
  fileName[0]["FILE_NAME"],  // ← tidak disanitasi
);
await attachmentServices.delete.onlyOne(rowId, connection);
fs.unlink(filePath, ...);  // ← bisa hapus file sembarang di server
```

**Dampak:** Attacker yang bisa memanipulasi `FILE_NAME` di database dapat menghapus file kritis di server (config, binary, dll.).

**Rekomendasi:** Sama dengan K-3 — gunakan `path.basename()` dan validasi direktori.

---

### K-5 · Registrasi Perusahaan Terbuka Tanpa Rate Limiting

**File:** `src/routes/company.js`

```js
router.post("/registration", companyControllers.registration)  // tidak ada auth, tidak ada rate limit
```

**Dampak:**
- Endpoint ini membuat company + user + mengirim email — bisa digunakan untuk spam email massal dari server Anda.
- Tidak ada CAPTCHA, tidak ada rate limiting → rentan abuse otomatis.
- Email aktivasi mengandung `companyId` dalam URL yang bisa di-enumerate.

**Rekomendasi:** Tambahkan rate limiting ketat (misal: 3 request/jam per IP) dan pertimbangkan CAPTCHA atau invite-only registration.

---

## 🟠 TINGGI

### T-1 · JWT Token Dikirim via Query String (`byQuery`)

**File:** `src/middlewares/jwt.js`

```js
byQuery: (req, res, next) => {
  const token = req.query.token;  // ← token di URL
  ...
}
```

**Digunakan di:** `src/routes/company.js` → `/reg/c/:cId`

**Dampak:** Token di URL tersimpan di:
- Browser history
- Server access log
- Proxy/CDN log
- Referrer header jika ada link eksternal

Token aktivasi company bisa bocor dari log server.

**Rekomendasi:** Gunakan POST body atau header `Authorization` untuk token. Jika harus via URL, pastikan token sangat short-lived (sudah 5 menit — cukup baik) dan log di-mask.

---

### T-2 · Tidak Ada Rate Limiting pada Login

**File:** `src/routes/user.js`

```js
router.post('/login', userControllers.login)  // tidak ada rate limiting
```

**Dampak:** Brute force password tanpa hambatan. Meskipun Argon2 memperlambat per-attempt, serangan terdistribusi tetap memungkinkan.

**Rekomendasi:**
```bash
npm install express-rate-limit
```
```js
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
router.post('/login', loginLimiter, userControllers.login);
```

---

### T-3 · Tidak Ada Validasi MIME Type pada Upload File Umum

**File:** `src/middlewares/storage.js`

```js
// uploadExcel → ada filter MIME ✓
// storage (disk) → TIDAK ada fileFilter sama sekali:
storage = multer({ storage: this.#storage });
```

**Digunakan di:** `src/routes/attachment.js` → `storage.storage.single('file')`

**Dampak:** User bisa mengupload file `.php`, `.js`, `.sh`, `.exe`, atau file berbahaya lainnya. Jika server salah konfigurasi dan mengeksekusi file dari direktori uploads, ini bisa menjadi Remote Code Execution.

**Rekomendasi:**
```js
const ALLOWED_TYPES = ['image/jpeg','image/png','image/gif','application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const ALLOWED_EXT = ['.jpg','.jpeg','.png','.gif','.pdf','.xlsx'];

storage = multer({
  storage: this.#storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_TYPES.includes(file.mimetype) && ALLOWED_EXT.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});
```

---

### T-4 · Nama File Upload Menggunakan `originalname` Tanpa Sanitasi

**File:** `src/middlewares/storage.js`

```js
filename: (req, file, cb) => {
  this.nameFile = Date.now().toString() + "-" + file.originalname;  // ← berbahaya
  cb(null, this.nameFile);
},
```

**Dampak:** Nama file bisa mengandung karakter berbahaya: `../`, null bytes, karakter shell, atau nama yang sangat panjang. Contoh: upload file bernama `../../app.js` bisa menimpa file source code.

**Rekomendasi:**
```js
const { v4: uuidv4 } = require('uuid');
const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
this.nameFile = `${Date.now()}-${uuidv4()}${ext}`;
```

---

### T-5 · `express.static` Melayani Direktori Source Code

**File:** `src/app.js`

```js
app.use(express.static(path.join(__dirname, '')));
// __dirname = /path/to/BE/src
// Ini melayani SELURUH isi folder src/ sebagai file statis!
```

**Dampak:** Seluruh file `.js` di folder `src/` bisa diakses langsung via HTTP. Attacker bisa membaca source code, query SQL, konfigurasi, dan logika bisnis melalui browser.

Contoh: `GET http://server:3000/config/db.js` → menampilkan konfigurasi database.

**Rekomendasi:** Hapus atau perbaiki baris ini. Jika memang perlu serve static files, arahkan ke folder khusus:
```js
app.use('/uploads', express.static(path.join(__dirname, '../../uploads/ppic')));
// HAPUS: app.use(express.static(path.join(__dirname, '')));
```

---

### T-6 · Privilege Endpoint Tanpa Validasi Kepemilikan

**File:** `src/routes/privilege.js`

```js
router.post('/add',    jwtServices.verifyToken.byHeader, privilegeController.add)
router.post('/delete', jwtServices.verifyToken.byHeader, privilegeController.delete.onlyOne)
```

**Dampak:** Setiap user yang sudah login (tanpa privilege khusus) bisa menambah atau menghapus privilege milik user lain. Tidak ada pengecekan apakah user yang melakukan aksi adalah admin atau memiliki hak untuk memodifikasi privilege target.

**Rekomendasi:** Tambahkan `privilege.hasPrivilege(ADMIN_PERMISSION_ID)` pada kedua route ini.

---

## 🟡 SEDANG

### S-1 · Error Message Mengekspos Detail Internal

**File:** Hampir semua controller

```js
return res.status(500).json({
  message: error.message,  // ← stack trace / query error bocor ke client
  error: error.message,
});
```

**Dampak:** Pesan error MySQL (nama tabel, kolom, constraint) bocor ke client, membantu attacker memetakan struktur database.

**Rekomendasi:**
```js
// Production: log detail, kirim pesan generik
console.error('[ERROR]', error);
return res.status(500).json({ message: "Internal Server Error" });
```

---

### S-2 · Tidak Ada Security Headers (Helmet)

**File:** `src/app.js`

Tidak ada `helmet`, `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, atau `Strict-Transport-Security`.

**Dampak:** Rentan terhadap clickjacking, MIME sniffing, dan serangan berbasis header lainnya.

**Rekomendasi:**
```bash
npm install helmet
```
```js
const helmet = require('helmet');
app.use(helmet());
```

---

### S-3 · CORS Hanya Mengizinkan Localhost (Konfigurasi Production Dikomentari)

**File:** `src/app.js`

```js
const corsOptions = {
  // origin: 'https://ppic.syikha.com',  // ← dikomentari
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
};
```

**Dampak:** Jika kode ini di-deploy ke production tanpa mengubah konfigurasi, CORS akan menolak semua request dari domain production. Ini bukan celah keamanan langsung, tapi menunjukkan risiko deployment yang tidak aman — konfigurasi production dan development tercampur.

**Rekomendasi:** Gunakan environment variable:
```js
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'],
  credentials: true,
};
```

---

### S-4 · Data Sensitif Dikembalikan di Response Login

**File:** `src/controllers/user.js`

```js
return res.status(200).json({
  data: [{
    uId: user.ID,
    uName: user.USERNAME,
    cId: user.COMPANY_ID,
    cName: user.COMPANY_NAME,
    pId: user.PROJECT_ID,
    eAddr: user.EMAIL,
    t: "ignore",         // ← field misterius
    version: "1.6.0"     // ← versi aplikasi terekspos
  }]
})
```

**Dampak:** Versi aplikasi yang terekspos membantu attacker menargetkan CVE spesifik. Field `t: "ignore"` menunjukkan ada logika tersembunyi yang perlu diaudit.

**Rekomendasi:** Hapus field `version` dari response. Audit field `t`.

---

## 🟢 RENDAH

### R-1 · `console.log` Debug Tersisa di Production Code

**File:** `src/controllers/category.js`, `src/controllers/aiSummary.js`

```js
console.log({ companyId, userId, name, description, uom })  // data user bocor ke log
console.log("enqueue")
```

**Dampak:** Data user bisa bocor ke log server. Pada environment cloud, log bisa diakses oleh pihak ketiga.

**Rekomendasi:** Hapus semua `console.log` debug atau gunakan library logging terstruktur (winston/pino) dengan level kontrol.

---

### R-2 · JWT Expiry 7 Hari Tanpa Mekanisme Revoke

**File:** `src/controllers/user.js`

```js
{ expiresIn: '7d' }
```

**Dampak:** Jika token dicuri, attacker memiliki akses selama 7 hari penuh. Tidak ada blacklist token atau refresh token mechanism.

**Rekomendasi:** Implementasikan refresh token dengan expiry pendek (15 menit access token + 7 hari refresh token), atau simpan token version di database untuk invalidasi.

---

### R-3 · Tidak Ada Input Length Validation

**File:** Semua controller

Tidak ada validasi panjang maksimum untuk field seperti `username`, `email`, `password`, `description`, dll.

**Dampak:** Potensi DoS melalui payload sangat besar, atau buffer-related issues di layer database.

**Rekomendasi:** Tambahkan validasi dengan library seperti `joi` atau `zod`:
```js
const schema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(128).required(),
  username: Joi.string().max(100).required(),
});
```

---

## Matriks Prioritas Perbaikan

| Prioritas | Item | Estimasi Effort |
|-----------|------|-----------------|
| 1 (Segera) | K-1: Pastikan `.env` tidak ter-commit | 5 menit |
| 2 (Segera) | K-2: Tambahkan auth ke SAP dummy routes | 10 menit |
| 3 (Segera) | T-5: Hapus `express.static` yang salah | 5 menit |
| 4 (Hari ini) | K-3 & K-4: Sanitasi path traversal attachment | 30 menit |
| 5 (Hari ini) | T-3 & T-4: Validasi & sanitasi upload file | 1 jam |
| 6 (Minggu ini) | T-2: Rate limiting login & registrasi | 1 jam |
| 7 (Minggu ini) | T-6: Privilege endpoint butuh auth check | 30 menit |
| 8 (Minggu ini) | S-2: Tambahkan Helmet | 15 menit |
| 9 (Sprint) | S-1: Generalize error messages | 2 jam |
| 10 (Sprint) | R-2: Refresh token mechanism | 1 hari |

---

## Hal yang Sudah Baik ✅

- Password di-hash dengan **Argon2** (bukan MD5/SHA1/bcrypt biasa) — pilihan terbaik saat ini.
- JWT disimpan di **HttpOnly cookie** — terlindung dari XSS.
- Semua query database menggunakan **parameterized query** (mysql2 prepared statements) — tidak ada SQL injection.
- Upload Excel memiliki **MIME type filter** yang baik.
- File upload dibatasi **5MB** untuk Excel.
- Privilege middleware (`hasPrivilege`) diterapkan konsisten di sebagian besar route sensitif.
- Cookie menggunakan `sameSite: 'lax'` — proteksi dasar CSRF.
- `secure: process.env.NODE_ENV === 'production'` sudah dikondisikan dengan benar.

---

*Laporan ini dihasilkan melalui analisis statis source code. Pengujian penetrasi dinamis (runtime) diperlukan untuk konfirmasi penuh.*
