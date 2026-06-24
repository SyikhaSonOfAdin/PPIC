# SAP API - Add Limit Parameter Support

## Problem
Endpoint `/sap-dummy/single/:projectNo` currently ignores `limit` query parameter, always returns fixed 15 rows per page.

## Required Changes

### Endpoint: `GET /sap-dummy/single/:projectNo`

**Current behavior:**
```javascript
const limit = 15; // Hardcoded
```

**Required behavior:**
```javascript
const limit = parseInt(req.query.limit) || 15; // Accept custom limit from query
const safeLimit = Math.min(limit, 10000); // Enforce max 10000
```

### Query Parameters (after fix)
- `page` - Page number (default: 1)
- `limit` - Rows per page (default: 15, max: 10000) **← NEW**
- `s` - Search term (optional)
- `group` - Group filter (optional)

### Implementation
```javascript
app.get('/sap-dummy/single/:projectNo', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const search = req.query.s || '';
  const group = req.query.group || '';
  
  const MAX_LIMIT = 10000;
  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const offset = (page - 1) * safeLimit;
  
  // Use safeLimit in SQL query
  const query = `SELECT * FROM sap_materials WHERE project_no = ? LIMIT ? OFFSET ?`;
  // ...
});
```

### Validation Rules
- `limit` must be integer between 1-10000
- `page` must be integer >= 1
- Invalid values fallback to defaults

### Test Cases
```bash
# Default (15 rows)
curl "https://sap.syikha.it.com/sap-dummy/single/P001?page=1"

# Custom limit (100 rows)
curl "https://sap.syikha.it.com/sap-dummy/single/P001?page=1&limit=100"

# Export all (max limit with filters)
curl "https://sap.syikha.it.com/sap-dummy/single/P001?page=1&limit=9999&s=steel&group=Material"

# Edge case: limit exceeds max (should return 10000)
curl "https://sap.syikha.it.com/sap-dummy/single/P001?page=1&limit=99999"
```

### Response Format (unchanged)
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1500,
    "totalPages": 15
  },
  "groups": ["Material", "Service"],
  "last_update": "2026-06-17 10:30:00"
}
```

### Frontend Usage (after fix)
```typescript
// Export all materials with current filters
const totalCount = data?.pagination?.total ?? 15;
const response = await endpoints.sap.summary(
  projectNo, 
  1, 
  search, 
  group, 
  totalCount // Backend will respect this limit
);
```

## Priority
**HIGH** - Blocks export functionality in Material tab

## Dependencies
None - standalone fix
