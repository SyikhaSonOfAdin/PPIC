# Task: Create Phase Schedule Feature - Complete Backend Implementation

## Context
You are working on a PPIC Dashboard system (FE v2) that needs a new feature to manage project phase schedules. This feature will track planned vs actual timeline for different project phases (Engineering, Procurement, Fabrication, Installation, Commissioning) across different departments.

## Database Schema

Create the following table in MySQL/MariaDB:

```sql
CREATE TABLE project_phase_schedule (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36) NOT NULL,
  department_id VARCHAR(36) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  plan_start_week VARCHAR(20) NOT NULL,
  plan_end_week VARCHAR(20) NOT NULL,
  actual_start_week VARCHAR(20) NULL,
  actual_end_week VARCHAR(20) NULL,
  input_by VARCHAR(36) NOT NULL,
  input_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Notes:**
- `phase`: Engineering, Procurement, Fabrication, Installation, Commissioning
- `plan_start_week` & `plan_end_week`: Format "Week 1", "Week 2", etc or "YYYY-MM" format
- `actual_start_week` & `actual_end_week`: NULL if not started/completed yet
- Add appropriate constraints and indexes

## API Endpoints to Create

### 1. GET - List All Phase Schedules for a Project
```
GET /api/project/phase-schedule/get/:projectId
```

**Response Format:**
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

**SQL Query should:**
- JOIN with departments table to get DEPARTMENT_NAME
- JOIN with users table to get INPUT_BY name
- ORDER BY department, phase order (Engineering → Procurement → Fabrication → Installation → Commissioning)

---

### 2. POST - Add New Phase Schedule
```
POST /api/project/phase-schedule/add
```

**Request Body:**
```json
{
  "projectId": "uuid",
  "departmentId": "uuid",
  "phase": "Engineering",
  "planStartWeek": "Week 1",
  "planEndWeek": "Week 5",
  "actualStartWeek": "Week 1",  // optional
  "actualEndWeek": null,         // optional
  "userId": "uuid"
}
```

**Response:**
```json
{
  "message": "Phase schedule added successfully",
  "data": { "id": "newly-created-uuid" }
}
```

**Validation:**
- All required fields must be present
- projectId must exist in projects table
- departmentId must exist in departments table
- userId must exist in users table
- phase must be one of: Engineering, Procurement, Fabrication, Installation, Commissioning
- planEndWeek should be after planStartWeek (optional validation)
- Prevent duplicate: same project_id + department_id + phase combination

---

### 3. POST - Edit Phase Schedule
```
POST /api/project/phase-schedule/edit
```

**Request Body:**
```json
{
  "rowId": "uuid",
  "projectId": "uuid",
  "departmentId": "uuid",
  "phase": "Engineering",
  "planStartWeek": "Week 1",
  "planEndWeek": "Week 6",
  "actualStartWeek": "Week 1",
  "actualEndWeek": "Week 7",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "message": "Phase schedule updated successfully",
  "data": { "id": "uuid" }
}
```

**Validation:**
- rowId must exist
- Same validations as add endpoint
- Update `updated_date` field automatically

---

### 4. POST - Delete Phase Schedule
```
POST /api/project/phase-schedule/delete-one
```

**Request Body:**
```json
{
  "rowId": "uuid"
}
```

**Response:**
```json
{
  "message": "Phase schedule deleted successfully",
  "data": { "id": "uuid" }
}
```

---

## Implementation Requirements

### Backend Structure
Follow the existing pattern in the codebase:

1. **Router file**: Create `/routes/phaseSchedule.js` or add to existing project routes
2. **Controller file**: Create `/controllers/phaseScheduleController.js`
3. **Database queries**: Use existing DB connection pattern
4. **Middleware**: Use existing authentication middleware

### Code Standards
- Use existing error handling pattern
- Follow existing naming conventions (camelCase for JS, UPPER_CASE for DB columns)
- Use parameterized queries to prevent SQL injection
- Return consistent response format: `{ message: string, data: any }`
- Log errors appropriately
- Use existing database pool/connection

### Security
- Verify user authentication via existing middleware
- Validate all inputs
- Sanitize data before DB operations
- Check user has permission to modify the project (based on company_id match)

### Error Handling
- 400: Bad request (missing/invalid fields)
- 401: Unauthorized
- 404: Not found (project/department/schedule not exists)
- 409: Conflict (duplicate phase for same department)
- 500: Server error

## Testing Checklist

After implementation, test:

- ✅ Create phase schedule with all fields
- ✅ Create phase schedule without actual dates (NULL)
- ✅ Get all schedules for a project
- ✅ Edit existing schedule
- ✅ Delete schedule
- ✅ Validation errors (missing fields, invalid phase, etc)
- ✅ Duplicate prevention (same project + department + phase)
- ✅ Foreign key constraints work
- ✅ Cascade delete when project is deleted

## Integration Notes

This API will be consumed by the frontend React app:
- Frontend will call these endpoints via `/src/lib/endpoints.ts`
- Data will be managed via React Query hooks in `/src/hooks/useApi.ts`
- UI components in `/src/pages/ProjectDetail/components/tabs/SCurveTab.tsx`

## Expected Deliverables

1. ✅ SQL migration file to create the table
2. ✅ Backend route definitions
3. ✅ Controller functions for all 4 endpoints
4. ✅ Input validation logic
5. ✅ Error handling
6. ✅ Basic testing (manual or automated)

---

## Example Response for GET endpoint

```json
{
  "message": "Success",
  "data": [
    {
      "ID": "abc-123",
      "PROJECT_ID": "proj-456",
      "DEPARTMENT_ID": "dept-789",
      "DEPARTMENT_NAME": "Civil Engineering",
      "PHASE": "Engineering",
      "PLAN_START_WEEK": "Week 1",
      "PLAN_END_WEEK": "Week 5",
      "ACTUAL_START_WEEK": "Week 1",
      "ACTUAL_END_WEEK": "Week 6",
      "INPUT_BY": "John Doe",
      "INPUT_DATE": "2026-05-20T10:30:00.000Z",
      "UPDATED_DATE": "2026-05-22T14:20:00.000Z"
    },
    {
      "ID": "def-456",
      "PROJECT_ID": "proj-456",
      "DEPARTMENT_ID": "dept-789",
      "PHASE": "Procurement",
      "PLAN_START_WEEK": "Week 4",
      "PLAN_END_WEEK": "Week 12",
      "ACTUAL_START_WEEK": null,
      "ACTUAL_END_WEEK": null,
      "INPUT_BY": "Jane Smith",
      "INPUT_DATE": "2026-05-20T10:35:00.000Z",
      "UPDATED_DATE": null
    }
  ]
}
```

---

**Start implementation now. Create all necessary files and code following the existing project structure.**
