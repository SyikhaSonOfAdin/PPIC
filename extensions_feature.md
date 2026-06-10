# Extensions Feature - Backend Implementation Guide

## Overview
This document provides complete instructions for implementing the Extensions feature backend. The feature allows users to create custom integrations with external APIs and build visual layouts using a drag-and-drop builder.

---

## 1. Database Schema

### Table: `extensions`

```sql
CREATE TABLE extensions (
    ID VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    COMPANY_ID VARCHAR(36) NOT NULL,
    NAME VARCHAR(255) NOT NULL,
    DESCRIPTION TEXT,
    ENABLED TINYINT(1) DEFAULT 1,
    
    -- API Configuration
    ENDPOINT_URL VARCHAR(1000) NOT NULL,
    HTTP_METHOD ENUM('GET', 'POST') DEFAULT 'GET',
    AUTH_TYPE ENUM('none', 'bearer', 'api-key', 'basic') DEFAULT 'none',
    AUTH_CONFIG JSON, -- Encrypted credentials storage
    REQUEST_HEADERS JSON,
    REQUEST_BODY_TEMPLATE TEXT,
    
    -- Data Handling
    RESPONSE_PATH VARCHAR(255) DEFAULT '$',
    SCHEMA_MAPPING JSON,
    
    -- Display Configuration
    DISPLAY_TYPE ENUM('page', 'project-tab', 'dashboard-widget') DEFAULT 'page',
    DISPLAY_CONFIG JSON NOT NULL, -- Stores layout components
    
    -- Sync Settings
    REFRESH_INTERVAL INT DEFAULT NULL, -- in minutes
    LAST_SYNC DATETIME DEFAULT NULL,
    
    -- Metadata
    CREATED_BY VARCHAR(36) NOT NULL,
    CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (COMPANY_ID) REFERENCES company(ID) ON DELETE CASCADE,
    INDEX idx_company (COMPANY_ID),
    INDEX idx_enabled (ENABLED)
);
```

### Table: `extension_data` (Optional - for caching)

```sql
CREATE TABLE extension_data (
    ID VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    EXTENSION_ID VARCHAR(36) NOT NULL,
    PROJECT_ID VARCHAR(36) DEFAULT NULL,
    RAW_DATA JSON NOT NULL,
    TRANSFORMED_DATA JSON,
    FETCHED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (EXTENSION_ID) REFERENCES extensions(ID) ON DELETE CASCADE,
    FOREIGN KEY (PROJECT_ID) REFERENCES project(ID) ON DELETE CASCADE,
    INDEX idx_extension (EXTENSION_ID),
    INDEX idx_project (PROJECT_ID)
);
```

---

## 2. API Endpoints

### Base Path: `/api/extensions`

### 2.1 List Extensions
```
GET /api/extensions/:companyId
```

**Response:**
```json
{
  "message": "Extensions retrieved successfully",
  "data": [
    {
      "ID": "ext-001",
      "COMPANY_ID": "comp-001",
      "NAME": "SAP Material Tracker",
      "DESCRIPTION": "Track materials from SAP",
      "ENABLED": 1,
      "ENDPOINT_URL": "https://api.sap.com/materials",
      "HTTP_METHOD": "GET",
      "AUTH_TYPE": "bearer",
      "DISPLAY_TYPE": "project-tab",
      "DISPLAY_CONFIG": {
        "layout": [...]
      },
      "REFRESH_INTERVAL": 30,
      "LAST_SYNC": "2024-01-15T10:30:00Z",
      "CREATED_BY": "user-001",
      "CREATED_AT": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2.2 Get Single Extension
```
GET /api/extensions/:companyId/:extensionId
```

**Response:**
```json
{
  "message": "Extension retrieved successfully",
  "data": {
    "ID": "ext-001",
    "NAME": "SAP Material Tracker",
    // ... full extension object
  }
}
```

### 2.3 Test API Connection (Fetch Sample Data)
```
POST /api/extensions/test-connection
```

**Request Body:**
```json
{
  "url": "https://api.example.com/data",
  "authType": "bearer",
  "authToken": "your-token-here",
  "httpMethod": "GET",
  "headers": {
    "Custom-Header": "value"
  }
}
```

**Response:**
```json
{
  "message": "Connection successful",
  "data": {
    "materials": [
      {
        "code": "M001",
        "name": "Steel Plate",
        "qty": 500,
        "price": 45000
      }
    ]
  },
  "schema": {
    "type": "object",
    "properties": {
      "materials": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "code": { "type": "string" },
            "name": { "type": "string" },
            "qty": { "type": "number" },
            "price": { "type": "number" }
          }
        }
      }
    }
  }
}
```

### 2.4 Create Extension
```
POST /api/extensions/:companyId
```

**Request Body:**
```json
{
  "name": "Material Tracker",
  "description": "Track material inventory",
  "endpointUrl": "https://api.example.com/materials",
  "httpMethod": "GET",
  "authType": "bearer",
  "authConfig": {
    "token": "encrypted-token-here"
  },
  "requestHeaders": {
    "Content-Type": "application/json"
  },
  "responsePath": "$.data.materials",
  "displayType": "project-tab",
  "displayConfig": {
    "layout": [
      {
        "id": "table-1",
        "type": "table",
        "config": {
          "columns": [
            {
              "label": "Code",
              "field": "code",
              "width": 100
            }
          ]
        }
      }
    ]
  },
  "refreshInterval": 30
}
```

**Response:**
```json
{
  "message": "Extension created successfully",
  "data": {
    "ID": "ext-new-001",
    // ... full extension object
  }
}
```

### 2.5 Update Extension
```
PUT /api/extensions/:companyId/:extensionId
```

**Request Body:** (Same as Create, all fields optional)

**Response:**
```json
{
  "message": "Extension updated successfully",
  "data": {
    "ID": "ext-001",
    // ... updated extension object
  }
}
```

### 2.6 Delete Extension
```
DELETE /api/extensions/:companyId/:extensionId
```

**Response:**
```json
{
  "message": "Extension deleted successfully"
}
```

### 2.7 Fetch Extension Data (Runtime)
```
GET /api/extensions/:companyId/:extensionId/data
GET /api/extensions/:companyId/:extensionId/data/:projectId (for project-specific data)
```

**Query Parameters:**
- `refresh=true` - Force refresh from external API
- `page=1` - Pagination
- `limit=50` - Items per page

**Response:**
```json
{
  "message": "Data fetched successfully",
  "data": {
    "materials": [
      {
        "code": "M001",
        "name": "Steel Plate",
        "qty": 500,
        "price": 45000
      }
    ]
  },
  "cached": false,
  "fetchedAt": "2024-01-15T10:30:00Z"
}
```

### 2.8 Manual Sync
```
POST /api/extensions/:companyId/:extensionId/sync
```

**Response:**
```json
{
  "message": "Sync initiated successfully",
  "data": {
    "syncId": "sync-001",
    "status": "processing"
  }
}
```

---

## 3. Implementation Details

### 3.1 Authentication Handling

**Security Requirements:**
1. **Never store credentials in plain text**
2. Use encryption for `AUTH_CONFIG` JSON field
3. Decrypt only when making external API calls
4. Never return decrypted credentials to frontend

**Encryption Example (PHP/Laravel):**
```php
use Illuminate\Support\Facades\Crypt;

// Storing
$authConfig = [
    'token' => $request->authToken,
    'username' => $request->authUsername,
    'password' => $request->authPassword
];
$encrypted = Crypt::encryptString(json_encode($authConfig));

// Retrieving
$authConfig = json_decode(Crypt::decryptString($extension->AUTH_CONFIG), true);
```

**Encryption Example (Node.js):**
```javascript
const crypto = require('crypto');

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
```

### 3.2 External API Calling

**Test Connection Endpoint Logic:**
```javascript
async function testConnection(req, res) {
    const { url, authType, authToken, authUsername, authPassword, authApiKey, authHeader, httpMethod, headers } = req.body;
    
    try {
        // Build headers
        const requestHeaders = { ...headers };
        
        if (authType === 'bearer' && authToken) {
            requestHeaders['Authorization'] = `Bearer ${authToken}`;
        } else if (authType === 'api-key' && authApiKey) {
            requestHeaders[authHeader || 'X-API-Key'] = authApiKey;
        } else if (authType === 'basic' && authUsername && authPassword) {
            const encoded = Buffer.from(`${authUsername}:${authPassword}`).toString('base64');
            requestHeaders['Authorization'] = `Basic ${encoded}`;
        }
        
        // Make request with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(url, {
            method: httpMethod || 'GET',
            headers: requestHeaders,
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
            return res.status(response.status).json({
                message: `External API error: ${response.statusText}`,
                error: true
            });
        }
        
        const data = await response.json();
        
        // Auto-detect schema (optional)
        const schema = inferSchema(data);
        
        return res.json({
            message: 'Connection successful',
            data,
            schema
        });
        
    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(408).json({ message: 'Request timeout', error: true });
        }
        
        return res.status(500).json({
            message: error.message,
            error: true
        });
    }
}
```

### 3.3 Schema Inference (Optional)

```javascript
function inferSchema(data, depth = 0) {
    if (depth > 5) return { type: 'unknown' };
    
    if (data === null) return { type: 'null' };
    if (Array.isArray(data)) {
        return {
            type: 'array',
            items: data.length > 0 ? inferSchema(data[0], depth + 1) : { type: 'unknown' }
        };
    }
    if (typeof data === 'object') {
        const properties = {};
        Object.keys(data).forEach(key => {
            properties[key] = inferSchema(data[key], depth + 1);
        });
        return { type: 'object', properties };
    }
    
    return { type: typeof data };
}
```

### 3.4 Data Caching Strategy

**When to Cache:**
- Cache data after successful fetch
- Set TTL based on `REFRESH_INTERVAL`
- Clear cache on manual sync

**Cache Flow:**
```javascript
async function getExtensionData(extensionId, projectId = null, forceRefresh = false) {
    // Check cache first
    if (!forceRefresh) {
        const cached = await getCachedData(extensionId, projectId);
        if (cached && isCacheFresh(cached, extension.REFRESH_INTERVAL)) {
            return {
                data: cached.TRANSFORMED_DATA || cached.RAW_DATA,
                cached: true,
                fetchedAt: cached.FETCHED_AT
            };
        }
    }
    
    // Fetch from external API
    const freshData = await fetchExternalData(extension, projectId);
    
    // Store in cache
    await storeCachedData(extensionId, projectId, freshData);
    
    return {
        data: freshData,
        cached: false,
        fetchedAt: new Date()
    };
}
```

---

## 4. Error Handling

### 4.1 Error Codes

| HTTP Code | Scenario | Response |
|-----------|----------|----------|
| 400 | Invalid request body | `{ "message": "Invalid input", "errors": [...] }` |
| 401 | User not authenticated | `{ "message": "Unauthorized" }` |
| 403 | User lacks permission | `{ "message": "Access forbidden" }` |
| 404 | Extension not found | `{ "message": "Extension not found" }` |
| 408 | External API timeout | `{ "message": "Request timeout" }` |
| 500 | Server error | `{ "message": "Internal server error" }` |
| 502 | External API error | `{ "message": "External API error: ..." }` |

### 4.2 Validation

**Create/Update Extension:**
```javascript
const extensionSchema = {
    name: { type: 'string', required: true, maxLength: 255 },
    endpointUrl: { type: 'string', required: true, pattern: /^https?:\/\/.+/ },
    authType: { type: 'string', enum: ['none', 'bearer', 'api-key', 'basic'] },
    displayType: { type: 'string', enum: ['page', 'project-tab', 'dashboard-widget'] },
    displayConfig: { type: 'object', required: true },
    refreshInterval: { type: 'number', min: 1, max: 1440 } // max 1 day
};
```

---

## 5. Security Considerations

### 5.1 Input Validation
- ✅ Validate all URLs (whitelist schemes: http, https)
- ✅ Sanitize headers (prevent header injection)
- ✅ Limit request body size (max 1MB)
- ✅ Rate limiting per company (max 100 requests/minute)

### 5.2 CORS & SSRF Protection
- ✅ Backend acts as proxy (frontend never calls external API directly)
- ✅ Blacklist internal IPs (localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x)
- ✅ Follow redirects carefully (max 3 redirects)
- ✅ Timeout all external requests (10 seconds)

### 5.3 Authentication
- ✅ Verify user belongs to company
- ✅ Check user role (only admins can create/delete extensions)
- ✅ Audit log all extension changes

---

## 6. Testing Checklist

### 6.1 Unit Tests
- [ ] Encryption/decryption of credentials
- [ ] Schema inference
- [ ] Data caching logic
- [ ] Header building for different auth types

### 6.2 Integration Tests
- [ ] Create extension
- [ ] Test connection with various auth types
- [ ] Fetch data from external API
- [ ] Update extension config
- [ ] Delete extension and verify cascade

### 6.3 Security Tests
- [ ] SSRF prevention (attempt to call localhost)
- [ ] SQL injection in extension name/description
- [ ] XSS in display config
- [ ] Rate limiting enforcement

---

## 7. Example Implementation (Node.js/Express)

### 7.1 Routes
```javascript
// routes/extensions.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const extensionController = require('../controllers/extensionController');

router.use(authenticate); // All routes require auth

router.get('/:companyId', extensionController.list);
router.get('/:companyId/:extensionId', extensionController.getOne);
router.post('/test-connection', extensionController.testConnection);
router.post('/:companyId', authorize('admin'), extensionController.create);
router.put('/:companyId/:extensionId', authorize('admin'), extensionController.update);
router.delete('/:companyId/:extensionId', authorize('admin'), extensionController.delete);
router.get('/:companyId/:extensionId/data', extensionController.fetchData);
router.get('/:companyId/:extensionId/data/:projectId', extensionController.fetchData);
router.post('/:companyId/:extensionId/sync', extensionController.sync);

module.exports = router;
```

### 7.2 Controller Example
```javascript
// controllers/extensionController.js
const db = require('../config/database');
const crypto = require('../utils/crypto');
const fetch = require('node-fetch');

exports.testConnection = async (req, res) => {
    // Implementation from section 3.2
};

exports.create = async (req, res) => {
    try {
        const { companyId } = req.params;
        const {
            name,
            description,
            endpointUrl,
            httpMethod,
            authType,
            authConfig,
            requestHeaders,
            displayType,
            displayConfig,
            refreshInterval
        } = req.body;
        
        // Validate
        if (!name || !endpointUrl || !displayConfig) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Encrypt auth config
        const encryptedAuth = crypto.encrypt(JSON.stringify(authConfig));
        
        const [result] = await db.query(
            `INSERT INTO extensions (
                COMPANY_ID, NAME, DESCRIPTION, ENDPOINT_URL, HTTP_METHOD,
                AUTH_TYPE, AUTH_CONFIG, REQUEST_HEADERS, DISPLAY_TYPE,
                DISPLAY_CONFIG, REFRESH_INTERVAL, CREATED_BY
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                companyId, name, description, endpointUrl, httpMethod || 'GET',
                authType, encryptedAuth, JSON.stringify(requestHeaders || {}),
                displayType, JSON.stringify(displayConfig), refreshInterval,
                req.user.id
            ]
        );
        
        const extension = await getExtensionById(result.insertId);
        
        res.status(201).json({
            message: 'Extension created successfully',
            data: extension
        });
        
    } catch (error) {
        console.error('Create extension error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.fetchData = async (req, res) => {
    try {
        const { companyId, extensionId, projectId } = req.params;
        const { refresh } = req.query;
        
        const extension = await getExtensionById(extensionId);
        if (!extension || extension.COMPANY_ID !== companyId) {
            return res.status(404).json({ message: 'Extension not found' });
        }
        
        const data = await getExtensionData(
            extension,
            projectId,
            refresh === 'true'
        );
        
        res.json({
            message: 'Data fetched successfully',
            ...data
        });
        
    } catch (error) {
        console.error('Fetch data error:', error);
        res.status(500).json({ message: error.message });
    }
};
```

---

## 8. Migration Script

```sql
-- Run this to create tables
-- migrations/create_extensions_tables.sql

CREATE TABLE IF NOT EXISTS extensions (
    ID VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    COMPANY_ID VARCHAR(36) NOT NULL,
    NAME VARCHAR(255) NOT NULL,
    DESCRIPTION TEXT,
    ENABLED TINYINT(1) DEFAULT 1,
    ENDPOINT_URL VARCHAR(1000) NOT NULL,
    HTTP_METHOD ENUM('GET', 'POST') DEFAULT 'GET',
    AUTH_TYPE ENUM('none', 'bearer', 'api-key', 'basic') DEFAULT 'none',
    AUTH_CONFIG JSON,
    REQUEST_HEADERS JSON,
    REQUEST_BODY_TEMPLATE TEXT,
    RESPONSE_PATH VARCHAR(255) DEFAULT '$',
    SCHEMA_MAPPING JSON,
    DISPLAY_TYPE ENUM('page', 'project-tab', 'dashboard-widget') DEFAULT 'page',
    DISPLAY_CONFIG JSON NOT NULL,
    REFRESH_INTERVAL INT DEFAULT NULL,
    LAST_SYNC DATETIME DEFAULT NULL,
    CREATED_BY VARCHAR(36) NOT NULL,
    CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (COMPANY_ID) REFERENCES company(ID) ON DELETE CASCADE,
    INDEX idx_company (COMPANY_ID),
    INDEX idx_enabled (ENABLED)
);

CREATE TABLE IF NOT EXISTS extension_data (
    ID VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    EXTENSION_ID VARCHAR(36) NOT NULL,
    PROJECT_ID VARCHAR(36) DEFAULT NULL,
    RAW_DATA JSON NOT NULL,
    TRANSFORMED_DATA JSON,
    FETCHED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EXTENSION_ID) REFERENCES extensions(ID) ON DELETE CASCADE,
    INDEX idx_extension (EXTENSION_ID),
    INDEX idx_project (PROJECT_ID)
);
```

---

## 9. Summary for AI Backend Agent

**What to implement:**
1. Create two database tables: `extensions` and `extension_data`
2. Implement 8 API endpoints under `/api/extensions`
3. Add credential encryption/decryption utilities
4. Create external API proxy with security checks
5. Implement caching layer with TTL
6. Add proper error handling and validation
7. Write unit and integration tests

**Key priorities:**
- **Security first**: Encrypt credentials, prevent SSRF, validate all inputs
- **Error handling**: Return clear error messages with appropriate HTTP codes
- **Performance**: Cache external API responses, implement timeouts
- **Flexibility**: Support multiple auth types and HTTP methods

**Test with:**
- Postman collection for all endpoints
- Sample external APIs (JSONPlaceholder, public APIs)
- Different authentication types
- Edge cases (timeout, invalid URLs, malformed JSON)
