# PPIC Dashboard Backend — API Documentation

## Phase Schedule Endpoints

Base path: `/project/phase-schedule`

### GET /get/:projectId

Get all phase schedules for a project.

**Auth:** Required (JWT cookie)

**Parameters:**
- `projectId` (path, required): Project UUID

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

**PHASE field:**
- Can be any string value
- Common values: Engineering, Procurement, Fabrication, Installation, Commissioning

**Ordering:**
- By department name (alphabetical)
- By phase order (Engineering → Commissioning)

---

### POST /add

Add new phase schedule.

**Auth:** Required (JWT cookie)

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

**Required fields:**
- `projectId`, `departmentId`, `phase`, `planStartWeek`, `planEndWeek`, `userId`

**Optional fields:**
- `actualStartWeek`, `actualEndWeek` (null if not started/completed)

**Response 200:**
```json
{
  "message": "Phase schedule added successfully",
  "data": { "id": "newly-created-uuid" }
}
```

**Response 400:**
```json
{
  "message": "Invalid Parameter"
}
```
OR
**Response 409:
```json
{
  "message": "Duplicate phase schedule for this department"
}
```

**Constraints:**
- Unique combination: `(project_id, department_id, phase)`

---

### POST /edit

Edit existing phase schedule.

**Auth:** Required (JWT cookie)

**Privilege:** `01987839-d26e-7772-9ed6-ccd8de97ea37` (Project Edit)

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

**Required fields:**
- All fields required (same as add, plus `rowId`)

**Response 200:**
```json
{
  "message": "Phase schedule updated successfully",
  "data": { "id": "uuid" }
}
```

**Response 400/409:** Same as add endpoint

**Notes:**
- Updates `updated_date` automatically (ON UPDATE CURRENT_TIMESTAMP)

---

### POST /delete-one

Delete phase schedule.

**Auth:** Required (JWT cookie)

**Privilege:** `0198783a-0811-7772-9ed6-d47d8803e2d9` (Project Delete)

**Request Body:**
```json
{
  "rowId": "uuid"
}
```

**Response 200:**
```json
{
  "message": "Phase schedule deleted successfully",
  "data": { "id": "uuid" }
}
```

**Response 400:**
```json
{
  "message": "Invalid Parameter"
}
```

---

## Database Schema

```sql
CREATE TABLE project_phase_schedule (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  department_id VARCHAR(255) NOT NULL,
  phase VARCHAR(50) NOT NULL,
  plan_start_week VARCHAR(20) NOT NULL,
  plan_end_week VARCHAR(20) NOT NULL,
  actual_start_week VARCHAR(20) NULL,
  actual_end_week VARCHAR(20) NULL,
  input_by CHAR(36) NOT NULL,
  input_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_project_dept_phase (project_id, department_id, phase),
  INDEX idx_project_id (project_id),
  INDEX idx_department_id (department_id),
  INDEX idx_input_by (input_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Relationships:**
- `project_id` → `company_projects.ID` (CASCADE on delete)
- `department_id` → `department.ID` (CASCADE on delete)
- `input_by` → `users.ID` (RESTRICT on delete)

Note: Foreign keys not enforced in current schema (MySQL limitation), but indexes exist for performance.

---

## Implementation Files

- **Model:** `src/models/phaseSchedule.js`
- **Service:** `src/services/phaseSchedule.ts` (compiled to `.js`)
- **Controller:** `src/controllers/phaseSchedule.js`
- **Routes:** `src/routes/phaseSchedule.js`
- **Migration:** `migrations/001_create_project_phase_schedule.sql`

---

## Testing

```bash
# Get all schedules
curl http://localhost:3000/project/phase-schedule/get/{projectId} \
  -H "Cookie: auth_token={jwt}"

# Add schedule
curl -X POST http://localhost:3000/project/phase-schedule/add \
  -H "Cookie: auth_token={jwt}" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "uuid",
    "departmentId": "uuid",
    "phase": "Engineering",
    "planStartWeek": "Week 1",
    "planEndWeek": "Week 5",
    "actualStartWeek": null,
    "actualEndWeek": null,
    "userId": "uuid"
  }'

# Edit schedule
curl -X POST http://localhost:3000/project/phase-schedule/edit \
  -H "Cookie: auth_token={jwt}" \
  -H "Content-Type: application/json" \
  -d '{
    "rowId": "uuid",
    "projectId": "uuid",
    "departmentId": "uuid",
    "phase": "Engineering",
    "planStartWeek": "Week 1",
    "planEndWeek": "Week 6",
    "actualStartWeek": "Week 1",
    "actualEndWeek": "Week 7",
    "userId": "uuid"
  }'

# Delete schedule
curl -X POST http://localhost:3000/project/phase-schedule/delete-one \
  -H "Cookie: auth_token={jwt}" \
  -H "Content-Type: application/json" \
  -d '{ "rowId": "uuid" }'
```
