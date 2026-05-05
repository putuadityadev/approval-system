# 📋 Phase 2 Checkpoint - Mall Approval System

**Date:** 5 Mei 2026  
**Sprint:** Sprint 1 - Database Foundation  
**Status:** ✅ COMPLETE

---

## 🎯 Sprint 1 Summary

Sprint 1 fokus pada pembuatan database schema dan models untuk Phase 2 (Request Management System). Semua table dan relationships sudah dibuat sesuai PRD dengan pattern yang sama seperti Phase 1.

---

## ✅ Completed Tasks

### 1. Database Migrations (6 Tables)

| Table | Purpose | Status |
|-------|---------|--------|
| `requests` | Master table untuk semua surat (SIK & SIKMB) | ✅ |
| `sikmb_details` | Detail surat SIKMB (barang masuk/keluar) | ✅ |
| `sikmb_items` | Daftar barang dalam SIKMB | ✅ |
| `sik_details` | Detail surat SIK (izin kerja) | ✅ |
| `approval_logs` | Audit trail approval (immutable) | ✅ |
| `request_evidences` | Foto evidence dari Security | ✅ |

**Migration Files:**
```
database/migrations/2026_05_05_114913_create_requests_table.php
database/migrations/2026_05_05_114945_create_sikmb_details_table.php
database/migrations/2026_05_05_115008_create_sikmb_items_table.php
database/migrations/2026_05_05_115025_create_sik_details_table.php
database/migrations/2026_05_05_115049_create_approval_logs_table.php
database/migrations/2026_05_05_115107_create_request_evidences_table.php
```

### 2. Eloquent Models (6 Models)

| Model | Relationships | Helper Methods | Status |
|-------|---------------|----------------|--------|
| `Request` | Vendor, SikmDetail, SikDetail, ApprovalLog, RequestEvidence | isPending(), isApproved(), canCancel(), getStatusLabel(), getTypeLabel() | ✅ |
| `SikmDetail` | Request, SikmItem | getTotalItems() | ✅ |
| `SikmItem` | SikmDetail | - | ✅ |
| `SikDetail` | Request | - | ✅ |
| `ApprovalLog` | Request, User (approver) | getActionLabel() | ✅ |
| `RequestEvidence` | Request, User (uploader) | getTypeLabel() | ✅ |

**Model Files:**
```
app/Models/Request.php
app/Models/SikmDetail.php
app/Models/SikmItem.php
app/Models/SikDetail.php
app/Models/ApprovalLog.php
app/Models/RequestEvidence.php
```

---

## 📊 Database Schema Overview

### Entity Relationships

```
vendors (Phase 1)
  ↓ 1:N
requests (master table)
  ↓ 1:1
  ├── sikmb_details (jika LOADING_IN/OUT)
  │     ↓ 1:N
  │   sikmb_items
  │
  └── sik_details (jika IJIN_KERJA)
  
requests
  ↓ 1:N
  ├── approval_logs (audit trail)
  └── request_evidences (foto Security)
```

### Status Flow

```
DRAFT
  ↓ vendor submit
SUBMITTED
  ↓ approver_dept approve
PENDING_DEPT
  ↓ approver_ops approve
PENDING_OPS
  ↓ approver_finance approve
PENDING_FINANCE
  ↓ approver_gm approve
PENDING_GM
  ↓ approver_gm approve
APPROVED (QR code generated)
  ↓ security scan & upload evidence
EXECUTED

Note: Setiap step bisa REJECTED atau CANCELLED
```

---

## 🧪 Testing Examples

### Test 1: Check Database Tables

```bash
# Via Docker
docker exec laravel_app php artisan db:show

# Expected output: Semua 6 tables Phase 2 ada
# - requests
# - sikmb_details
# - sikmb_items
# - sik_details
# - approval_logs
# - request_evidences
```

### Test 2: Test Model Relationships

```bash
docker exec laravel_app php artisan tinker
```

```php
// Test Request model
$vendor = \App\Models\Vendor::first();
$request = new \App\Models\Request([
    'vendor_id' => $vendor->id,
    'request_type' => 'LOADING_IN',
    'status' => 'DRAFT',
    'document_serial_no' => 'TEST001',
]);
$request->save();

// Test relationship
$request->vendor; // Should return Vendor object
$request->vendor->company_name; // Should return company name

// Test helper methods
$request->isPending(); // Should return false (status=DRAFT)
$request->canCancel(); // Should return false (status=DRAFT)
$request->getStatusLabel(); // Should return "Draft"
$request->getTypeLabel(); // Should return "Barang Masuk"

// Cleanup
$request->delete();
exit
```

### Test 3: Test SIKMB with Items

```php
// In tinker
$vendor = \App\Models\Vendor::first();

// Create request
$request = \App\Models\Request::create([
    'vendor_id' => $vendor->id,
    'request_type' => 'LOADING_IN',
    'status' => 'DRAFT',
    'document_serial_no' => 'TEST002',
]);

// Create SIKMB detail
$sikmb = \App\Models\SikmDetail::create([
    'request_id' => $request->id,
    'start_date' => '2026-05-10',
    'end_date' => '2026-05-10',
    'start_time' => '22:00',
    'end_time' => '05:00',
    'dest_address' => 'Jl. Test No. 1',
    'dest_phone' => '081234567890',
]);

// Create items
\App\Models\SikmItem::create([
    'sikmb_detail_id' => $sikmb->id,
    'item_name' => 'Meja Kayu',
    'quantity' => 5,
    'unit' => 'unit',
]);

\App\Models\SikmItem::create([
    'sikmb_detail_id' => $sikmb->id,
    'item_name' => 'Kursi Plastik',
    'quantity' => 20,
    'unit' => 'unit',
]);

// Test relationships
$request->sikmDetail; // Should return SikmDetail object
$request->sikmDetail->items; // Should return Collection of 2 items
$request->sikmDetail->getTotalItems(); // Should return 2

// Cleanup
$request->delete(); // Cascade delete sikmb_details & sikmb_items
exit
```

### Test 4: Test SIK Detail

```php
// In tinker
$vendor = \App\Models\Vendor::first();

// Create request
$request = \App\Models\Request::create([
    'vendor_id' => $vendor->id,
    'request_type' => 'IJIN_KERJA',
    'status' => 'DRAFT',
    'document_serial_no' => 'TEST003',
]);

// Create SIK detail
$sik = \App\Models\SikDetail::create([
    'request_id' => $request->id,
    'worker_count' => 5,
    'start_date' => '2026-05-10',
    'end_date' => '2026-05-12',
    'start_time' => '08:00',
    'end_time' => '17:00',
    'location' => 'Toilet Lt. GF',
    'job_type' => 'Instalasi Listrik',
    'description' => 'Hot Work Permit required',
]);

// Test relationship
$request->sikDetail; // Should return SikDetail object
$request->sikDetail->worker_count; // Should return 5

// Cleanup
$request->delete(); // Cascade delete sik_details
exit
```

### Test 5: Test Approval Log

```php
// In tinker
$vendor = \App\Models\Vendor::first();
$approver = \App\Models\User::where('role', 'approver_dept')->first();

// Create request
$request = \App\Models\Request::create([
    'vendor_id' => $vendor->id,
    'request_type' => 'LOADING_IN',
    'status' => 'PENDING_DEPT',
    'document_serial_no' => 'TEST004',
]);

// Create approval log
$log = \App\Models\ApprovalLog::create([
    'request_id' => $request->id,
    'approver_id' => $approver->id,
    'approver_role' => 'approver_dept',
    'action' => 'APPROVED',
    'from_status' => 'SUBMITTED',
    'to_status' => 'PENDING_DEPT',
    'notes' => 'Approved by Dept',
]);

// Test relationships
$request->approvalLogs; // Should return Collection of 1 log
$log->request; // Should return Request object
$log->approver; // Should return User object
$log->getActionLabel(); // Should return "Disetujui"

// Cleanup
$request->delete(); // Cascade delete approval_logs
exit
```

### Test 6: Test Request Evidence

```php
// In tinker
$vendor = \App\Models\Vendor::first();
$security = \App\Models\User::where('role', 'security')->first();

// Create request
$request = \App\Models\Request::create([
    'vendor_id' => $vendor->id,
    'request_type' => 'LOADING_IN',
    'status' => 'EXECUTED',
    'document_serial_no' => 'TEST005',
]);

// Create evidence
$evidence = \App\Models\RequestEvidence::create([
    'request_id' => $request->id,
    'uploaded_by' => $security->id,
    'evidence_type' => 'SECURITY_LOADING_IN',
    'image_url' => 'evidences/1/test.jpg',
    'notes' => 'Barang sesuai dengan surat',
]);

// Test relationships
$request->evidences; // Should return Collection of 1 evidence
$evidence->request; // Should return Request object
$evidence->uploader; // Should return User object (Security)
$evidence->getTypeLabel(); // Should return "Foto Barang Masuk"

// Cleanup
$request->delete(); // Cascade delete request_evidences
exit
```

### Test 7: Test Soft Delete

```php
// In tinker
$vendor = \App\Models\Vendor::first();

// Create request
$request = \App\Models\Request::create([
    'vendor_id' => $vendor->id,
    'request_type' => 'LOADING_IN',
    'status' => 'DRAFT',
    'document_serial_no' => 'TEST006',
]);

$requestId = $request->id;

// Soft delete
$request->delete();

// Check soft delete
\App\Models\Request::find($requestId); // Should return null
\App\Models\Request::withTrashed()->find($requestId); // Should return Request object
\App\Models\Request::onlyTrashed()->count(); // Should return 1

// Restore
$request = \App\Models\Request::withTrashed()->find($requestId);
$request->restore();

// Check restored
\App\Models\Request::find($requestId); // Should return Request object

// Force delete
$request->forceDelete();
\App\Models\Request::withTrashed()->find($requestId); // Should return null
exit
```

---

## 🔍 Model Features

### Request Model

**Fillable Fields:**
- vendor_id, request_type, status, sop_form_code, document_serial_no
- original_form_image, qr_code, cancelled_reason

**Relationships:**
- `vendor()` → Vendor
- `sikmDetail()` → SikmDetail (1:1)
- `sikDetail()` → SikDetail (1:1)
- `approvalLogs()` → ApprovalLog (1:N)
- `evidences()` → RequestEvidence (1:N)

**Scopes:**
- `byStatus($status)` → Filter by status
- `byType($type)` → Filter by request_type
- `byVendor($vendorId)` → Filter by vendor_id

**Helper Methods:**
- `isPending()` → Check if status PENDING_*
- `isApproved()` → Check if status APPROVED
- `canCancel()` → Check if vendor can cancel
- `getStatusLabel()` → Get status label (Bahasa Indonesia)
- `getTypeLabel()` → Get type label (Bahasa Indonesia)

**Soft Delete:** ✅ Enabled

---

### SikmDetail Model

**Fillable Fields:**
- request_id, origin_floor, origin_unit, start_date, end_date
- start_time, end_time, dest_address, dest_floor, dest_phone

**Relationships:**
- `request()` → Request
- `items()` → SikmItem (1:N)

**Helper Methods:**
- `getTotalItems()` → Get total items count

---

### SikmItem Model

**Fillable Fields:**
- sikmb_detail_id, item_name, quantity, unit, remarks

**Relationships:**
- `sikmDetail()` → SikmDetail

---

### SikDetail Model

**Fillable Fields:**
- request_id, worker_count, start_date, end_date, start_time, end_time
- location, job_type, description

**Relationships:**
- `request()` → Request

---

### ApprovalLog Model

**Fillable Fields:**
- request_id, approver_id, approver_role, action, from_status, to_status, notes, action_date

**Relationships:**
- `request()` → Request
- `approver()` → User

**Scopes:**
- `byRequest($requestId)` → Filter by request_id
- `byApprover($approverId)` → Filter by approver_id

**Helper Methods:**
- `getActionLabel()` → Get action label (Bahasa Indonesia)

**Immutable:** ✅ No updated_at column

---

### RequestEvidence Model

**Fillable Fields:**
- request_id, uploaded_by, evidence_type, image_url, notes, uploaded_at

**Relationships:**
- `request()` → Request
- `uploader()` → User (Security)

**Scopes:**
- `byRequest($requestId)` → Filter by request_id

**Helper Methods:**
- `getTypeLabel()` → Get evidence type label (Bahasa Indonesia)

**Immutable:** ✅ No updated_at column

---

## 📝 Coding Standards Applied

### ✅ Komentar Bahasa Indonesia
Semua komentar di migrations dan models menggunakan Bahasa Indonesia yang jelas dan mudah dipahami.

### ✅ DRY Principle
- Helper methods untuk label (getStatusLabel, getTypeLabel, getActionLabel)
- Scopes untuk query yang sering dipakai (byStatus, byType, byVendor)
- Relationships defined sekali, bisa dipakai berkali-kali

### ✅ Clean Code
- Nama method yang descriptive (isPending, canCancel, getTotalItems)
- Fillable fields explicitly defined
- Casts untuk type safety (date, datetime, integer)
- Soft delete untuk data preservation

### ✅ Pattern Consistency
- Sama seperti Phase 1 (User, Vendor, AuditLog models)
- Foreign key naming: {table}_id
- Relationship method naming: singular untuk belongsTo/hasOne, plural untuk hasMany
- Helper method naming: get{Something}Label untuk display labels

---

## 🎯 Next Steps (Sprint 2)

**Sprint 2: Request Submission (12 hours)**

1. **Backend:**
   - Create RequestService.php (business logic)
   - Create RequestController.php (HTTP handling)
   - Create Form Requests (validation)
   - Create routes untuk vendor

2. **Frontend:**
   - Create SIKMB submission form (multi-step)
   - Create SIK submission form
   - Create vendor requests list page
   - Create request detail page

3. **Testing:**
   - Test submit SIKMB dengan items
   - Test submit SIK
   - Test view own submissions
   - Test validation rules

---

## 📊 Progress Tracker

| Sprint | Status | Hours | Completion |
|--------|--------|-------|------------|
| Sprint 0: Infrastructure | ✅ | 4h | 100% |
| **Sprint 1: Database Foundation** | **✅** | **6h** | **100%** |
| Sprint 2: Request Submission | ⏳ | 12h | 0% |
| Sprint 3: Approval Workflow | ⏳ | 13h | 0% |
| Sprint 4: QR & Security | ⏳ | 11h | 0% |
| Sprint 5: Polish & Enhancement | ⏳ | 11.5h | 0% |

**Total Progress:** 10h / 57.5h (17%)

---

## 📁 Files Created/Modified

### Created (Migrations)
- `database/migrations/2026_05_05_114913_create_requests_table.php`
- `database/migrations/2026_05_05_114945_create_sikmb_details_table.php`
- `database/migrations/2026_05_05_115008_create_sikmb_items_table.php`
- `database/migrations/2026_05_05_115025_create_sik_details_table.php`
- `database/migrations/2026_05_05_115049_create_approval_logs_table.php`
- `database/migrations/2026_05_05_115107_create_request_evidences_table.php`

### Created (Models)
- `app/Models/Request.php`
- `app/Models/SikmDetail.php`
- `app/Models/SikmItem.php`
- `app/Models/SikDetail.php`
- `app/Models/ApprovalLog.php`
- `app/Models/RequestEvidence.php`

### Documentation
- `PHASE_2_CHECKPOINT.md` (this file)

---

## ✅ Sprint 1 Complete!

**Date Completed:** 5 Mei 2026  
**Status:** ✅ All tasks complete, tested, and documented  
**Ready for:** Sprint 2 - Request Submission

**Key Achievements:**
- ✅ 6 database tables created with proper relationships
- ✅ 6 Eloquent models with helper methods and scopes
- ✅ All migrations tested and working
- ✅ All relationships tested and working
- ✅ Comprehensive testing examples provided
- ✅ Clean code with DRY principles
- ✅ Komentar Bahasa Indonesia di semua files
- ✅ Pattern consistency dengan Phase 1

**Next:** Lanjut ke Sprint 2 untuk implement request submission feature! 🚀
