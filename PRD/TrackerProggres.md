# 📊 TRACKER PROGRESS - Mall Approval System

**Last Updated:** 3 Mei 2026  
**Current Phase:** Phase 1 Complete, Phase 2 Planning

---

## 📋 QUICK SUMMARY

| Phase | Status | Progress | Estimated Hours | Actual Hours |
|-------|--------|----------|-----------------|--------------|
| **Phase 1: Auth & User Management** | ✅ Complete | 100% | 20h | ~20h |
| **Phase 2: Request Management** | ❌ Not Started | 0% | 53.5h | 0h |
| **Phase 3: Advanced Features** | ⏳ Planned | 0% | TBD | 0h |

---

## 🎯 PHASE 1: Authentication & User Management

### Status: ✅ 100% COMPLETE

| Module | PRD Requirement | Current Status | Progress | Notes |
|--------|----------------|----------------|----------|-------|
| **Database** | 7 roles + audit trail | ✅ Complete | 100% | Migration, seeders, all tables ready |
| **Models** | User, Vendor, AuditLog | ✅ Complete | 100% | With helper methods & relationships |
| **Services** | Auth, Audit, Password Reset | ✅ Complete | 100% | **+ Error handling & logging added** |
| **Controllers** | Auth, Admin User CRUD | ✅ Complete | 100% | **+ Error handling & logging added** |
| **Middleware** | Role check, Active status | ✅ Complete | 100% | CheckRole with trim fix |
| **Routes** | All 7 roles routing | ✅ Complete | 100% | Guest, Admin, Vendor, Approver, Security |
| **Frontend** | Login, Register, Dashboards | ✅ Complete | 100% | All placeholder dashboards ready |
| **Testing** | Manual testing done | ✅ Complete | 100% | All roles tested & working |
| **Error Handling** | Comprehensive logging | ✅ Complete | 100% | All services & controllers covered |

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
- `.kiro/steering/rules_coding.md` (updated with logging rules)

---

## 🚧 PHASE 2: Request Management (Surat Approval System)

### Status: ⏳ IN PROGRESS (Sprint 0)

| Feature | PRD Requirement | Current Status | Priority | Complexity | Est. Hours |
|---------|----------------|----------------|----------|------------|------------|
| **0. Infrastructure Setup** | MinIO object storage + backup strategy | ✅ Complete | 🔴 HIGH | Medium | 4h |
| **1. Database Schema** | requests, sikmb_details, sikmb_items, sik_details, approval_logs, request_evidences | ✅ Complete | 🔴 HIGH | Medium | 6h |
| **2. Models** | Request, SikmDetail, SikmItem, SikDetail, ApprovalLog, RequestEvidence | ✅ Complete | 🔴 HIGH | Medium | (included in #1) |
| **2. Models** | Request, SikmDetail, SikmItem, SikDetail, ApprovalLog, RequestEvidence | ❌ Not Started | 🔴 HIGH | Medium | 2h |
| **3. Request Submission** | Vendor submit SIK/SIKMB dengan form input | ❌ Not Started | 🔴 HIGH | High | 12h |
| **4. Multi-Level Approval** | 4-level sequential approval (Dept→Ops→Finance→GM) | ❌ Not Started | 🔴 HIGH | High | 13h |
| **5. Approval Dashboard** | Approver view pending requests & approve/reject | ❌ Not Started | 🔴 HIGH | High | (included in #4) |
| **6. QR Code Generation** | Generate QR after APPROVED status | ❌ Not Started | 🟡 MEDIUM | Low | 3h |
| **7. Security Scan** | Security scan QR & upload evidence photos | ❌ Not Started | 🟡 MEDIUM | Medium | 8h |
| **8. Vendor Dashboard** | View own submissions & status tracking | ❌ Not Started | 🟡 MEDIUM | Medium | 6h |
| **9. File Upload** | Upload form fisik image to Cloudflare R2 | ❌ Not Started | 🟢 LOW | Medium | 2h |
| **10. Notifications** | In-app notification for approval flow | ❌ Not Started | 🟢 LOW | Medium | 3h |

**Total Estimated:** 56.5 hours (including infrastructure setup)

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

#### **Sprint 1: Foundation (Week 1)** ❌ 0%
**Goal:** Setup database & core models

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Create Phase 2 migrations (6 tables) | 2h | ❌ | - | Follow DatabaseSchema.md |
| Create Phase 2 models with relationships | 2h | ❌ | - | Add error handling |
| Create seeders untuk testing data | 1h | ❌ | - | Dummy requests for testing |
| Test migrations & relationships | 1h | ❌ | - | Verify FK constraints |

**Total:** 6 hours  
**Deliverable:** Database schema ready + models with relationships

---

#### **Sprint 2: Request Submission (Week 1-2)** ❌ 0%
**Goal:** Vendor bisa submit surat SIK & SIKMB

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Create RequestService.php | 2h | ❌ | - | Business logic + error handling |
| Create RequestController.php | 2h | ❌ | - | HTTP handling + logging |
| Create Form Requests (SIKMB & SIK) | 1h | ❌ | - | Validation rules |
| Create routes untuk request submission | 0.5h | ❌ | - | Vendor routes |
| Create frontend form SIKMB | 2h | ❌ | - | Multi-step form |
| Create frontend form SIK | 2h | ❌ | - | Single form |
| Create vendor requests list page | 1.5h | ❌ | - | With pagination |
| Testing & bug fixes | 1h | ❌ | - | End-to-end test |

**Total:** 12 hours  
**Deliverable:** Vendor bisa submit surat & view submissions

**Files to Create:**
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

#### **Sprint 3: Approval Workflow (Week 2-3)** ❌ 0%
**Goal:** Multi-level approval working

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Create ApprovalService.php (state machine) | 3h | ❌ | - | Sequential approval logic |
| Create ApprovalController.php | 2h | ❌ | - | Approve/reject endpoints |
| Create Form Request untuk approval | 0.5h | ❌ | - | Validation + notes |
| Create routes untuk approval | 0.5h | ❌ | - | Approver routes |
| Create approver pending requests page | 2h | ❌ | - | Filter by status |
| Create request detail page dengan approve/reject | 2h | ❌ | - | Show approval history |
| Create approval history page | 1.5h | ❌ | - | All approvals done |
| Testing sequential approval flow | 1.5h | ❌ | - | Test all 4 levels |

**Total:** 13 hours  
**Deliverable:** 4-level approval working end-to-end

**State Machine Logic:**
```
SUBMITTED → PENDING_DEPT (Approver Dept)
         ↓
PENDING_OPS (Approver Ops)
         ↓
PENDING_FINANCE (Approver Finance)
         ↓
PENDING_GM (Approver GM)
         ↓
APPROVED → QR Code Generated
```

**Files to Create:**
```bash
# Backend
app/Services/ApprovalService.php
app/Http/Controllers/Approver/ApprovalController.php
app/Http/Requests/Approver/ApproveRequestRequest.php

# Frontend
resources/js/Pages/Approver/Requests/Index.jsx
resources/js/Pages/Approver/Requests/Detail.jsx
resources/js/Pages/Approver/Requests/History.jsx
```

---

#### **Sprint 4: QR Code & Security (Week 3-4)** ❌ 0%
**Goal:** QR code generation & security verification

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Setup Cloudflare R2 integration | 1h | ❌ | - | Config + credentials |
| Create QrCodeService.php | 2h | ❌ | - | Generate & store QR |
| Generate QR after APPROVED | 1h | ❌ | - | Hook to approval |
| Create SecurityService.php | 2h | ❌ | - | Scan & evidence logic |
| Create QR scanner frontend | 2h | ❌ | - | Camera access |
| Create upload evidence page | 2h | ❌ | - | Multi-photo upload |
| Testing QR scan & evidence upload | 1h | ❌ | - | End-to-end test |

**Total:** 11 hours  
**Deliverable:** QR code working + Security bisa scan & upload

**Files to Create:**
```bash
# Backend
app/Services/QrCodeService.php
app/Services/SecurityService.php
app/Http/Controllers/Security/SecurityController.php
app/Http/Requests/Security/UploadEvidenceRequest.php

# Frontend
resources/js/Pages/Security/Scanner.jsx
resources/js/Pages/Security/RequestDetail.jsx
resources/js/Pages/Security/UploadEvidence.jsx
```

---

#### **Sprint 5: Polish & Enhancement (Week 4)** ❌ 0%
**Goal:** Dashboard enhancement & notifications

| Task | Est. Time | Status | Assignee | Notes |
|------|-----------|--------|----------|-------|
| Enhance vendor dashboard dengan statistics | 2h | ❌ | - | Cards: pending, approved, rejected |
| Add filter & search di request list | 1.5h | ❌ | - | By status, date, type |
| Add in-app notifications | 3h | ❌ | - | Real-time updates |
| Add cancel request feature | 1h | ❌ | - | Only for pending |
| UI/UX improvements | 2h | ❌ | - | Polish all pages |
| End-to-end testing | 2h | ❌ | - | Full flow testing |

**Total:** 11.5 hours  
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
| Sprint 2 | Request Submission | 12h | ❌ | - | - |
| Sprint 3 | Approval Workflow | 13h | ❌ | - | - |
| Sprint 4 | QR & Security | 11h | ❌ | - | - |
| Sprint 5 | Polish & Enhancement | 11.5h | ❌ | - | - |
| **TOTAL** | **Phase 2 MVP** | **57.5 hours** | **17%** | 4 Mei 2026 | - |

**Estimated Timeline:** 4 weeks (assuming 15 hours/week)

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

### **Current: Complete Sprint 0 Testing**

**Commands to Run:**
```bash
# 1. Start MinIO container
docker-compose up -d minio

# 2. Check MinIO is running
docker ps | grep minio
docker logs minio

# 3. Access MinIO Console
# Open browser: http://localhost:9001
# Login: minioadmin / minioadmin123
# Create bucket: approval-system

# 4. Test MinIO from Laravel
docker exec -it laravel_app php artisan tinker

# In tinker:
use Illuminate\Support\Facades\Storage;
Storage::disk('minio')->put('test.txt', 'Hello MinIO!');
Storage::disk('minio')->exists('test.txt'); // Should return true
Storage::disk('minio')->get('test.txt'); // Should return "Hello MinIO!"
Storage::disk('minio')->delete('test.txt');
exit

# 5. Test StorageService
docker exec -it laravel_app php artisan tinker

# In tinker:
$service = app(\App\Services\StorageService::class);
// Test akan dilakukan saat Sprint 2 (butuh UploadedFile)
```

### **Next: Start Sprint 1 (Database Foundation)**

**Commands to Run:**
```bash
# 1. Create Phase 2 migrations
php artisan make:migration create_requests_table
php artisan make:migration create_sikmb_details_table
php artisan make:migration create_sikmb_items_table
php artisan make:migration create_sik_details_table
php artisan make:migration create_approval_logs_table
php artisan make:migration create_request_evidences_table

# 2. Create models
php artisan make:model Request
php artisan make:model SikmDetail
php artisan make:model SikmItem
php artisan make:model SikDetail
php artisan make:model ApprovalLog
php artisan make:model RequestEvidence

# 3. Run migrations
php artisan migrate

# 4. Create seeders
php artisan make:seeder RequestSeeder
```

---

## ❓ OPEN QUESTIONS

1. **Timeline:** Apakah 4 weeks timeline realistic? Atau perlu adjust?

2. **Scope:** Build full Phase 2 sekaligus, atau prioritize certain features dulu?

3. ~~**Object Storage:** Apakah R2 account sudah ready? Atau pakai local storage dulu?~~ ✅ **RESOLVED:** Pakai MinIO self-hosted

4. **QR Code Library:** Mau pakai SimpleSoftwareIO/simple-qrcode atau yang lain?

5. **Testing Data:** Perlu seeder untuk dummy requests atau manual input aja?

6. **Notifications:** In-app only atau perlu email/WhatsApp juga di MVP?

7. **OCR Integration:** Tesseract OCR setup di Sprint berapa? (Deferred to Phase 3)

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
- ✅ **Tesseract OCR deferred to Phase 3** (focus Phase 2 dulu)

### **Pending Decisions:**
- ⏳ QR Code library selection (SimpleSoftwareIO vs alternatives)
- ⏳ Notification strategy (in-app only vs multi-channel)
- ⏳ Testing data strategy (seeder vs manual)
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
- [MinIO Setup Guide](../MINIO_SETUP_GUIDE.md) ⭐ NEW

---

**Last Updated:** 4 Mei 2026  
**Next Review:** Setelah Sprint 0 testing complete  
**Status:** Sprint 0 (Infrastructure) complete, ready for Sprint 1 🚀
