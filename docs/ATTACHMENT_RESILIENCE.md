# Attachment Deletion & Download Resilience

## 🎯 Problem Statement

Sebelumnya, server akan **crash** ketika:
- File attachment dihapus secara manual dari disk
- File tidak ditemukan saat proses download
- File tidak bisa dihapus karena permission error

## ✅ Solution Implemented

### Database-First Deletion Strategy
```
1. Query attachment info from database
2. Delete database record FIRST
3. Commit transaction
4. Try to delete physical file (with fallback)
5. Return success regardless of file operation result
```

### Key Benefits
- ✅ Server never crashes on missing files
- ✅ Database always stays clean (no orphaned records)
- ✅ Clear error messages for debugging
- ✅ Graceful degradation with warning messages
- ✅ Comprehensive logging for monitoring

---

## 🔧 Implementation Details

### DELETE Operation Flow

```javascript
// Before: ❌ Crash on missing file
fs.unlink(filePath, (err) => {
  if (err) {
    throw err; // Server crashes!
  }
});

// After: ✅ Graceful handling
fs.access(filePath, fs.constants.F_OK, (accessErr) => {
  if (accessErr) {
    // File doesn't exist - log warning but return success
    console.warn(`[DELETE ATTACHMENT] File not found: ${filePath}`);
    return res.status(200).json({
      message: "Attachment deleted successfully (file not found on disk)",
      warning: "Physical file was already missing"
    });
  }
  
  // File exists - proceed with deletion
  fs.unlink(filePath, (unlinkErr) => {
    if (unlinkErr) {
      // Deletion failed - log error but database is already clean
      console.error(`[DELETE ATTACHMENT] Failed to delete file: ${filePath}`);
      return res.status(200).json({
        message: "Attachment record deleted, but file deletion failed",
        warning: "Physical file could not be deleted"
      });
    }
    
    // Full success
    return res.status(200).json({
      message: "Attachment deleted successfully",
      data: []
    });
  });
});
```

### DOWNLOAD Operation Flow

```javascript
// Before: ❌ Crash on missing file
res.sendFile(filePath); // Throws error if file missing

// After: ✅ Graceful 404
fs.access(filePath, fs.constants.F_OK, (err) => {
  if (err) {
    console.error(`[DOWNLOAD ATTACHMENT] File not found: ${filePath}`);
    return res.status(404).json({
      message: "File not found on server",
      fileName: fileName
    });
  }
  
  res.sendFile(filePath, (sendErr) => {
    if (sendErr && !res.headersSent) {
      return res.status(500).json({
        message: "Failed to send file"
      });
    }
  });
});
```

---

## 📋 Response Examples

### Scenario 1: Normal Deletion (Success)
```json
HTTP 200
{
  "message": "Attachment deleted successfully",
  "data": []
}
```

### Scenario 2: File Missing on Disk
```json
HTTP 200
{
  "message": "Attachment deleted successfully (file not found on disk)",
  "data": [],
  "warning": "Physical file was already missing"
}
```

**Console Output:**
```
[DELETE ATTACHMENT] File not found on disk: /path/to/uploads/ppic/missing-file.pdf
[DELETE ATTACHMENT] Database record deleted successfully for rowId: 01234567-89ab-cdef-0123-456789abcdef
```

### Scenario 3: File Deletion Failed
```json
HTTP 200
{
  "message": "Attachment record deleted, but file deletion failed",
  "data": [],
  "warning": "Physical file could not be deleted"
}
```

**Console Output:**
```
[DELETE ATTACHMENT] Failed to delete file: /path/to/uploads/ppic/locked-file.pdf
Error: EACCES: permission denied, unlink '/path/to/uploads/ppic/locked-file.pdf'
```

### Scenario 4: Attachment Not Found
```json
HTTP 404
{
  "message": "Attachment not found in database",
  "data": []
}
```

### Scenario 5: Download File Not Found
```json
HTTP 404
{
  "message": "File not found on server",
  "fileName": "missing-document.pdf"
}
```

---

## 🧪 Testing

### Manual Test: File Missing Scenario

```bash
# 1. Set environment variables
export JWT_TOKEN="your-jwt-token"
export PROJECT_ID="your-project-uuid"
export USER_ID="your-user-uuid"

# 2. Upload attachment
curl -X POST http://localhost:3000/attachment/add \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@test.pdf" \
  -F "projectId=$PROJECT_ID" \
  -F "userId=$USER_ID" \
  -F "label=common" \
  -F "description=Test file"

# Response: { "data": [{ "attachmentId": "uuid" }] }

# 3. Manually delete physical file
rm uploads/ppic/{filename}

# 4. Delete attachment via API
curl -X POST http://localhost:3000/attachment/delete-one \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rowId": "attachment-uuid"}'

# Expected: HTTP 200 with warning (server does NOT crash)
```

### Automated Test Script

```bash
# Run all resilience tests
PROJECT_ID=uuid USER_ID=uuid JWT_TOKEN=token ./scripts/test-attachment-resilience.sh
```

**Tests Included:**
1. Normal deletion (file exists)
2. Deletion with missing file
3. Download missing file

---

## 🔍 Monitoring & Debugging

### Log Messages to Watch

#### Warning (Non-Critical)
```
[DELETE ATTACHMENT] File not found on disk: /path/to/file.pdf
[DELETE ATTACHMENT] Database record deleted successfully for rowId: uuid
```
**Action:** Acceptable if occasional. Investigate if frequent.

#### Error (Attention Required)
```
[DELETE ATTACHMENT] Failed to delete file: /path/to/file.pdf
Error: EACCES: permission denied
```
**Action:** Check file permissions and disk space.

#### Download Error
```
[DOWNLOAD ATTACHMENT] File not found: /path/to/file.pdf
```
**Action:** File may have been deleted manually. Check backup systems.

### Metrics to Track

1. **Deletion Success Rate:**
   - Full success (file + DB)
   - Partial success (DB only, file missing)
   - Failure rate

2. **Download 404 Rate:**
   - Track `GET /attachment/download/:id` 404 responses
   - Alert if > 1% of downloads fail

3. **File System Health:**
   - Compare database records vs actual files
   - Report orphaned files (in filesystem but not DB)

### Health Check Query

```sql
-- Find attachments with missing files
SELECT pa.ID, pa.FILE_NAME, pa.CREATED_AT
FROM project_attachment pa
WHERE pa.FILE_NAME NOT IN (
  -- List of actual files in filesystem
  -- This query needs to be joined with filesystem scan
);
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Permission Denied on File Deletion

**Symptoms:**
```
[DELETE ATTACHMENT] Failed to delete file: ...
Error: EACCES: permission denied
```

**Solution:**
```bash
# Check upload directory permissions
ls -la uploads/ppic/

# Fix permissions
chmod 755 uploads/ppic/
chown -R node:node uploads/ppic/
```

### Issue 2: Disk Full

**Symptoms:**
```
[DELETE ATTACHMENT] Failed to delete file: ...
Error: ENOSPC: no space left on device
```

**Solution:**
```bash
# Check disk space
df -h

# Clear old files if safe
find uploads/ppic/ -type f -mtime +365 -delete

# Consider archiving to S3/cloud storage
```

### Issue 3: Orphaned Files

**Definition:** Files exist on disk but not in database

**Detection:**
```bash
# List all files in upload directory
ls -1 uploads/ppic/ > /tmp/files_on_disk.txt

# Compare with database records
mysql -u user -p ppic_db -e "SELECT FILE_NAME FROM project_attachment" > /tmp/files_in_db.txt

# Find orphans
comm -23 <(sort /tmp/files_on_disk.txt) <(sort /tmp/files_in_db.txt)
```

**Solution:**
- Archive orphaned files
- Delete after verification period (e.g., 30 days)

---

## 📝 Best Practices

### 1. Always Use API for Deletion
❌ **Don't:**
```bash
# Manual file deletion without database cleanup
rm uploads/ppic/old-file.pdf
```

✅ **Do:**
```bash
# Use API endpoint (handles both DB and file)
curl -X POST /attachment/delete-one \
  -d '{"rowId": "uuid"}'
```

### 2. Monitor Warning Messages
- Set up log aggregation (ELK, Splunk, CloudWatch)
- Alert if > 5% of deletions have warnings
- Indicates potential backup/sync issues

### 3. Regular Health Checks
```bash
# Run weekly
# Compare database vs filesystem
# Report discrepancies
```

### 4. Backup Strategy
- Database backups: Daily
- File backups: Weekly to S3/cloud storage
- Retention: 90 days minimum

### 5. Test in Staging First
Before deployment:
```bash
# Run resilience test suite
./scripts/test-attachment-resilience.sh

# Verify all tests pass
# Check logs for warnings
```

---

## 🔄 Migration Impact

### Database Changes
✅ **No schema changes required**

### API Changes
✅ **Backward compatible:**
- Success responses unchanged
- New `warning` field added (optional)
- Frontend can ignore warnings

### Deployment Steps
1. Deploy new backend code
2. No database migration needed
3. Test with existing data
4. Monitor logs for warnings

---

## 📚 Related Files

### Implementation
- **Controller:** `src/controllers/attachment.js`
- **Service:** `src/services/attachment.ts`
- **Routes:** `src/routes/attachment.js`

### Documentation
- **API Docs:** `CLAUDE.md` → Attachment Endpoints
- **Test Plan:** `tests/attachment-resilience.test.md`
- **Test Script:** `scripts/test-attachment-resilience.sh`

### Configuration
- **Upload Path:** `uploads/ppic/`
- **Max File Size:** Configured in `src/middlewares/storage.js`

---

## ❓ FAQ

### Q: What happens if file deletion fails?
**A:** Database record is already deleted (clean state). File remains on disk but is orphaned. System logs error for cleanup later.

### Q: Will old clients break with this change?
**A:** No. Success responses are backward compatible. New `warning` field is optional and can be ignored.

### Q: Should I delete files manually from disk?
**A:** No. Always use the API. Manual deletion creates inconsistency and triggers warnings.

### Q: What if I need to bulk delete files?
**A:** Use API in loop or create batch delete endpoint. Never delete files directly from filesystem.

### Q: How do I recover from orphaned files?
**A:** Run filesystem scan, identify orphans, archive to backup, then delete after verification period.

---

## 📞 Support

For issues or questions:
1. Check console logs for specific error messages
2. Review this documentation
3. Run test script: `./scripts/test-attachment-resilience.sh`
4. Contact backend team if server still crashes

---

**Last Updated:** 2026-06-18  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
