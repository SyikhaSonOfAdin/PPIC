# Extension System - Backend Requirements

## 📋 Tujuan

Buat sistem yang memungkinkan frontend menampilkan data dari aplikasi/API eksternal (pihak ketiga) melalui backend sebagai proxy. Backend bertugas:

1. Menyimpan konfigurasi extension (URL, auth, parameters)
2. Menerima request dari frontend
3. Mengambil data dari API eksternal dengan authentication
4. Mengembalikan data ke frontend

---

## 🎯 Yang Perlu Dibangun

### 1. Database

Buat tabel untuk menyimpan konfigurasi extension:

```sql
CREATE TABLE extensions (
  id VARCHAR(50) PRIMARY KEY,
  company_id VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  
  -- External API config
  endpoint_url VARCHAR(500) NOT NULL,
  endpoint_method ENUM('GET', 'POST') DEFAULT 'GET',
  
  -- Authentication (encrypt this!)
  auth_type ENUM('none', 'jwt', 'basic', 'api_key') DEFAULT 'none',
  auth_credentials TEXT, -- encrypted JSON
  
  -- What data to send
  requires_project_id BOOLEAN DEFAULT FALSE,
  requires_project_no BOOLEAN DEFAULT FALSE,
  
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id)
);
```

### 2. Encrypt Credentials

Credentials harus di-encrypt sebelum disimpan:

```javascript
// Example: { token: "abc123" } → encrypt → save to DB
// Later: decrypt from DB → use in request
```

Gunakan: AES-256-CBC atau library encryption lain

### 3. API Endpoints

#### A. List Extensions
```
GET /extensions/list/:companyId
```
Return: semua extensions untuk company tersebut

#### B. Add Extension
```
POST /extensions/add
Body: { name, endpoint_url, auth_type, auth_credentials, ... }
```
Action: Encrypt credentials, save to DB

#### C. Test Connection
```
POST /extensions/test-connection
Body: { endpoint_url, auth_type, auth_credentials }
```
Action: Coba connect ke external API, return success/error

#### D. **Proxy Request** (Most Important!)
```
GET /extensions/proxy/:extensionId?projectId=123&projectNo=SI-001
```

**Flow:**
1. Get extension config from DB (by extensionId)
2. Decrypt auth credentials
3. Build URL ke external API dengan query params dari frontend
4. Add authentication headers (JWT/API Key/Basic)
5. Request ke external API
6. Return response ke frontend

**Example:**

Frontend call:
```
GET /extensions/proxy/qc-report?projectId=123
```

Backend action:
```javascript
// 1. Query DB: extension 'qc-report'
// 2. Found: { endpoint_url: "https://qc.vendor.com/api/data", auth_type: "jwt", auth_credentials: "encrypted..." }
// 3. Decrypt credentials → { token: "abc123" }
// 4. Request to: https://qc.vendor.com/api/data?projectId=123
//    Headers: Authorization: Bearer abc123
// 5. Get response from vendor
// 6. Return to frontend
```

---

## 🔐 Security Requirements

1. **Encrypt credentials** di database (jangan plain text!)
2. **Verify company_id** - user hanya bisa akses extension milik company mereka
3. **Add timeout** - external request max 30 detik
4. **Rate limiting** - max 60 requests/menit per user
5. **Error handling** - jangan expose internal errors

---

## 📤 Response Format

### Success
```json
{
  // Pass-through response dari external API
  // Bisa JSON, bisa HTML (untuk iframe)
}
```

### Error
```json
{
  "message": "Extension request failed",
  "error": "Connection timeout"
}
```

---

## 🧪 Test Cases

1. ✅ Add extension dengan JWT auth → credentials ter-encrypt di DB
2. ✅ Test connection → return success jika external API reachable
3. ✅ Proxy request → dapat response dari external API
4. ✅ User dari company A tidak bisa akses extension company B
5. ✅ Timeout jika external API lambat (>30s)

---

## 📝 Example Auth Types

### JWT (Bearer Token)
```javascript
headers: { 'Authorization': 'Bearer eyJhbGc...' }
```

### API Key
```javascript
headers: { 'X-API-Key': 'sk_live_abc123' }
```

### Basic Auth
```javascript
headers: { 'Authorization': 'Basic base64(username:password)' }
```

---

## ⚙️ Environment Variables

```env
EXTENSION_ENCRYPTION_KEY=<32-byte-random-string>
ENABLE_EXTENSION_LOGS=true
```

---

## 🎯 Priority

**Phase 1 (Critical):**
- ✅ Database table
- ✅ Encryption/decryption
- ✅ POST /extensions/add
- ✅ GET /extensions/proxy/:id (proxy endpoint)

**Phase 2 (Nice to have):**
- GET /extensions/list
- POST /extensions/test-connection
- Logging table

---

## 📞 Questions?

Hubungi frontend team jika butuh klarifikasi tentang:
- Format response yang diharapkan
- Parameter apa saja yang akan dikirim frontend
- Authentication method yang perlu didukung

---

**Expected Delivery:** [timeline]  
**Assigned To:** Backend Team  
**Status:** Pending Implementation
