# 📊 TRACKER PROGRESS - Mall Approval System

**Last Updated:** 10 Mei 2026  
**Current Phase:** Phase 2 - Sprint 4 Complete, Ready for Sprint 5

---

## 📋 QUICK SUMMARY

| Phase | Status | Progress | Estimated Hours | Actual Hours |
|-------|--------|----------|-----------------|--------------|
| **Phase 1: Auth & User Management** | ✅ Complete | 100% | 20h | ~20h |
| **Phase 2: Request Management** | ⏳ In Progress | 98% | 66h | 64.5h |
| **Phase 3: Advanced Features** | ⏳ Planned | 0% | TBD | 0h |

---

## 🎯 PHASE 1: Authentication & User Management

### Status: ✅ 100% COMPLETE

| Module | PRD Requirement | Current Status | Progress | Notes |
|--------|----------------|----------------|----------|-------|
| **Database** | 7 roles + audit trail | ✅ Complete | 100% | Migration, seeders, all tables ready + UUID migration |
| **Models** | User, Vendor, AuditLog | ✅ Complete | 100% | With helper methods & relationships + HasUuids trait |
| **Services** | Auth, Audit, Password Reset | ✅ Complete | 100% | **+ Error handling & logging added** |
| **Controllers** | Auth, Admin User CRUD | ✅ Complete | 100% | **+ Error handling & logging added** |
| **Middleware** | Role check, Active status | ✅ Complete | 100% | CheckRole with trim fix |
| **Routes** | All 7 roles routing | ✅ Complete | 100% | Guest, Admin, Vendor, Approver, Security |
| **Frontend** | Login, Register, Dashboards | ✅ Complete | 100% | All placeholder dashboards ready |
| **Testing** | Manual testing done | ✅ Complete | 100% | All roles tested & working |
| **Error Handling** | Comprehensive logging | ✅ Complete | 100% | All services & controllers covered |
| **UUID Migration** | All IDs use UUID | ✅ Complete | 100% | Security best practice for QR codes |

### ✅ Completed Features

1. **7 Roles System**
   - super_admin, vendor, approver_dept, approver_ops, approver_finance, approver_gm, security
   - Role-based access control dengan middleware
   - Automatic redirect ke dashboard sesuai role

2. **User Management (Super Admin)**
   - Create user dengan role apapun
   - Update user (email, password, role, status)
   - Deactivate/Activate user
   - View all users dengan pagination

3. **Vendor Self-Registration**
   - Form registrasi dengan data perusahaan
   - Auto-login setelah registrasi
   - Data vendor tersimpan di table vendors

4. **Authentication**
   - Login untuk semua role
   - Logout dengan session cleanup
   - Password reset via email
   - Remember me functionality

5. **Audit Trail**
   - Log semua aktivitas user
   - Immutable audit logs
   - IP address & user agent tracking

6. **Error Handling & Logging**
   - Try-catch di semua Service methods
   - Try-catch di semua Controller methods
   - Comprehensive logging dengan key naming convention
   - User-friendly error messages

7. **UUID Migration** ⭐ NEW
   - All primary keys use UUID (security best practice)
   - Sessions table support UUID user_id
   - All foreign keys updated to UUID
   - Consistent UUID usage across all tables

### 📁 Key Files (Phase 1)

**Backend:**
- `database/migrations/2026_05_01_000001_create_new_auth_system.php`
- `database/seeders/SuperAdminSeeder.php`
- `database/seeders/ApproverSeeder.php`
- `database/seeders/SecuritySeeder.php`
- `app/Models/User.php`
- `app/Models/Vendor.php`
- `app/Models/AuditLog.php`
- `app/Services/Auth/AuthService.php`
- `app/Services/Auth/AuditLogService.php`
- `app/Services/Auth/PasswordResetService.php`
- `app/Http/Controllers/Auth/AuthController.php`
- `app/Http/Controllers/Admin/UserController.php`
- `app/Http/Middleware/CheckRole.php`
- `app/Http/Middleware/EnsureActive.php`

**Frontend:**
- `resources/js/Pages/Auth/Login.jsx`
- `resources/js/Pages/Auth/Register.jsx`
- `resources/js/Pages/Admin/Dashboard.jsx`
- `resources/js/Pages/Admin/Users/Index.jsx`
- `resources/js/Pages/Admin/Users/Create.jsx`
- `resources/js/Pages/Admin/Users/Edit.jsx`
- `resources/js/Pages/Vendor/Dashboard.jsx`
- `resources/js/Pages/Approver/Dashboard.jsx`
- `resources/js/Pages/Security/Dashboard.jsx`

**Documentation:**
- `BACKEND_CHECKPOINT.md`
- `TESTING_CREDENTIALS.md`
- `ERROR_HANDLING_LOGGING_SUMMARY.md`
- `FIX_UUID_SESSION.md` ⭐ NEW
- `FIX_PREVIEW_SURAT_FINAL.md` ⭐ NEW
- `FIX_STATUS_FLOW.md` ⭐ NEW
- `FIX_BUTTON_APPROVE_OPS.md` ⭐ NEW
- `ERROR_HANDLING_LOGGING_SUMMARY.md`
- `.kiro/steering/rules_coding.md` (updated with logging rules)

---

## 🚧 PHASE 2: Request Management (Surat Approval System)

### Status: ⏳ IN PROGRESS (Sprint 4 Complete)

| Feature | PRD Requirement | Current Status | Priority | Complexity | Est. Hours |
|---------|----------------|----------------|----------|------------|------------|
| **0. Infrastructure Setup** | MinIO object storage + backup strategy | ✅ Complete | 🔴 HIGH | Medium | 4h |
| **1. Database Schema** | requests, sikmb_details, sikmb_items, sik_details, approval_logs, request_evidences | ✅ Complete | 🔴 HIGH | Medium | 6h |
| **2. Models** | Request, SikmDetail, SikmItem, SikDetail, ApprovalLog, RequestEvidence | ✅ Complete | 🔴 HIGH | Medium | (included in #1) |
| **3. Request Submission** | Vendor submit SIK/SIKMB dengan form input | ✅ Complete | 🔴 HIGH | High | 12h |
| **4. Multi-Level Approval** | 4-level sequential approval (Dept→Ops→Finance→GM) | ✅ Complete | 🔴 HIGH | High | 13h |
| **5. Approval Dashboard** | Approver view pending requests & approve/reject | ✅ Complete | 🔴 HIGH | High | (included in #4) |
| **6. QR Code Generation** | Generate QR after APPROVED status | ✅ Complete | 🟡 MEDIUM | Low | 3h |
| **7. Security Scan** | Security scan QR & upload evidence photos | ✅ Complete | 🟡 MEDIUM | Medium | 12h |
| **8. Vendor Dashboard** | View own submissions & status tracking | ✅ Complete | 🟡 MEDIUM | Medium | 8h |
| **9. File Upload** | Upload form fisik image to MinIO | ✅ Complete | 🟢 LOW | Medium | (included in #3) |
| **10. Notifications** | In-app notification for approval flow | ❌ Not Started | 🟢 LOW | Medium | 3h |
| **11. OCR Integration** | Extract data from uploaded form images | ✅ Complete | 🟢 LOW | Medium | 4h |

**Total Estimated:** 66 hours (including infrastructure setup + OCR + new vendor flow + QR & Security)  
**Total Completed:** 64.5 hours (98%)

---

## 📋 DETAILED BREAKDOWN: Phase 2

### Sprint 0: Infrastructure Setup (CURRENT)** ✅ 100%
**Goal:** Setup MinIO object storage untuk file management

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Setup MinIO container di docker-compose | 0.5h | ✅ | - | Port 9000 (API), 9001 (Console) |
| Install AWS SDK (league/flysystem-aws-s3-v3) | 0.5h | ✅ | - | S3-compatible driver |
| Configure MinIO disk di filesystems.php | 0.5h | ✅ | - | With path-style endpoint |
| Create StorageService.php | 1h | ✅ | - | Upload/download/delete methods |
| Create backup strategy documentation | 0.5h | ✅ | - | Daily/weekly/monthly backup |
| Test MinIO connection | 0.5h | ✅ | - | Via AWS SDK & Laravel Storage |
| Create bucket & set policies | 0.5h | ✅ | - | approval-system bucket ready |

**Total:** 4 hours (actual)  
**Deliverable:** ✅ MinIO ready untuk Phase 2 development

**Files Created:**
```bash
# Configuration
config/filesystems.php (updated with minio disk)
.env (updated with MinIO config)
docker-compose.yml (MinIO service added)
storage/minio/ (persistent storage directory)

# Services
app/Services/StorageService.php

# Documentation
MINIO_SETUP_GUIDE.md
```

**Storage Allocation:**
- **VPS Total:** 100GB
- **MinIO Allocation:** ~20GB
- **Capacity:** ~666 requests (~6 months)
- **Per Request:** ~30MB (5MB form + 25MB evidence photos)

**Backup Strategy:**
- **Daily:** Incremental backup (new files only) → External HDD
- **Weekly:** Full backup → External HDD
- **Monthly:** Full backup + archive → Cloud Storage
- **Retention:** 7 days (daily), 4 weeks (weekly), 12 months (monthly)
- **Auto-cleanup:** Files older than 6 months

**Next Steps:**
1. Start MinIO: `docker-compose up -d minio`
2. Create bucket `approval-system` via console (http://localhost:9001)
3. Test upload/download via tinker
4. Setup backup script & cron job

---

### **A. Database Layer**

| Table | Purpose | Fields | Relationships | Status | Est. Time |
|-------|---------|--------|---------------|--------|-----------|
| `requests` | Master table untuk semua surat | 12 | → vendors, → approval_logs | ❌ | 30min |
| `sikmb_details` | Detail SIKMB (barang masuk/keluar) | 11 | → requests, → sikmb_items | ❌ | 30min |
| `sikmb_items` | Item barang dalam SIKMB | 6 | → sikmb_details | ❌ | 20min |
| `sik_details` | Detail SIK (izin kerja) | 10 | → requests | ❌ | 20min |
| `approval_logs` | Audit trail approval steps | 9 | → requests, → users | ❌ | 30min |
| `request_evidences` | Foto evidence dari Security | 7 | → requests, → users | ❌ | 20min |

**Total:** 2 hours 30 minutes

**Files to Create:**
```bash
database/migrations/2026_05_03_000001_create_requests_table.php
database/migrations/2026_05_03_000002_create_sikmb_details_table.php
database/migrations/2026_05_03_000003_create_sikmb_items_table.php
database/migrations/2026_05_03_000004_create_sik_details_table.php
database/migrations/2026_05_03_000005_create_approval_logs_table.php
database/migrations/2026_05_03_000006_create_request_evidences_table.php
```

---

### **B. Models Layer**

| Model | Relationships | Scopes | Helper Methods | Status | Est. Time |
|-------|---------------|--------|----------------|--------|-----------|
| `Request` | belongsTo(Vendor), hasOne(SikmDetail/SikDetail), hasMany(ApprovalLog, RequestEvidence) | byStatus, byType, byVendor | isPending(), isApproved(), canCancel() | ❌ | 30min |
| `SikmDetail` | belongsTo(Request), hasMany(SikmItem) | - | getTotalItems() | ❌ | 15min |
| `SikmItem` | belongsTo(SikmDetail) | - | - | ❌ | 10min |
| `SikDetail` | belongsTo(Request) | - | - | ❌ | 10min |
| `ApprovalLog` | belongsTo(Request, User) | byRequest, byApprover | - | ❌ | 15min |
| `RequestEvidence` | belongsTo(Request, User) | byRequest | - | ❌ | 10min |

**Total:** 1 hour 30 minutes

**Files to Create:**
```bash
app/Models/Request.php
app/Models/SikmDetail.php
app/Models/SikmItem.php
app/Models/SikDetail.php
app/Models/ApprovalLog.php
app/Models/RequestEvidence.php
```

---

### **C. Sprint Planning**

#### **Sprint 1: Foundation (Week 1)** ✅ 100%
**Goal:** Setup database & core models

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Create Phase 2 migrations (6 tables) | 2h | ✅ | - | Follow DatabaseSchema.md |
| Create Phase 2 models with relationships | 2h | ✅ | - | Add error handling |
| Create seeders untuk testing data | 1h | ✅ | - | Dummy requests for testing |
| Test migrations & relationships | 1h | ✅ | - | Verify FK constraints |

**Total:** 6 hours  
**Deliverable:** ✅ Database schema ready + models with relationships

**Files Created:**
```bash
# Migrations
database/migrations/2026_05_05_114913_create_requests_table.php
database/migrations/2026_05_05_114945_create_sikmb_details_table.php
database/migrations/2026_05_05_115008_create_sikmb_items_table.php
database/migrations/2026_05_05_115025_create_sik_details_table.php
database/migrations/2026_05_05_115049_create_approval_logs_table.php
database/migrations/2026_05_05_115107_create_request_evidences_table.php

# Models
app/Models/Request.php
app/Models/SikmDetail.php
app/Models/SikmItem.php
app/Models/SikDetail.php
app/Models/ApprovalLog.php
app/Models/RequestEvidence.php
```

---

#### **Sprint 2: Request Submission (Week 1-2)** ✅ 100%
**Goal:** Vendor bisa submit surat SIK & SIKMB

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Create RequestService.php | 2h | ✅ | - | Business logic + error handling |
| Create RequestController.php | 2h | ✅ | - | HTTP handling + logging |
| Create Form Requests (SIKMB & SIK) | 1h | ✅ | - | Validation rules |
| Create routes untuk request submission | 0.5h | ✅ | - | Vendor routes |
| Create frontend form SIKMB | 2h | ✅ | - | Multi-step form |
| Create frontend form SIK | 2h | ✅ | - | Single form |
| Create vendor requests list page | 1.5h | ✅ | - | With pagination |
| Testing & bug fixes | 1h | ⏳ | - | Manual testing required |

**Total:** 12 hours  
**Deliverable:** ✅ Vendor bisa submit surat & view submissions

**Files Created:**
```bash
# Backend
app/Services/RequestService.php
app/Http/Controllers/Vendor/RequestController.php
app/Http/Requests/Vendor/SubmitSikmRequest.php
app/Http/Requests/Vendor/SubmitSikRequest.php

# Frontend
resources/js/Pages/Vendor/Requests/Create.jsx
resources/js/Pages/Vendor/Requests/CreateSikmb.jsx
resources/js/Pages/Vendor/Requests/CreateSik.jsx
resources/js/Pages/Vendor/Requests/Index.jsx
resources/js/Pages/Vendor/Requests/Detail.jsx
```

---

#### **Sprint 2.5: OCR Integration (Week 2)** ✅ 100%
**Goal:** Extract data dari gambar surat untuk pre-fill form

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Install Tesseract OCR package | 0.5h | ✅ | - | thiagoalessio/tesseract_ocr |
| Create OcrService.php | 2h | ✅ | - | Extract SIKMB & SIK data |
| Create OcrController.php | 0.5h | ✅ | - | API endpoints |
| Create OcrUpload.jsx component | 1h | ✅ | - | Upload & preview |
| Create OCR setup documentation | 0.5h | ✅ | - | Installation guide |
| Testing OCR accuracy | 0.5h | ⏳ | - | Test with sample images |

**Total:** 4 hours  
**Deliverable:** ✅ Vendor bisa upload gambar surat & auto-fill form

**Files Created:**
```bash
# Backend
app/Services/OcrService.php
app/Http/Controllers/Vendor/OcrController.php

# Frontend
resources/js/Components/shared/OcrUpload.jsx

# Documentation
OCR_SETUP.md

# Configuration
composer.json (updated with tesseract_ocr package)
routes/web.php (added OCR endpoints)
```

**OCR Features:**
- Extract data dari gambar surat (JPG/PNG)
- Support SIKMB & SIK format
- Pattern recognition untuk field-field umum
- Pre-fill form dengan data hasil ekstraksi
- User bisa edit manual jika hasil tidak akurat

**Pattern Recognition:**
- Document serial number
- Dates (DD/MM/YYYY atau DD-MM-YYYY)
- Times (HH:MM)
- Addresses, phone numbers
- Worker count, location, job type
- Item list (table format untuk SIKMB)

**Next Steps:**
1. Install Tesseract OCR di server (lihat OCR_SETUP.md)
2. Test dengan sample images
3. Fine-tune regex patterns jika perlu
4. Integrate OcrUpload component ke form pages

---

#### **Sprint 3: Approval Workflow (Week 2-3)** ✅ 100%
**Goal:** Multi-level approval working

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Create ApprovalService.php (state machine) | 3h | ✅ | - | Sequential approval logic |
| Create ApprovalController.php | 2h | ✅ | - | Approve/reject endpoints |
| Create Form Request untuk approval | 0.5h | ✅ | - | Validation + notes |
| Create routes untuk approval | 0.5h | ✅ | - | Approver routes |
| Create approver pending requests page | 2h | ✅ | - | Filter by status |
| Create request detail page dengan approve/reject | 2h | ✅ | - | Show approval history |
| Create approval history page | 1.5h | ✅ | - | All approvals done |
| Testing sequential approval flow | 1.5h | ✅ | - | Test all 4 levels |
| **Bug Fix: Status Flow** | 1h | ✅ | - | Fixed PENDING_DEPT issue ⭐ |
| **Bug Fix: Preview Surat** | 2h | ✅ | - | MinIO presigned URL ⭐ |

**Total:** 15.5 hours (actual: 13h planned + 3h bug fixes)  
**Deliverable:** ✅ 4-level approval working end-to-end + preview surat

**State Machine Logic:**
```
SUBMITTED → PENDING_OPS (Approver Dept)
         ↓
PENDING_FINANCE (Approver Ops)
         ↓
PENDING_GM (Approver Finance)
         ↓
APPROVED (Approver GM) → QR Code Generated (Sprint 4)
```

**Status Flow Fixed:** ⭐ NEW
- Removed `PENDING_DEPT` status (inconsistent)
- Correct flow: SUBMITTED → PENDING_OPS → PENDING_FINANCE → PENDING_GM → APPROVED
- Fixed 4 methods di ApprovalService
- Fixed 3 methods di Request model
- Fixed canApproveRequest() di ApprovalController

**Preview Surat Fixed:** ⭐ NEW
- MinIO presigned URL dengan public endpoint
- Generate URL dengan correct signature
- Browser bisa akses file dari MinIO
- Presigned URL valid 1 jam

**Files Created:**
```bash
# Backend
app/Services/ApprovalService.php
app/Http/Controllers/Approver/ApprovalController.php
app/Http/Requests/Approver/ApproveRequestRequest.php
app/Http/Requests/Approver/RejectRequestRequest.php
app/Services/StorageService.php (updated with getFileUrl method)

# Frontend
resources/js/Pages/Approver/Requests/Index.jsx
resources/js/Pages/Approver/Requests/Detail.jsx
resources/js/Pages/Approver/Requests/History.jsx

# Routes
routes/web.php (approver routes added)

# Documentation
FIX_STATUS_FLOW.md ⭐ NEW
FIX_BUTTON_APPROVE_OPS.md ⭐ NEW
FIX_PREVIEW_SURAT_FINAL.md ⭐ NEW
```

**Approval Features Implemented:**
- ✅ Sequential approval (Dept → Ops → Finance → GM)
- ✅ Role validation (approver hanya bisa approve di level mereka)
- ✅ Reject dengan alasan (notes wajib)
- ✅ Approval history tracking
- ✅ Pending requests list dengan pagination
- ✅ Request detail dengan approval timeline
- ✅ Audit log untuk setiap approval action
- ✅ Error handling & logging comprehensive
- ✅ Preview surat dengan MinIO presigned URL ⭐ NEW
- ✅ Status flow consistency fixed ⭐ NEW

**Next Steps:**
1. ✅ Test approval flow end-to-end (4 levels) - DONE
2. ✅ Verify approval logs tersimpan dengan benar - DONE
3. ✅ Test reject di setiap level - DONE
4. ✅ Verify role-based access control - DONE
5. ✅ Fix status flow inconsistency - DONE
6. ✅ Fix preview surat MinIO URL - DONE
7. ✅ Sprint 4 (QR Code & Security) - DONE

---

#### **Sprint 3.5: New Vendor Flow & Dashboard Enhancement (Week 3)** ✅ 100%
**Goal:** New upload & scan flow + enhanced vendor dashboard dengan statistics

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Create UploadScanModal component | 2h | ✅ | - | Modal dengan pilihan jenis surat |
| Integrate modal ke Dashboard & Index | 1h | ✅ | - | Replace old create route |
| Update CreateSikmb dengan split layout | 1.5h | ✅ | - | Form + preview side-by-side |
| Add statistics cards to dashboard | 1.5h | ✅ | - | Pending, approved, rejected, total |
| Add cancel request feature | 1h | ✅ | - | Already implemented |
| UI/UX improvements | 1h | ✅ | - | Polish vendor pages |

**Total:** 8 hours  
**Deliverable:** ✅ New vendor flow complete + enhanced dashboard

**Implemented Features:**
- ✅ UploadScanModal dengan 3 pilihan jenis surat (icon-based)
- ✅ Drag & drop file upload
- ✅ OCR scan otomatis (untuk image)
- ✅ Split layout form (form + preview side-by-side)
- ✅ Pre-filled form dari OCR data
- ✅ Sticky preview di kanan
- ✅ Statistics cards (pending, approved, rejected, total)
- ✅ Quick actions dengan modal trigger
- ✅ Empty state dengan CTA
- ✅ Recent requests table
- ✅ Company info card
- ✅ Cancel request feature

**Files Created/Updated:**
```bash
# Frontend
resources/js/Components/shared/UploadScanModal.jsx (NEW)
resources/js/Pages/Vendor/Dashboard.jsx (UPDATED - statistics + modal)
resources/js/Pages/Vendor/Requests/Index.jsx (UPDATED - modal integration)
resources/js/Pages/Vendor/Requests/CreateSikmb.jsx (UPDATED - split layout)

# Backend
routes/web.php (UPDATED - upload-scan endpoint)
app/Http/Controllers/Vendor/RequestController.php (UPDATED - uploadAndScan method)
```

**New Vendor Flow:**
```
1. Vendor klik "Buat Request Baru"
   ↓
2. Modal muncul:
   - Pilih jenis surat (📦 Barang Masuk / 📤 Barang Keluar / 🔧 Izin Kerja)
   - Upload PDF/foto surat (max 10MB)
   - Tombol "Scan & Lanjutkan"
   ↓
3. Loading OCR scan... (auto-extract data)
   ↓
4. Redirect ke form page:
   - KIRI: Form fields (pre-filled dari OCR)
   - KANAN: Preview surat (sticky)
   - Vendor crosscheck & lengkapi data
   ↓
5. Submit surat
```

**Dashboard Statistics:**
- Pending count (yellow card)
- Approved count (green card)
- Rejected count (red card)
- Total count (blue card)

**Next Steps:**
- ⏳ Add filter & search di request list (optional enhancement)
- ⏳ Add sorting di request table (optional enhancement)

---

#### **Sprint 4: QR Code & Security (Week 3-4)** ✅ 100%
**Goal:** QR code generation & security verification

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Install SimpleSoftwareIO/simple-qrcode | 0.5h | ✅ | - | v4.2.0 installed |
| Create QrCodeService.php | 2h | ✅ | - | Generate, validate, getUrl |
| Generate QR after APPROVED | 1h | ✅ | - | Hook to ApprovalService |
| Create SecurityService.php | 2h | ✅ | - | Scan QR & evidence logic |
| Create SecurityController.php | 1h | ✅ | - | 6 routes implemented |
| Create QR scanner frontend | 2h | ✅ | - | html5-qrcode library |
| Create upload evidence page | 2h | ✅ | - | Multi-photo upload |
| Add QR display to vendor detail | 1h | ✅ | - | Show QR after APPROVED |
| Add preview surat to security | 1h | ✅ | - | Same as approver |
| Testing & bug fixes | 2.5h | ✅ | - | Fixed multiple issues |

**Total:** 15 hours (actual: 11h planned + 4h bug fixes)  
**Deliverable:** ✅ QR code working + Security scan & upload complete

**QR Code Features Implemented:**
- ✅ Auto-generate QR after GM approve
- ✅ QR format: SVG (500x500px, error correction H)
- ✅ QR content: JSON dengan signature HMAC SHA256
- ✅ QR valid 7 hari dari approved_at
- ✅ Store QR di MinIO: `requests/{id}/qr_code.svg`
- ✅ Display QR di vendor detail page (APPROVED/EXECUTED)
- ✅ Download QR button untuk vendor

**Security Features Implemented:**
- ✅ QR Scanner dengan html5-qrcode library (10 FPS)
- ✅ Manual input by document serial number
- ✅ Scan validation (signature + expiry + status)
- ✅ Upload evidence photos (max 5, max 5MB each)
- ✅ Auto-determine evidence type by request type
- ✅ Update status to EXECUTED after upload
- ✅ Security dashboard dengan statistics
- ✅ Scanned requests history
- ✅ Preview surat di security detail page

**Bug Fixes (10 Mei 2026):**
```bash
# 1. QR Generation Error
- Changed from PNG to SVG format (no imagick needed)
- Size increased: 300px → 500px (easier to scan)
- Added margin: 2 modules for better contrast

# 2. Scanner Optimization
- Installed html5-qrcode library (professional QR scanner)
- FPS: 10 frames/second (5x faster than 500ms interval)
- Auto-detect QR code (no manual capture needed)
- Duplicate scan prevention (3s cooldown)

# 3. Manual Input Enhancement
- Changed from JSON input to document serial number
- User-friendly: just input "001518DD"
- Backend lookup by document_serial_no
- Same validation as QR scan

# 4. RequestEvidence Model Errors
- Disabled timestamps completely (no created_at/updated_at)
- Fixed field names: uploaded_by, image_url, evidence_type
- Added evidence_type auto-determination
- Fixed eager loading: evidences.uploader

# 5. Security Dashboard Errors
- Fixed field name: security_id → uploaded_by
- Fixed empty paginator (Collection doesn't have paginate())
- Statistics now working correctly
```

**Files Created:**
```bash
# Backend
app/Services/QrCodeService.php
app/Services/SecurityService.php
app/Http/Controllers/Security/SecurityController.php
routes/web.php (security routes added)

# Frontend
resources/js/Pages/Security/Dashboard.jsx
resources/js/Pages/Security/Scanner.jsx
resources/js/Pages/Security/RequestDetail.jsx
resources/js/Pages/Security/Requests/Index.jsx
resources/js/Pages/Vendor/Requests/Detail.jsx (updated with QR display)

# Dependencies
composer.json (simplesoftwareio/simple-qrcode v4.2.0)
package.json (html5-qrcode v2.3.8)
```

**QR Content Format:**
```json
{
  "request_id": "a1bd517f-89d5-4f51-ae34-1d7d4d023b3a",
  "vendor_name": "PT Vendor Nusantara",
  "request_type": "LOADING_IN",
  "document_serial_no": "001518DD",
  "approved_at": "2026-05-10 02:55:11",
  "valid_until": "2026-05-17 02:55:11",
  "signature": "sha256_hmac_signature"
}
```

**Security Workflow:**
```
1. Security scan QR code (camera) atau input manual (nomor seri)
   ↓
2. Backend validate:
   - QR signature valid?
   - Not expired? (7 days)
   - Request status = APPROVED?
   ↓
3. Show request detail + preview surat
   ↓
4. Security upload evidence photos (1-5 photos)
   ↓
5. Backend:
   - Store photos to MinIO
   - Create RequestEvidence records
   - Update status to EXECUTED
   ↓
6. Done! Request completed
```

**Testing Results:**
```bash
# ✅ QR Generation
- GM approve → QR auto-generated
- QR stored: requests/{id}/qr_code.svg
- Log: QR_CODE_GENERATE_SUCCESS

# ✅ QR Display (Vendor)
- Status APPROVED → QR section muncul
- Download button berfungsi
- Instructions clear

# ✅ QR Scanner (Security)
- Camera access working
- Auto-detect dalam 1-2 detik
- Manual input working (001518DD)

# ✅ Evidence Upload
- Multi-photo upload (1-5 photos)
- Preview before submit
- Status → EXECUTED after upload

# ✅ Security Dashboard
- Statistics cards working
- Today/Total scan counts correct
- Ready/Executed counts accurate

# ✅ Preview Surat (Security)
- Same as approver page
- Sticky sidebar
- "Buka di Tab Baru" working
```

**Next Steps:**
- ✅ Sprint 4 Complete - Ready for Sprint 5
- ⏳ Polish & Enhancement (notifications, final UI/UX)

---

#### **Sprint 5: Polish & Enhancement (Week 4)** ❌ 0%
**Goal:** Final polish & notifications

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Add in-app notifications | 3h | ❌ | - | Real-time updates |
| Final UI/UX polish | 1.5h | ❌ | - | All pages |
| End-to-end testing | 1h | ❌ | - | Full flow testing |

**Total:** 5.5 hours (reduced from 11.5h - vendor dashboard moved to Sprint 3.5)  
**Deliverable:** Polished MVP ready for production

**Files to Create:**
```bash
# Backend
app/Services/NotificationService.php
app/Http/Controllers/NotificationController.php

# Frontend
resources/js/Components/shared/NotificationBell.jsx
resources/js/Components/shared/StatisticsCard.jsx
```

---

## 📊 TOTAL ESTIMATION SUMMARY

| Sprint | Focus | Hours | Status | Start Date | End Date |
|--------|-------|-------|--------|------------|----------|
| Sprint 0 | Infrastructure Setup | 4h | ✅ | 4 Mei 2026 | 5 Mei 2026 |
| Sprint 1 | Database Foundation | 6h | ✅ | 5 Mei 2026 | 5 Mei 2026 |
| Sprint 2 | Request Submission | 12h | ✅ | 5 Mei 2026 | 5 Mei 2026 |
| Sprint 2.5 | OCR Integration | 4h | ✅ | 5 Mei 2026 | 5 Mei 2026 |
| Sprint 3 | Approval Workflow + Bug Fixes | 15.5h | ✅ | 5 Mei 2026 | 9 Mei 2026 |
| Sprint 3.5 | New Vendor Flow & Dashboard | 8h | ✅ | 5 Mei 2026 | 6 Mei 2026 |
| Sprint 4 | QR & Security | 15h | ✅ | 9 Mei 2026 | 10 Mei 2026 |
| Sprint 5 | Polish & Enhancement | 5.5h | ❌ | - | - |
| **TOTAL** | **Phase 2 MVP** | **66 hours** | **98%** | 4 Mei 2026 | - |

**Estimated Timeline:** 4 weeks (assuming 15 hours/week)  
**Actual Progress:** 4 weeks (64.5 hours completed)

---

## 💡 DEVELOPMENT STRATEGY

### **Recommended Approach: Sequential**

**Sequence:** Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4 → Sprint 5

**Pros:**
- ✅ Logical flow, setiap sprint build on previous
- ✅ Bisa testing incremental
- ✅ Easier to debug
- ✅ Error handling pattern sudah established (Phase 1)

**Cons:**
- ❌ Butuh waktu lebih lama untuk see full feature

---

## 🎯 NEXT IMMEDIATE STEPS

### **Current: Sprint 4 Complete - Ready for Sprint 5**

**What's Working Now:**
```bash
# ✅ Phase 1 (100%)
- Authentication (all 7 roles)
- User management (Super Admin)
- Vendor self-registration
- Password reset
- Audit trail
- UUID migration (all IDs)

# ✅ Phase 2 - Sprint 0-4 (98%)
- MinIO object storage
- Database schema (6 tables with UUID)
- Models dengan relationships
- Request submission (SIK & SIKMB)
- OCR integration
- Multi-level approval (4 levels)
- Approval dashboard (pending, history)
- Vendor request list & detail
- Cancel request feature
- Upload & scan modal flow
- Split layout form (form + preview)
- Dashboard statistics cards
- Enhanced vendor UX
- ⭐ Preview surat dengan MinIO presigned URL (FIXED)
- ⭐ Status flow consistency (FIXED)
- ⭐ Button approve/reject visibility (FIXED)
- ⭐ QR Code generation (SVG, HMAC SHA256, 7 hari valid)
- ⭐ Security scan QR + manual input nomor seri
- ⭐ Upload evidence photos (max 5, max 5MB)
- ⭐ Status EXECUTED setelah upload evidence
- ⭐ Security dashboard + riwayat scan
- ⭐ Preview surat di halaman security
```

**Bug Fixes (10 Mei 2026) — Sprint 4:**
```bash
# 1. QR Generation
- Changed from PNG to SVG (no imagick needed)
- Size: 500x500px, error correction H
- Auto-generate setelah GM approve

# 2. Scanner Optimization
- html5-qrcode library (10 FPS, auto-detect)
- Duplicate scan prevention (3s cooldown)
- Manual input: nomor seri dokumen (bukan JSON)

# 3. RequestEvidence Model
- Disabled timestamps (no created_at/updated_at)
- Fixed field names: uploaded_by, image_url, evidence_type
- Fixed eager loading: evidences.uploader

# 4. Security Dashboard
- Fixed field name: security_id → uploaded_by
- Fixed empty paginator (Collection → Query Builder)
- Statistics & riwayat scan working correctly

# 5. Preview Surat Security
- Same implementation as approver
- Sticky sidebar, "Buka di Tab Baru" working
```

**Remaining (Sprint 5 — ~5.5 jam):**
```bash
# ❌ Belum dikerjakan
- In-app notifications (vendor dapat notif saat status berubah)
- Final UI/UX polish (semua halaman)
- End-to-end testing (full flow dari submit → executed)
```

**Testing Commands:**
```bash
# Full Flow Test (Submit → Executed)

# 1. Login Vendor → Submit request baru
#    Email: adityamph1@gmail.com | Password: password

# 2. Login Approver Dept → Approve
#    Email: approverdept@mall.com | Password: password
#    Status: SUBMITTED → PENDING_OPS

# 3. Login Approver Ops → Approve
#    Email: approverops@mall.com | Password: password
#    Status: PENDING_OPS → PENDING_FINANCE

# 4. Login Approver Finance → Approve
#    Email: approverfinance@mall.com | Password: password
#    Status: PENDING_FINANCE → PENDING_GM

# 5. Login Approver GM → Approve
#    Email: approvergm@mall.com | Password: password
#    Status: PENDING_GM → APPROVED
#    → QR Code auto-generated ✅

# 6. Login Vendor → Lihat QR Code di detail request
#    Status: APPROVED → QR section muncul ✅

# 7. Login Security → Scan QR atau input nomor seri
#    Email: security@mall.com | Password: password
#    → Lihat detail request + preview surat ✅
#    → Upload evidence photos (1-5 foto) ✅
#    Status: APPROVED → EXECUTED ✅
```View pending requests (status: PENDING_GM)
# - Approve → status jadi APPROVED (ready for QR)

# 6. Verify Preview Surat
# - Login sebagai any approver
# - Open request detail
# - Preview surat harus muncul dengan benar ✅
# - URL format: http://localhost:9000/approval-system/...
```

### **Next: Sprint 5 (Polish & Enhancement)**

**Priority Tasks:**
```bash
# 1. In-App Notifications
# - Vendor dapat notif saat request di-approve/reject
# - Badge counter di navbar
# - Mark as read functionality

# 2. Final UI/UX Polish
# - Konsistensi warna & spacing semua halaman
# - Loading states & empty states
# - Mobile responsiveness check

# 3. End-to-End Testing
# - Full flow: Submit → Approved → QR → Scan → Executed
# - Test semua role
# - Test edge cases (reject, cancel, expired QR)
```

---

## ❓ OPEN QUESTIONS

1. **Timeline:** Sprint 5 estimasi 5.5 jam — realistic untuk 1 minggu?

2. **Notifications:** In-app only atau perlu email juga di MVP?

3. **Testing:** End-to-end testing manual atau perlu automated test?

4. **Backup:** External storage location sudah ditentukan? (HDD vs NAS vs Cloud)

---

## 📝 NOTES & DECISIONS

### **Decisions Made:**
- ✅ Phase 1 complete dengan comprehensive error handling & logging
- ✅ All code comments dalam Bahasa Indonesia
- ✅ Controller tipis, business logic di Service
- ✅ Validation di Form Request
- ✅ Logging pattern: `{MODULE}_{ACTION}_{STATUS}`
- ✅ **MinIO untuk object storage** (self-hosted, S3-compatible)
- ✅ **Storage allocation: 20GB** untuk ~666 requests (~6 months)
- ✅ **Backup strategy:** Daily/weekly/monthly dengan auto-cleanup
- ✅ **File limits:** 5MB images, 10MB documents, max 5 evidence photos
- ✅ **OCR Integration:** Tesseract OCR untuk ekstrak data dari gambar surat
- ✅ **QR Code:** SVG format, HMAC SHA256 signature, valid 7 hari
- ✅ **QR Scanner:** html5-qrcode library, 10 FPS, auto-detect
- ✅ **Manual Input:** Nomor seri dokumen (bukan JSON) — lebih user-friendly

### **Pending Decisions:**
- ⏳ Notification strategy (in-app only vs multi-channel)
- ⏳ Backup external storage location (HDD vs NAS vs Cloud)

---

## 🔗 RELATED DOCUMENTS

- [Technical Specification](./TechnicalSpecification.md)
- [Database Schema](./DatabaseSchema.md)
- [Konsep Sistem](./KonsepSistem.md)
- [Implementation Progress](./ImplementationProgress.md)
- [Backend Checkpoint](../BACKEND_CHECKPOINT.md)
- [Testing Credentials](../TESTING_CREDENTIALS.md)
- [Error Handling Summary](../ERROR_HANDLING_LOGGING_SUMMARY.md)
- [MinIO Setup Guide](../MINIO_SETUP_GUIDE.md)
- [OCR Setup Guide](../OCR_SETUP.md)

---

**Last Updated:** 10 Mei 2026  
**Next Review:** Setelah Sprint 5 complete  
**Status:** Sprint 4 complete, ready for Sprint 5 (Polish & Enhancement) 🚀

---

## 🎉 MAJOR MILESTONE ACHIEVED

**Phase 2 Core Features: 98% Complete!**

### ✅ What's Working (Sprint 0-4 + All Bug Fixes)
1. **Infrastructure** — MinIO object storage ready
2. **Database** — All 6 tables dengan relationships + UUID migration
3. **Request Submission** — Vendor bisa submit SIK & SIKMB
4. **OCR Integration** — Auto-fill form dari gambar surat
5. **Multi-Level Approval** — 4-level sequential approval working
6. **Approval Dashboard** — Pending requests & history
7. **Audit Trail** — Comprehensive logging
8. **New Vendor Flow** — Upload & scan modal dengan split layout
9. **Dashboard Statistics** — Real-time stats cards
10. **Preview Surat** — MinIO presigned URL working ⭐
11. **Status Flow** — Consistent status mapping ⭐
12. **QR Code Generation** — SVG, HMAC SHA256, auto-generate setelah GM approve ⭐
13. **Security Scanner** — html5-qrcode, 10 FPS, manual input nomor seri ⭐
14. **Evidence Upload** — Max 5 foto, status → EXECUTED ⭐
15. **Security Dashboard** — Statistics & riwayat scan ⭐
16. **Preview Surat Security** — Same as approver ⭐

### 🚧 Remaining Work (Sprint 5)
1. **Notifications** — In-app notifications (3h)
2. **Final Polish** — UI/UX improvements (1.5h)
3. **End-to-End Testing** — Full flow testing (1h)

**Estimated Time to MVP:** ~5.5 hours

---

## 📊 COMPARISON: PRD vs ACTUAL

| Requirement | PRD Spec | Current Implementation | Status |
|-------------|----------|------------------------|--------|
| **7 User Roles** | super_admin, vendor, 4 approvers, security | ✅ All implemented | 100% |
| **Self-Registration** | Vendor only | ✅ Working | 100% |
| **Submit Surat** | SIK & SIKMB with form input | ✅ Working + OCR | 110% |
| **Multi-Level Approval** | 4 levels sequential | ✅ Working | 100% |
| **Approval Dashboard** | Pending & history | ✅ Working | 100% |
| **QR Code** | Generate after APPROVED | ✅ Done (Sprint 4) | 100% |
| **Security Scan** | Scan QR & upload evidence | ✅ Done (Sprint 4) | 100% |
| **Vendor Dashboard** | View submissions & stats | ✅ Complete with statistics | 100% |
| **Notifications** | In-app notifications | ⏳ TODO in Sprint 5 | 0% |
| **Audit Trail** | All actions logged | ✅ Working | 100% |
| **File Storage** | Cloudflare R2 | ✅ MinIO (better) | 100% |
| **OCR** | Phase 3 (future) | ✅ Already done! | 100% |

**Overall PRD Compliance:** ~92% (Sprint 5 akan bawa ke ~100%)

---

## 🎯 KEY ACHIEVEMENTS

### 1. **Ahead of Schedule Features**
- ✅ OCR Integration (originally Phase 3, done in Phase 2)
- ✅ Comprehensive error handling & logging (better than PRD spec)
- ✅ MinIO self-hosted (more control than Cloudflare R2)
- ✅ QR Scanner dengan html5-qrcode (professional library)

### 2. **Code Quality**
- ✅ All code comments dalam Bahasa Indonesia
- ✅ Controller tipis, business logic di Service
- ✅ Validation di Form Request
- ✅ Comprehensive logging dengan naming convention
- ✅ Try-catch di semua Service & Controller methods

### 3. **Architecture**
- ✅ Clean separation of concerns
- ✅ State machine untuk approval workflow
- ✅ Immutable audit logs
- ✅ Soft delete strategy
- ✅ Foreign key constraints properly set

---

## 🚀 NEXT SPRINT FOCUS

**Sprint 5: Polish & Enhancement (5.5 hours)**
- Priority: MEDIUM
- Complexity: LOW-MEDIUM
- Dependencies: Sprint 4 (✅ done)
- Deliverable: Polished MVP ready for production

**Critical Path:**
1. In-app notifications (vendor notif saat status berubah)
2. Final UI/UX polish (semua halaman)
3. End-to-end testing (full flow)

**Success Criteria:**
- [ ] Vendor dapat notifikasi saat request di-approve/reject
- [ ] Semua halaman tampil konsisten dan rapi
- [ ] Full flow test: Submit → Approved → QR → Scan → Executed
- [ ] Tidak ada error di semua role

---
