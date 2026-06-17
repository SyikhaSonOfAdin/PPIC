# PPIC Dashboard Backend — API Documentation

## AI Integration

### AI Driver Migration (OpenRouter)
- **Provider:** OpenRouter API (replaces Google Gemini SDK)
- **Model:** `google/gemini-2.5-flash`
- **Env Var:** `OPEN_ROUTER_API_KEY`
- **Timeout:** 30 seconds
- **Files:** `src/services/ai/gemini.js`, `src/services/ai/geminiCompany.js`

### AI Summary with Temporal Context
AI project summaries now include real-time date awareness:
- Current date reference
- Days remaining/overdue calculation
- Progress vs time elapsed comparison
- Risk assessment based on deadline proximity
- Prompt includes: `HARI INI`, timeline status, progress health indicators

**Example Temporal Context:**
```
HARI INI: Sabtu, 14 Juni 2026
Status Timeline: OVERDUE
Terlambat: 15 hari dari deadline
Waktu Berjalan: 85.3% dari total durasi
Progress Aktual: 62.4%
Progress vs Waktu: SIGNIFICANTLY BEHIND (progress jauh tertinggal - RISK TINGGI)
```

---

## Project Endpoints

### GET /project (List All Projects)
**Added Feature:** Status filter and project statistics

**Query Parameters:**
- `status` (optional): Filter by status (`On Going`, `Ahead`, `On Time`, `Delayed`)

**Response 200:**
```json
{
  "message": "Success",
  "data": [...],
  "stats": {
    "total": 150,
    "on_going": 45,
    "ahead": 30,
    "on_time": 50,
    "delayed": 25
  }
}
```

**Notes:**
- Stats calculated before filter applied
- Status filter applied in controller layer
- Stats object always included regardless of filter

### POST /project/add
**Added Feature:** Auto-generate periods based on project timeline

**Request Body:**
```json
{
  "companyId": "uuid",
  "categoryId": "uuid",
  "projectNo": "P-2026-001",
  "client": "PT Example",
  "userId": "uuid",
  "name": "Project Name",
  "spk": "SPK-001",
  "description": "Project description",
  "ppm": "PPM-001",
  "capacity": 100,
  "workPlace": "Jakarta",
  "startDate": "2026-06-14",
  "dueDate": "2026-12-31",
  "finishDate": "",
  "delivery": "",
  "budget": 1000000,
  "cost": 0,
  "man_hours": 0,
  "periodInterval": 7,
  "periodType": "weekly"
}
```

**Period Auto-Generation:**
- If `periodInterval` and `periodType` provided, system auto-generates:
  - `project_plans` entries (one per period)
  - `project_actual` entries (one per period)
- Period types:
  - `weekly`: 7 days interval, labels: `Week 1`, `Week 2`, etc.
  - `monthly`: 30 days interval, labels: `Month 1`, `Month 2`, etc.
  - `custom`: Uses `periodInterval` value, labels: `Period 1`, `Period 2`, etc.
- Each period has:
  - Start/end dates within project timeline
  - Dynamic label based on period type
  - Default percentage: 0
  - Default amount: 0

**Response 200:**
```json
{
  "message": "Project added successfully",
  "data": [
    {
      "projectId": "uuid"
    }
  ]
}
```

**Files Updated:**
- `src/models/projectDetail.js` - Added `PERIOD_INTERVAL`, `PERIOD_TYPE` columns
- `src/services/projectDetail.ts` - Handle new fields in `add()` function
- `src/controllers/project.js` - Auto-generate periods logic
- `src/utils/periodGenerator.js` - Period generation helper functions
- `migrations/004_add_period_config_to_project_detail.sql` - Database migration

---

## Phase Schedule Endpoints

Base path: `/project/phase-schedule`

### GET /get/:projectId
Get all phase schedules for a project.

**Auth:** Required (JWT cookie)

**Response 200:**
```json
{
  "message": "Success",
  "data": [
    {
      "ID": "uuid",
      "PROJECT_ID": "uuid",
      "DEPARTMENT_ID": "uuid",
      "DEPARTMENT_NAME": "Civil Engineering",
      "PHASE": "Engineering",
      "PLAN_START_WEEK": "Week 1",
      "PLAN_END_WEEK": "Week 5",
      "ACTUAL_START_WEEK": "Week 1",
      "ACTUAL_END_WEEK": "Week 6",
      "INPUT_BY": "John Doe",
      "INPUT_DATE": "2026-05-20T10:30:00Z",
      "UPDATED_DATE": "2026-05-22T14:20:00Z"
    }
  ]
}
```

**PHASE field:** Any string value (Engineering, Procurement, Fabrication, Installation, Commissioning, etc.)

### POST /add
Add new phase schedule.

**Privilege:** `01987838-08c3-7772-9ed6-c473ae329470` (Project Add)

**Request Body:**
```json
{
  "projectId": "uuid",
  "departmentId": "uuid",
  "phase": "Engineering",
  "planStartWeek": "Week 1",
  "planEndWeek": "Week 5",
  "actualStartWeek": "Week 1",
  "actualEndWeek": null,
  "userId": "uuid"
}
```

**Constraints:** Unique `(project_id, department_id, phase)`

### POST /edit
Edit existing phase schedule.

**Privilege:** `01987839-d26e-7772-9ed6-ccd8de97ea37` (Project Edit)

### POST /delete-one
Delete phase schedule.

**Privilege:** `0198783a-0811-7772-9ed6-d47d8803e2d9` (Project Delete)

---

## Extensions (Dynamic Integration Builder)

Base path: `/extensions`

### Overview
Extensions allow users to create custom integrations with external APIs and build visual layouts using a drag-and-drop builder. Supports project-level and company-level extensions.

### Database Schema

**Table: `extensions`**
```sql
CREATE TABLE extensions (
  ID CHAR(36) PRIMARY KEY,
  COMPANY_ID CHAR(36) NOT NULL,
  NAME VARCHAR(255) NOT NULL,
  DESCRIPTION TEXT,
  ENABLED TINYINT(1) DEFAULT 1,
  ENDPOINT_URL VARCHAR(1000) NOT NULL,
  HTTP_METHOD ENUM('GET', 'POST') DEFAULT 'GET',
  AUTH_TYPE ENUM('none', 'bearer', 'api-key', 'basic') DEFAULT 'none',
  AUTH_CONFIG TEXT,
  REQUEST_HEADERS JSON,
  REQUEST_BODY_TEMPLATE TEXT,
  QUERY_PARAMS_CONFIG JSON,
  RESPONSE_PATH VARCHAR(255) DEFAULT '$',
  SCHEMA_MAPPING JSON,
  DISPLAY_TYPE ENUM('page', 'project-tab', 'dashboard-widget') DEFAULT 'page',
  DISPLAY_CONFIG JSON NOT NULL,
  REFRESH_INTERVAL INT DEFAULT NULL,
  LAST_SYNC DATETIME DEFAULT NULL,
  CREATED_BY CHAR(36) NOT NULL,
  CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company (COMPANY_ID),
  INDEX idx_enabled (ENABLED)
);
```

**Table: `extension_data`** (caching)
```sql
CREATE TABLE extension_data (
  ID CHAR(36) PRIMARY KEY,
  EXTENSION_ID CHAR(36) NOT NULL,
  PROJECT_ID CHAR(36) DEFAULT NULL,
  RAW_DATA JSON NOT NULL,
  TRANSFORMED_DATA JSON,
  FETCHED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_extension (EXTENSION_ID),
  INDEX idx_project (PROJECT_ID)
);
```

### Endpoints

#### POST /test-connection
Test API connection before creating extension.

**Auth:** Required (JWT header)

**Request Body:**
```json
{
  "url": "https://api.example.com/data/{projectId}",
  "authType": "bearer",
  "authToken": "token123",
  "httpMethod": "GET",
  "headers": {},
  "displayType": "tab",
  "sampleProjectId": "proj-uuid"
}
```

**Variable Replacement:** If `displayType=tab` and `sampleProjectId` provided:
- `{companyId}` → JWT user's company ID
- `{companyName}` → JWT user's company name
- `{projectId}` → sampleProjectId
- `{projectNo}` → PROJECT_NO from database
- `{projectName}` → PROJECT_NAME from database
- `{spk}` → SPK from database

**Response 200:**
```json
{
  "message": "Connection successful",
  "data": { /* raw API response */ }
}
```

**Response 400:** Project not found
**Response 403:** Blocked URL (localhost, private IPs)
**Response 408:** Request timeout (10s)

#### GET /:companyId
List all extensions for company.

**Response 200:**
```json
{
  "message": "Extensions retrieved successfully",
  "data": [
    {
      "ID": "ext-123",
      "NAME": "Material Tracker",
      "DESCRIPTION": "Track materials",
      "ENABLED": 1,
      "ENDPOINT_URL": "https://api.example.com/materials",
      "HTTP_METHOD": "GET",
      "AUTH_TYPE": "bearer",
      "REQUEST_HEADERS": {},
      "QUERY_PARAMS_CONFIG": {
        "page": "_page",
        "limit": "_limit",
        "search": "q"
      },
      "DISPLAY_TYPE": "project-tab",
      "DISPLAY_CONFIG": { "layout": [...] },
      "REFRESH_INTERVAL": 5,
      "LAST_SYNC": "2026-06-14T10:30:00Z"
    }
  ]
}
```

**Note:** `AUTH_CONFIG` never returned (encrypted credentials)

#### GET /:companyId/by-type/:displayType
Get extensions filtered by display type.

**Parameters:**
- `displayType`: `page`, `project-tab`, or `dashboard-widget`

**Response:** Same as list all, filtered by `DISPLAY_TYPE` and `ENABLED=1`, ordered by `NAME ASC`

#### GET /:companyId/:extensionId
Get single extension by ID.

**Response 200:**
```json
{
  "message": "Extension retrieved successfully",
  "data": { /* extension object */ }
}
```

**Response 404:** Extension not found

#### POST /:companyId
Create new extension.

**Privilege:** `01987838-08c3-7772-9ed6-c473ae329470` (Project Add)

**Request Body:**
```json
{
  "name": "Material Tracker",
  "description": "Track materials",
  "endpoint_url": "https://api.example.com/materials",
  "http_method": "GET",
  "auth_type": "bearer",
  "auth_config": {
    "token": "secret-token",
    "header": "X-Custom-Header"
  },
  "request_headers": {
    "Accept": "application/json"
  },
  "query_params_config": {
    "page": "_page",
    "limit": "_limit",
    "search": "q",
    "filter": "status"
  },
  "response_path": "$.data.materials",
  "schema_mapping": {},
  "display_type": "project-tab",
  "display_config": {
    "layout": [
      {
        "id": "table-1",
        "type": "table",
        "config": {
          "dataSource": "data.materials",
          "columns": [
            { "label": "Code", "field": "code" }
          ]
        }
      }
    ]
  },
  "refresh_interval": 5
}
```

**QUERY_PARAMS_CONFIG:** Maps frontend param names to external API param names
- Example: `{"page": "_page"}` → Frontend sends `?page=2`, backend calls API with `?_page=2`

**Response 201:**
```json
{
  "message": "Extension created successfully",
  "data": { /* created extension */ }
}
```

#### PUT /:companyId/:extensionId
Update existing extension.

**Privilege:** `01987839-d26e-7772-9ed6-ccd8de97ea37` (Project Edit)

**Request Body:** Same as create (all fields optional)

#### DELETE /:companyId/:extensionId
Delete extension.

**Privilege:** `0198783a-0811-7772-9ed6-d47d8803e2d9` (Project Delete)

**Response 200:**
```json
{
  "message": "Extension deleted successfully"
}
```

#### GET /:companyId/:extensionId/data
Fetch extension data (company-level).

**Query Parameters:**
- `refresh=true` (optional): Bypass cache
- `page`, `limit`, `search`, `filter` (optional): Passed to external API via QUERY_PARAMS_CONFIG mapping

**Response 200:**
```json
{
  "status": "success",
  "data": { /* external API response */ },
  "cached": false,
  "fetchedAt": "2026-06-14T10:30:00Z"
}
```

**Caching:**
- Default TTL: `REFRESH_INTERVAL` minutes (default 5)
- Cache key: `ext_data:{companyId}:{extensionId}:null`
- Skip cache: `?refresh=true`

#### GET /:companyId/:extensionId/data/:projectId
Fetch extension data (project-level).

**Query Parameters:** Same as company-level

**Variable Replacement:**
- `{companyId}` → companyId from path
- `{companyName}` → fetched from `company` table
- `{projectId}` → projectId from path
- `{projectNo}` → fetched from `company_projects` table
- `{projectName}` → fetched from `project_detail` table
- `{spk}` → fetched from `project_detail` table

**Query Parameter Mapping:**
Frontend sends `?page=2&limit=10&search=test`, backend:
1. Reads `QUERY_PARAMS_CONFIG` from database: `{"page": "_page", "limit": "_limit", "search": "q"}`
2. Maps parameters: `_page=2&_limit=10&q=test`
3. Appends to external URL: `https://api.example.com/materials?_page=2&_limit=10&q=test`

**Response 200:** Same as company-level
**Response 404:** Extension or project not found
**Response 502:** External API error
**Response 408:** Timeout

#### POST /:companyId/:extensionId/sync
Manual sync (reserved for future implementation).

### Security

**Credential Encryption:**
- `AUTH_CONFIG` encrypted using AES-256-CBC
- Encryption key: `ENCRYPTION_KEY` env var (64 hex chars = 32 bytes)
- Format: `iv:encrypted` (IV prepended to ciphertext)
- Decryption only on external API call, never returned to frontend

**SSRF Prevention:**
- Blocked IPs: `127.0.0.1`, `localhost`, `0.0.0.0`, `::1`
- Blocked ranges: `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`
- Timeout: 10 seconds
- User-Agent: Browser-like to avoid API blocking

**URL Encoding:**
- All variable replacements use `encodeURIComponent()`
- Prevents URL injection attacks

### Files
- **Model:** `src/models/extensions.js`
- **Service:** `src/services/extensions.ts`
- **Controller:** `src/controllers/extensions.js`
- **Routes:** `src/routes/extensions.js`
- **Utils:** `src/utils/crypto.js` (encryption/decryption)
- **Migrations:** `migrations/002_create_extensions_tables.sql`, `migrations/003_add_query_params_to_extensions.sql`

---

## SAP Dummy Integration

### Error Status Code Preservation
SAP dummy controller now preserves original HTTP status codes from SAP-Connect:
- Service layer attaches `error.response?.status` to thrown errors
- Controller extracts via `error?.status ?? error?.statusCode ?? 500`
- Returns original status (202, 502, etc.) instead of converting to 500

### Routing Logic
- **No identCode:** GET `/single/:projectNo` → `sapDummyServices.get.summary.projectNo()` (paginated)
- **With identCode:** GET `/single/:projectNo` → `sapDummyServices.get.by.projectNo()` (raw data, requires `?p=stage`)

### Response Format
Explicit fields in all responses:
```json
{
  "id": "item-id",
  "group": "group-name",
  "description": "item-description",
  ...
}
```

---

## TypeScript Compilation

### Service Layer Commits
23 TypeScript service files now include explicit `await CONNECTION.commit()` for standalone write operations:
- Pattern: Only when `!connection` (function owns the connection)
- Prevents breaking external transactions
- Files: `src/services/*.ts`

### Build Command
```bash
npm run build  # Compiles src/**/*.ts to src/**/*.js
```

---

## Environment Variables

### Required
- `OPEN_ROUTER_API_KEY`: OpenRouter API key (replaces `GEMINI_API_KEY`)
- `ENCRYPTION_KEY`: 64 hex characters (32 bytes for AES-256)
- `DB_PASSWORD`: Database password

### Optional
- `GEMINI_MODEL`: Model name (default: `google/gemini-2.5-flash`)
- `GEMINI_TIMEOUT_MS`: AI request timeout (default: 30000)

---

## Migrations

### Executed
1. `001_create_project_phase_schedule.sql` - Phase schedule table
2. `002_create_extensions_tables.sql` - Extensions and extension_data tables
3. `003_add_query_params_to_extensions.sql` - QUERY_PARAMS_CONFIG column
4. `004_add_period_config_to_project_detail.sql` - PERIOD_INTERVAL and PERIOD_TYPE columns

### Collation
All tables use `utf8mb4_general_ci` to match existing schema and prevent join errors.

---

## Known Issues & Solutions

### Issue: AI Service Missing Current Date Context
**Status:** ✅ Fixed
**Solution:** Added temporal context to prompts with current date, days remaining/overdue, progress vs time comparison

### Issue: Extension Test Connection 403 with auth_type=none
**Status:** ✅ Fixed
**Solution:** Only add auth headers when explicitly specified, use browser-like User-Agent

### Issue: Query Params Not Forwarded to External API
**Status:** ✅ Fixed
**Solution:** Added `QUERY_PARAMS_CONFIG` for param name mapping (frontend → external API)

### Issue: Encryption Key Invalid Length
**Status:** ✅ Fixed
**Solution:** Convert hex string to Buffer in `src/utils/crypto.js`

---

## Testing Checklist

### Phase Schedule
- [x] GET all schedules for project
- [x] POST add with duplicate validation
- [x] POST edit with all fields
- [x] POST delete single schedule

### Extensions
- [x] POST test-connection with none/bearer/api-key/basic auth
- [x] POST test-connection with project variables (displayType=tab)
- [x] GET list all extensions
- [x] GET by type (page/project-tab)
- [x] POST create with encrypted credentials
- [x] PUT update extension
- [x] DELETE extension
- [x] GET data with query param mapping
- [x] GET data with variable replacement
- [x] GET data with caching

### AI Integration
- [x] OpenRouter API connectivity
- [x] Temporal context in prompts
- [x] JSON schema validation
- [x] Timeout handling

### Period Auto-Generation
- [ ] POST /project/add with periodInterval & periodType
- [ ] Verify plans & actuals created correctly
- [ ] Test weekly, monthly, custom intervals
- [ ] Verify periods don't exceed due date
- [ ] Test without period config (backward compatibility)

---

## Next Steps for AI Agent

1. **Monitor Extension Usage:** Track external API call patterns and errors
2. **Implement Rate Limiting:** Per-company quotas for extension data fetches
3. **Add Schema Validation:** Validate external API responses against saved schemas
4. **Enhance Caching:** Implement Redis for distributed caching
5. **Add Webhooks:** Support external APIs pushing data to extensions
6. **Security Audit Fixes:** Address findings in `SECURITY_AUDIT.md`
7. **Extension Analytics:** Dashboard for API call metrics per extension
8. **Period Bulk Edit:** Allow users to edit multiple periods at once
9. **Period Templates:** Save period configurations as reusable templates

---

## Important Notes

- **Auth:** All endpoints use JWT from cookie (`auth_token`) or header (`Authorization: Bearer`)
- **Privileges:** Reuse existing project permissions for extensions (add/edit/delete)
- **Database:** MySQL with `utf8mb4_general_ci` collation
- **Error Handling:** Return appropriate HTTP status codes (400, 401, 403, 404, 408, 502, 500)
- **Logging:** Console.log sensitive data (tokens, passwords) only in development
- **CORS:** Backend acts as proxy for all external API calls
- **Period Generation:** Frontend sends `periodInterval` & `periodType`, backend auto-generates plans/actuals

---

**Last Updated:** 2026-06-14
**Version:** 1.3.0
