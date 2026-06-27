# Attachment Deletion Resilience Test

## Test Scenarios

### Scenario 1: Normal Deletion (File Exists)
**Setup:**
1. Upload a file via POST /attachment/add
2. Verify file exists in `uploads/ppic/`
3. Delete via POST /attachment/delete-one

**Expected:**
- Status: 200
- Message: "Attachment deleted successfully"
- No warning field
- Database record removed
- Physical file removed

---

### Scenario 2: File Missing on Disk
**Setup:**
1. Upload a file via POST /attachment/add
2. Manually delete physical file: `rm uploads/ppic/{filename}`
3. Database record still exists
4. Delete via POST /attachment/delete-one

**Expected:**
- Status: 200
- Message: "Attachment deleted successfully (file not found on disk)"
- Warning: "Physical file was already missing"
- Database record removed
- Console warning logged
- **Server does NOT crash**

---

### Scenario 3: File Deletion Permission Error
**Setup:**
1. Upload a file via POST /attachment/add
2. Change file permissions: `chmod 000 uploads/ppic/{filename}`
3. Delete via POST /attachment/delete-one

**Expected:**
- Status: 200
- Message: "Attachment record deleted, but file deletion failed"
- Warning: "Physical file could not be deleted"
- Database record removed
- Console error logged
- **Server does NOT crash**

---

### Scenario 4: Attachment Not in Database
**Setup:**
1. Generate random UUID
2. Delete via POST /attachment/delete-one with rowId = random UUID

**Expected:**
- Status: 404
- Message: "Attachment not found in database"
- No file operation attempted
- Transaction rolled back

---

### Scenario 5: Download Missing File
**Setup:**
1. Upload a file via POST /attachment/add
2. Get attachment ID
3. Manually delete physical file
4. Download via GET /attachment/download/:attachmentId

**Expected:**
- Status: 404
- Message: "File not found on server"
- Response includes fileName field
- Console error logged
- **Server does NOT crash**

---

### Scenario 6: Download Non-Existent Attachment
**Setup:**
1. Generate random UUID
2. Download via GET /attachment/download/:randomUUID

**Expected:**
- Status: 404
- Message: "Attachment not found in database"
- No file operation attempted

---

## Implementation Details

### Key Changes in `src/controllers/attachment.js`

#### Delete Operation Flow:
```javascript
1. Get file metadata from database
2. Check if record exists → 404 if not
3. Delete database record FIRST
4. Commit transaction
5. Check if file exists (fs.access)
   - Not found → Return 200 with warning
   - Found → Attempt deletion
     - Success → Return 200
     - Fail → Return 200 with warning (DB already clean)
```

#### Download Operation Flow:
```javascript
1. Get file metadata from database
2. Check if record exists → 404 if not
3. Check if file exists (fs.access)
   - Not found → Return 404 with filename
   - Found → Send file
     - Success → File downloaded
     - Fail → Return 500 if headers not sent
```

### Safety Mechanisms

1. **Database-First Strategy:**
   - Delete from DB before file operation
   - Prevents orphaned database records
   - File cleanup is secondary priority

2. **fs.access() Check:**
   - Non-blocking file existence check
   - Prevents fs.unlink() errors from crashing server
   - Provides clear error messages

3. **Transaction Management:**
   - Rollback on database errors
   - Commit before risky file operations
   - Connection always released in finally block

4. **Comprehensive Logging:**
   - Console warnings for missing files
   - Console errors for deletion failures
   - File paths logged for debugging

5. **Graceful Degradation:**
   - Success responses even when file missing
   - Warning field informs client of partial failure
   - Server remains stable

---

## Manual Testing Commands

### Test File Missing Scenario:
```bash
# 1. Upload file
curl -X POST http://localhost:3000/attachment/add \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  -F "projectId=PROJECT_UUID" \
  -F "userId=USER_UUID" \
  -F "label=common" \
  -F "description=Test file"

# 2. Delete physical file
rm uploads/ppic/{filename_from_response}

# 3. Delete attachment (should not crash)
curl -X POST http://localhost:3000/attachment/delete-one \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rowId": "ATTACHMENT_UUID"}'

# Expected: 200 with warning
```

### Test Download Missing File:
```bash
# 1. Upload file
# 2. Delete physical file
# 3. Download (should return 404)
curl -X GET http://localhost:3000/attachment/download/ATTACHMENT_UUID \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 with "File not found on server"
```

---

## Automated Test Suite (Future)

```javascript
// tests/attachment.resilience.spec.js
const fs = require('fs');
const path = require('path');

describe('Attachment Resilience', () => {
  it('should handle missing file on delete gracefully', async () => {
    // Upload → Delete file → Delete attachment
    // Expect 200 with warning
  });

  it('should handle missing file on download gracefully', async () => {
    // Upload → Delete file → Download
    // Expect 404
  });

  it('should rollback on database error', async () => {
    // Simulate DB error during delete
    // Verify no changes committed
  });
});
```

---

## Monitoring Recommendations

1. **Log Aggregation:**
   - Track frequency of "file not found" warnings
   - Alert if > 5% of deletions have missing files
   - Indicates potential disk/backup issues

2. **File System Health:**
   - Periodic scan of `uploads/ppic/` directory
   - Compare with database records
   - Report orphaned files (in filesystem but not DB)

3. **Metrics to Track:**
   - Total attachment deletions
   - Deletions with missing files
   - Download 404 errors
   - File system errors

---

**Test Date:** 2026-06-18  
**Status:** ✅ Implementation Complete  
**Next Steps:** Run manual tests in staging environment
