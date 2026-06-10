# PPIC Dashboard — Backend Memory

## Project Overview
Backend REST API untuk aplikasi **PPIC Dashboard** (Production Planning and Inventory Control).
Digunakan oleh PT Kokoh Semesta dan perusahaan lain yang mendaftar via sistem registrasi.

- **Versi saat ini:** 1.6.2
- **Port default:** 3000
- **Runtime:** Node.js + Express
- **Database:** MySQL (mysql2/promise, connection pool)
- **Auth:** JWT via HttpOnly cookie (`auth_token`)
- **Password hashing:** Argon2
- **AI:** Google Gemini (`gemini-2.5-flash`) untuk summary project & company report
- **Email:** Nodemailer (SMTP)
- **File upload:** Multer (disk storage ke `uploads/ppic/`)
- **Queue:** fastq (in-memory) untuk AI summary & company report generation

## Stack & Dependencies Penting
| Package | Kegunaan |
|---------|----------|
| express | HTTP server |
| mysql2 | Database (parameterized queries) |
| jsonwebtoken | JWT auth |
| argon2 | Password hashing |
| multer | File upload |
| @google/generative-ai | Gemini AI |
| nodemailer | Email |
| axios | HTTP client ke SAP-Connect & Welder app |
| uuid (v7) | ID generation |
| xlsx | Parse Excel upload |

## Struktur Direktori
```
src/
├── app.js                  # Entry point, route mounting, CORS
├── config/db.js            # MySQL connection pool (class Access)
├── controllers/            # Request handlers
├── services/               # Business logic + DB queries (.ts compiled ke .js)
├── models/                 # SQL query strings
├── routes/                 # Express routers
├── middlewares/
│   ├── jwt.js              # verifyToken.byHeader (cookie), verifyToken.byQuery (URL)
│   ├── privilege.js        # hasPrivilege(permissionId) middleware
│   └── storage.js          # Multer config (uploadExcel + disk storage)
├── extensions/
│   └── welder_rejection_rate/  # Extension app (proxy ke client3.syikha.it.com)
├── services/ai/            # Gemini services, queue, summary, company report
└── _interface/             # TypeScript interfaces
```

## Arsitektur Penting

### Auth Flow
1. `POST /user/login` → verifikasi argon2 → set HttpOnly cookie `auth_token` (7 hari)
2. Semua route protected pakai `jwtServices.verifyToken.byHeader` (baca dari cookie)
3. `req.u` = decoded JWT payload `{ email, user: { id }, company: { id, name } }`
4. Privilege check: `privilege.hasPrivilege(permissionId)` — query DB per request

### Service Layer Pattern
- Semua service `.ts` di-compile ke `.js` via `tsc` (`tsconfig.json` di root)
- Setiap fungsi menerima optional `connection?: PoolConnection`
- Jika `connection` tidak diberikan (standalone): buat koneksi sendiri + **commit** + release
- Jika `connection` diberikan (dalam transaksi): tidak commit, caller yang handle
- Pattern: `const CONNECTION = connection || await PPIC.getConnection()`

### SAP Integration
- SAP-Connect server: `process.env.SAP_URL` (default: `https://sap.syikha.it.com`)
- Service: `src/services/sap-dummy.js` — proxy axios ke SAP-Connect
- Controller: `src/controllers/sap-dummy.js`
- Error handling: preserve HTTP status code asli dari SAP (`error.response?.status`)
- Routes:
  - `GET /sap-dummy/single/:projectNo` — summary paginated (tanpa auth ⚠️)
  - `GET /sap-dummy/single/:projectNo/:identCode` — detail by identCode (tanpa auth ⚠️)
  - `GET /sap-dummy/check/status/:projectNo` — cek status update (dengan auth)
  - `POST /sap-dummy/update/single` — trigger update (dengan auth)

### AI Summary
- Queue in-memory (fastq) untuk generate summary per project
- `POST /ai/summary/enqueue` — tambah ke queue
- `POST /ai/summary/regenerate/:projectId` — regenerate
- `GET /ai/summary/project/:projectId` — ambil hasil
- Company report: `POST /ai/company/report/generate/:companyId` (cooldown 1x/hari)

### Extension: Welder Rejection Rate
- Proxy ke `https://client3.syikha.it.com`
- App URL: `https://ppic-qc-rejection-rate.syikha.it.com`
- Route: `POST /extensions/welder_rejection_rate` (dengan auth)

## Environment Variables
```
HOST                # DB host
DB_USER             # DB username
DB_PASSWORD         # DB password
DATABASE            # DB name (syih2943_ppic)
JWT_SECRET          # JWT signing secret
PORT                # Server port (default 3000)
NODE_ENV            # 'production' untuk secure cookie
URL                 # Backend URL (untuk email link)
APP                 # Frontend URL
SAP_URL             # SAP-Connect server URL
GEMINI_API_KEY      # Google Gemini API key
GEMINI_MODEL        # Model name (default: gemini-2.5-flash)
GEMINI_TIMEOUT_MS   # Timeout Gemini request
EMAIL_HOST          # SMTP host
EMAIL_HOST_USER     # SMTP user
PASSWORD_EMAIL      # SMTP password
```

## Ticketing
Laporan pekerjaan dikirim ke `ticketing.kokohsemesta.co.id` via skill ticketing-report.
- Config: `.ticketing-report.json` di root BE
- Default reporter: Syikha Akmal
- Location: Office Cikande (ID: 20)
- Department: IT (ID: 11)
- Category BACKEND (ID: 9), FRONTEND (ID: 8), DATABASE (ID: 14)
- Prefix laporan: `[PPIC Dashboard]`
- Tiket terakhir: SYIKHA-0152

## Known Security Issues (dari SECURITY_AUDIT.md)
- ⚠️ SAP dummy routes `/single/:projectNo` tanpa autentikasi
- ⚠️ `express.static(path.join(__dirname, ''))` mengekspos source code
- ⚠️ Tidak ada rate limiting pada login & registrasi
- ⚠️ File upload tanpa validasi MIME type & sanitasi nama file
- ⚠️ Path traversal pada download/delete attachment
- Detail lengkap: `SECURITY_AUDIT.md`

## Build
```bash
npm run build   # tsc — compile src/**/*.ts → src/**/*.js
npm start       # nodemon src/app
```
`tsconfig.json` ada di root, `outDir` dan `rootDir` sama-sama `./src`.

## Catatan Penting
- File `.js` di `src/services/` adalah hasil compile dari `.ts` — **jangan edit `.js` langsung**, edit `.ts` lalu build
- Exception: file yang tidak punya `.ts` counterpart (misal `app.js`, semua controllers, routes, models) — edit `.js` langsung
- `sap-dummy.js` di services adalah compiled output dari `sap-dummy.ts`
- CORS saat ini hanya allow `localhost:5173` dan `localhost:5174` — perlu diubah untuk production
