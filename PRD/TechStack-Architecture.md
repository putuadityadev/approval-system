# 🏗️ Tech Stack & Architecture — Mall Approval System

**Project**: Sistem Manajemen Persetujuan Surat Izin Mall  
**Version**: 1.0  
**Last Updated**: 20 Juni 2026

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Deployment Infrastructure](#deployment-infrastructure)
5. [Database Schema](#database-schema)
6. [Request Flow](#request-flow)
7. [Security & Authentication](#security--authentication)
8. [File Storage Strategy](#file-storage-strategy)

---

## 🎯 Overview

**Mall Approval System** adalah aplikasi web full-stack untuk mengelola proses persetujuan surat izin vendor di mall. Sistem ini mengotomasi workflow approval dari vendor submission, verifikasi security, hingga approval multi-level dengan audit trail lengkap.

### Key Features:
- ✅ Multi-role system (Vendor, Security, Approver, Admin)
- ✅ Multi-step approval workflow (Operational → Finance → GM)
- ✅ Document management dengan MinIO object storage
- ✅ QR code generation untuk approved requests
- ✅ Real-time status tracking
- ✅ Audit logging untuk compliance

---

## 🛠️ Tech Stack

### **Backend**

#### **Laravel 11**
- **Role**: Backend framework & API server
- **Features Used**:
  - Eloquent ORM untuk database management
  - Form Request Validation
  - Service Layer Architecture
  - Policy-based Authorization
  - Queue System (sync mode in production)
  - Built-in Authentication

#### **Inertia.js**
- **Role**: Bridge between Laravel & React
- **Why**: 
  - SPA experience tanpa perlu build REST API
  - Shared state management antara backend-frontend
  - Server-side routing dengan client-side rendering
  - No need for separate API versioning

---

### **Frontend**

#### **React 18 (JavaScript/JSX)**
- **Role**: UI framework
- **Why JSX over TypeScript**: 
  - Faster development iteration
  - Simpler setup untuk small-medium team
  - Less boilerplate code
  - Well-documented props via comments (coding standard)


#### **Tailwind CSS**
- **Role**: Utility-first CSS framework
- **Why**: 
  - Rapid UI development
  - Consistent design system
  - Small production bundle size
  - Easy responsive design

#### **Vite**
- **Role**: Frontend build tool
- **Why**: 
  - Lightning-fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Native ES modules support
  - Better than Webpack for modern projects

---

### **Database**

#### **MySQL 8.0**
- **Role**: Primary relational database
- **Schema Highlights**:
  - `users` — Multi-role user management
  - `vendors` — Vendor profile & company info
  - `requests` — Main request entities (SIK, SIKMB)
  - `approval_logs` — Audit trail untuk setiap approval action
  - `request_evidences` — Foto evidence dari Security
  - UUID primary keys untuk security & scalability


---

### **Object Storage**

#### **MinIO**
- **Role**: S3-compatible object storage untuk files/documents
- **What's Stored**:
  - Form documents (scanned surat izin)
  - Evidence photos (foto barang dari Security)
  - QR codes (generated untuk approved requests)
  - Backups (database dumps)

**Bucket Structure**:
```
approval-system/
├── requests/{request_id}/
│   └── form_{timestamp}.jpg
├── evidences/{request_id}/
│   ├── {timestamp}_0.jpg
│   └── {timestamp}_1.jpg
└── qrcodes/
    └── {request_id}.png

approval-backups/
└── db_backup_{date}.sql
```

**Access Strategy**:
- **Internal**: App → MinIO via Docker network (`http://minio:9000`)
- **External**: Browser → Traefik → MinIO (`https://storage.seviraku.cloud`)

---

### **Deployment & Infrastructure**

#### **Dokploy**
- **Role**: Self-hosted PaaS untuk deployment automation
- **Features**:
  - Git-based deployment (auto-deploy on push)
  - Container orchestration (Docker Compose)
  - Environment variable management
  - Domain & SSL management (Let's Encrypt)
  - Built-in monitoring & logs viewer

#### **Docker & Docker Compose**
- **Role**: Containerization & service orchestration
- **Services**:
  - `app` — Laravel + Nginx + PHP-FPM (single container)
  - `db` — MySQL 8.0
  - `minio` — Object storage server
  - All services connected via `approval_network` (internal) dan `dokploy-network` (external)

#### **Traefik**
- **Role**: Reverse proxy & load balancer
- **Managed by**: Dokploy
- **Features**:
  - Automatic SSL/TLS with Let's Encrypt
  - HTTP to HTTPS redirect
  - Path-based & host-based routing
  - Health checks


#### **VPS Server**
- **Provider**: Hostinger VPS (assumption based on IP)
- **Specs**: 
  - CPU: 2-4 vCores
  - RAM: 4-8GB
  - Storage: 100GB SSD
  - OS: Ubuntu 24.04 LTS
- **IP**: 72.60.78.155
- **Domains**:
  - `approval.seviraku.cloud` → Laravel App
  - `storage.seviraku.cloud` → MinIO Storage

---

## 🏛️ System Architecture

### **High-Level Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    DNS Resolution
                         │
              ┌──────────┴──────────┐
              │                     │
    approval.seviraku.cloud   storage.seviraku.cloud
              │                     │
┌─────────────┴─────────────────────┴──────────────────────────────┐
│                     VPS Server (Ubuntu 24.04)                     │
│                    72.60.78.155:80,443                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               Traefik (Reverse Proxy)                    │    │
│  │  - SSL Termination (Let's Encrypt)                       │    │
│  │  - HTTP → HTTPS Redirect                                 │    │
│  │  - Host-based Routing                                    │    │
│  └──────────────┬──────────────────────┬────────────────────┘    │
│                 │                      │                          │
│       Port 80 (internal)        Port 9000 (internal)              │
│                 │                      │                          │
│  ┌──────────────────┐           ┌─────────────────────────┐         │
│  │   App Container  │           │    MinIO Container      │         │
│  │                  │           │                         │         │
│  │  ┌────────────┐  │           │  Port 9000: S3 API      │         │
│  │  │   Nginx    │  │           │  Port 9001: Console     │         │
│  │  │  (Port 80) │  │           │                         │         │
│  │  └─────┬──────┘  │           │  Volumes:               │         │
│  │        │         │           │  - minio_data:/data     │         │
│  │  ┌─────▼──────┐  │           └─────────────────────────┘         │
│  │  │  PHP-FPM   │  │                      │                         │
│  │  │ (Laravel)  │  │◄─────────────────────┘                         │
│  │  └─────┬──────┘  │         Internal: http://minio:9000            │
│  │        │         │         (Path-style endpoint)                  │
│  │  ┌─────▼──────┐  │                                                │
│  │  │  Vite      │  │                                                │
│  │  │  Assets    │  │                                                │
│  │  │ (React+CSS)│  │                                                │
│  │  └────────────┘  │                                                │
│  │                  │                                                │
│  │  Volumes:        │                                                │
│  │  - app_storage   │                                                │
│  └────────┬─────────┘                                                │
│           │                                                          │
│           │ Port 3306 (internal)                                     │
│           │                                                          │
│  ┌────────▼───────────────┐                                         │
│  │   MySQL 8.0 Container  │                                         │
│  │                        │                                         │
│  │   Database:            │                                         │
│  │   - mall_approval      │                                         │
│  │                        │                                         │
│  │   Volumes:             │                                         │
│  │   - mysql_data         │                                         │
│  └────────────────────────┘                                         │
│                                                                      │
│  Docker Networks:                                                   │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ approval_network (bridge)                                │       │
│  │   - app ←→ db ←→ minio                                  │       │
│  └─────────────────────────────────────────────────────────┘       │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ dokploy-network (external)                               │       │
│  │   - traefik ←→ app                                       │       │
│  │   - traefik ←→ minio                                     │       │
│  └─────────────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────────┘
```

---

### **Application Architecture (Laravel + Inertia + React)**

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                                                                  │
│  React Components (JSX + Tailwind CSS)                          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Pages/    │  │ Components/  │  │   Layouts/   │            │
│  │  - Vendor  │  │ - ui/        │  │ - AuthLayout │            │
│  │  - Security│  │ - shared/    │  │ - GuestLayout│            │
│  │  - Approver│  │              │  │              │            │
│  │  - Admin   │  │              │  │              │            │
│  └────────────┘  └──────────────┘  └──────────────┘            │
│         │                │                   │                   │
│         └────────────────┴───────────────────┘                   │
│                          │                                       │
│                    Inertia Router                                │
│                    (Client-side)                                 │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                      HTTP/HTTPS
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    LARAVEL BACKEND                                │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Routes (web.php)                      │    │
│  │  - Inertia::render() responses                           │    │
│  └───────────────────────┬──────────────────────────────────┘    │
│                          │                                       │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │              Middleware Pipeline                          │   │
│  │  - Auth, CSRF, Session, Inertia                          │   │
│  └───────────────────────┬──────────────────────────────────┘   │
│                          │                                       │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │                   Controllers                             │   │
│  │  - Thin controllers (delegate to services)               │   │
│  │  - RequestController, SecurityController, etc.           │   │
│  └───────────────────────┬──────────────────────────────────┘   │
│                          │                                       │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │              Service Layer (Business Logic)              │   │
│  │  - RequestService  - StorageService                      │   │
│  │  - AuthService     - ApprovalService                     │   │
│  └───────┬──────────────────────────────────┬────────────────┘  │
│          │                                  │                    │
│  ┌───────▼────────────┐          ┌─────────▼──────────┐         │
│  │  Eloquent Models   │          │  External Services │         │
│  │  - User            │          │  - MinIO (Storage) │         │
│  │  - Vendor          │          │  - OpenRouter (AI) │         │
│  │  - Request         │          └────────────────────┘         │
│  │  - ApprovalLog     │                                          │
│  └─────────┬──────────┘                                          │
│            │                                                     │
│  ┌─────────▼──────────┐                                          │
│  │   MySQL Database   │                                          │
│  └────────────────────┘                                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### **Example: Vendor Submit SIKMB Request**

```
┌─────────────┐
│   Vendor    │
│   Browser   │
└──────┬──────┘
       │ 1. Fill form + upload scan document
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  POST /vendor/requests/sikmb                             │
│  Controller: RequestController@storeSikmb                │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 2. Validate input (FormRequest)
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Service: RequestService->submitSikmb()                  │
│    ├─ 3. StorageService->uploadRequestForm()            │
│    │     └─ Upload to MinIO (http://minio:9000)         │
│    │                                                      │
│    ├─ 4. Create Request record in DB                     │
│    │     └─ UUID, vendor_id, form_path, status=pending  │
│    │                                                      │
│    └─ 5. Create initial ApprovalLog                      │
│          └─ action=submitted, by=vendor                  │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 6. Redirect to vendor dashboard
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Inertia::render('Vendor/Dashboard')                     │
│    └─ Flash message: "Request submitted successfully"   │
└──────────────────────────────────────────────────────────┘
       │
       │ 7. React component renders
       │
       ▼
┌─────────────┐
│   Vendor    │
│   Dashboard │ ← Shows submitted request with status "pending"
└─────────────┘
```

---

### **Approval Workflow Sequence**

```
┌────────────┐      ┌────────────┐      ┌────────────┐      ┌────────────┐
│   Vendor   │      │  Security  │      │ Operational│      │  Finance   │
│   Submit   │ ───► │   Verify   │ ───► │  Approve   │ ───► │  Approve   │
└────────────┘      └────────────┘      └────────────┘      └────────────┘
     │                    │                    │                    │
     │ status:           │ status:            │ status:            │ status:
     │ pending           │ verified           │ approved_ops       │ approved_fin
     │                   │                    │                    │
     │                   │ + Evidence photos  │ + Approval note    │ + Approval note
     │                   │   uploaded         │                    │
     │                   │                    │                    │
     ▼                   ▼                    ▼                    ▼
                                                            ┌────────────┐
                                                            │  GM Final  │
                                                            │  Approve   │
                                                            └─────┬──────┘
                                                                  │
                                                                  │ status:
                                                                  │ approved_gm
                                                                  │
                                                                  │ + QR Code
                                                                  │   generated
                                                                  ▼
                                                            ┌────────────┐
                                                            │  COMPLETE  │
                                                            │ (Can print)│
                                                            └────────────┘

Note: Setiap step bisa di-reject, dan request kembali ke vendor untuk revision.
```

---

## 🗄️ Database Schema

### **Core Tables**

#### **users**
```sql
- id (UUID, PK)
- name
- email (unique)
- password (hashed)
- role (enum: vendor, security, approver, admin)
- is_active (boolean)
- email_verified_at
- timestamps
```

#### **vendors**
```sql
- id (UUID, PK)
- user_id (FK → users)
- company_name
- pic_name
- pic_phone
- pic_email
- address
- timestamps
```

#### **requests**
```sql
- id (UUID, PK)
- request_number (unique, auto-generated)
- vendor_id (FK → vendors)
- type (enum: SIK, SIKMB)
- form_path (path to MinIO)
- qr_code_path (nullable)
- status (enum: pending, verified, approved_ops, approved_fin, approved_gm, rejected)
- rejection_reason (nullable)
- submitted_at
- approved_at (nullable)
- timestamps
```


#### **approval_logs** (Audit Trail)
```sql
- id (UUID, PK)
- request_id (FK → requests)
- user_id (FK → users)
- action (enum: submitted, verified, approved, rejected, revised)
- notes (nullable)
- created_at
```

#### **request_evidences**
```sql
- id (UUID, PK)
- request_id (FK → requests)
- security_id (FK → users)
- evidence_path (path to MinIO)
- notes (nullable)
- created_at
```

### **Relationships**

```
users (1) ──────► (1) vendors
users (1) ──────► (*) approval_logs
vendors (1) ─────► (*) requests
requests (1) ────► (*) approval_logs
requests (1) ────► (*) request_evidences
```

---

## 🔐 Security & Authentication

### **Authentication Strategy**

- **Method**: Laravel Session-based Authentication
- **Session Driver**: Database (persistent across container restarts)
- **CSRF Protection**: Enabled untuk semua POST/PUT/DELETE requests
- **Password Hashing**: Bcrypt (default Laravel)

### **Authorization Strategy**

- **Method**: Policy-based Authorization + Middleware
- **Middleware**:
  - `CheckRole` — Filter access by user role
  - `EnsureActive` — Block inactive users
  - `Authenticate` — Verify login status

### **API Security (Future)**

- Currently no REST API exposed
- If needed in future: Laravel Sanctum for token-based auth

### **File Access Security**

- **MinIO**: Presigned URLs (1 hour expiry)
- **HTTPS Only**: All external traffic via Traefik SSL
- **Internal Network**: App-to-MinIO via private Docker network

---

## 📦 File Storage Strategy

### **Why MinIO?**

1. **S3-Compatible**: Standard API, easy migration ke AWS S3 jika scale up
2. **Self-Hosted**: No cloud storage bills, full control
3. **Docker-Native**: Easy deployment & scaling
4. **High Performance**: Optimal untuk read-heavy workloads

### **Storage Allocation**

```
Total VPS Storage: 100GB
├─ System + Docker: ~10GB
├─ MySQL Data: ~5GB (estimated for 1000s of records)
├─ MinIO Data: ~60GB
│   ├─ Form Documents: ~10GB (2000 requests × 5MB)
│   ├─ Evidence Photos: ~40GB (2000 requests × 5 photos × 4MB)
│   ├─ QR Codes: ~500MB (2000 requests × 250KB)
│   └─ Backups: ~10GB (weekly rotation)
└─ Logs & Temp: ~5GB
```

### **Backup Strategy**

- **Database**: Daily backup to MinIO `approval-backups` bucket
- **MinIO Data**: Weekly snapshot via `mc mirror` command
- **Retention**: 7 daily backups + 4 weekly backups

---

## 🚀 Deployment Pipeline

### **CI/CD Flow**

```
Developer Push Code
       │
       ▼
┌────────────────────┐
│   GitHub/GitLab    │
│   Main Branch      │
└─────────┬──────────┘
          │
          │ Webhook trigger
          ▼
┌────────────────────┐
│     Dokploy        │
│  (Auto-deploy)     │
└─────────┬──────────┘
          │
          │ 1. Pull latest code
          │ 2. Build Docker image (Dockerfile.prod)
          │    - Node stage: npm run build
          │    - PHP stage: composer install --no-dev
          │ 3. Create containers (docker-compose.prod.yml)
          │ 4. Run migrations (php artisan migrate --force)
          │ 5. Health check
          ▼
┌────────────────────┐
│   Production VPS   │
│   Containers Up    │
└────────────────────┘
```

### **Environment Management**

- **Development**: `.env` (local)
- **Production**: Dokploy Environment Variables (injected at runtime)
- **Secrets**: Stored in Dokploy (not in Git)

---

## 📊 Monitoring & Logging

### **Application Logs**

- **Location**: `storage/logs/laravel.log`
- **Format**: JSON structured logs
- **Level**: ERROR (production), DEBUG (development)
- **Key Log Points**:
  - Authentication attempts
  - File upload/download
  - Approval actions
  - Database operations
  - External API calls (MinIO, OpenRouter)

### **Container Logs**

```bash
# View logs
docker logs -f mall-approval-system-app-1

# Or via Dokploy UI
Dokploy Dashboard → Logs Tab
```

### **Monitoring (Future Enhancement)**

- **Uptime Monitoring**: UptimeRobot (external)
- **Performance Monitoring**: Laravel Telescope (development)
- **Error Tracking**: Sentry (if needed)

---

## 🎨 Frontend Architecture

### **Component Structure**

```
resources/js/
├── Pages/                    # Inertia pages (route endpoints)
│   ├── Auth/                 # Login, Register, ForgotPassword
│   ├── Vendor/               # Vendor-specific pages
│   │   ├── Dashboard.jsx
│   │   ├── Requests/
│   │   │   ├── Index.jsx     # List requests
│   │   │   ├── Create.jsx    # Create request form
│   │   │   └── Detail.jsx    # View request detail
│   │   └── Profile/
│   ├── Security/             # Security guard pages
│   ├── Approver/             # Approver pages
│   └── Admin/                # Admin pages
│
├── Components/               # Reusable components
│   ├── ui/                   # Primitive UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Label.jsx
│   │   └── Alert.jsx
│   └── shared/               # Shared business components
│       ├── Sidebar.jsx
│       ├── UserMenu.jsx
│       ├── DocumentViewer.jsx
│       ├── ApprovalTrackingModal.jsx
│       └── FlashMessage.jsx
│
├── Layouts/                  # Layout wrappers
│   ├── AuthLayout.jsx        # Authenticated user layout
│   └── GuestLayout.jsx       # Public pages layout
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.js
│   └── useFlashMessage.js
│
└── app.jsx                   # Inertia app setup
```

---

## ⚙️ Configuration Files

### **Key Config Files**

| File | Purpose |
|------|---------|
| `docker-compose.prod.yml` | Production container orchestration |
| `Dockerfile.prod` | Multi-stage Docker build |
| `.env.production` | Environment variables template |
| `config/filesystems.php` | MinIO & storage configuration |
| `config/auth.php` | Authentication configuration |
| `tailwind.config.js` | Tailwind CSS customization |
| `vite.config.js` | Vite build configuration |

---

## 🔧 Development vs Production

### **Development Environment**

```yaml
# docker-compose.yml (local)
services:
  app:
    - Mounted volumes (hot-reload)
    - Xdebug enabled
    - APP_DEBUG=true
    - npm run dev (Vite dev server)
  
  db:
    - Exposed port 3306 (accessible from host)
  
  minio:
    - Exposed port 9000, 9001
    - No SSL
```

### **Production Environment**

```yaml
# docker-compose.prod.yml
services:
  app:
    - No mounted volumes
    - Compiled assets (npm run build)
    - APP_DEBUG=false
    - Nginx + PHP-FPM (single container)
  
  db:
    - Internal network only
    - No exposed ports
  
  minio:
    - Internal network + dokploy-network
    - SSL via Traefik
    - Port 9001 for admin only
```

---

## 🔮 Future Enhancements

### **Phase 2 (Planned)**

- [ ] **Redis Cache**: For session & query caching
- [ ] **Queue System**: Background jobs for email & notifications
- [ ] **Email Notifications**: Notify approvers when request arrives
- [ ] **Real-time Updates**: WebSocket for live status updates
- [ ] **Mobile App**: React Native for vendor & security apps
- [ ] **Analytics Dashboard**: Request statistics & reporting
- [ ] **Elasticsearch**: Full-text search for requests & documents

### **Scalability Considerations**

**Current Capacity**: ~100-200 concurrent users, ~2000 requests/month

**Scaling Path**:
1. **Horizontal Scaling**: Add more app containers behind Traefik load balancer
2. **Database**: MySQL replication (master-slave)
3. **Storage**: MinIO distributed mode (4+ nodes)
4. **CDN**: CloudFlare for static assets
5. **Migration to Cloud**: AWS/GCP with managed services

---

## 📚 Documentation Links

- [Laravel Documentation](https://laravel.com/docs/11.x)
- [Inertia.js Guide](https://inertiajs.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [Dokploy Guide](https://dokploy.com/docs)
- [Docker Compose Reference](https://docs.docker.com/compose/)

---

## 🎓 Key Takeaways

### **Why This Stack?**

| Decision | Reason |
|----------|--------|
| **Laravel + Inertia** | Rapid development, single codebase, no API overhead |
| **React (JSX)** | Mature ecosystem, fast iteration, team familiarity |
| **Tailwind CSS** | Consistent design, rapid prototyping, small bundle |
| **MinIO** | Cost-effective, S3-compatible, self-hosted control |
| **MySQL** | Reliable, well-known, sufficient for relational data |
| **Dokploy** | Self-hosted PaaS, no vendor lock-in, full control |
| **Docker** | Consistent environments, easy scaling, portability |

### **Success Metrics**

- ✅ **Performance**: Page load < 2s, API response < 500ms
- ✅ **Uptime**: 99.5% availability target
- ✅ **Security**: No data breaches, encrypted in transit
- ✅ **UX**: Intuitive interface, mobile-responsive
- ✅ **Maintainability**: Clean code, documented, testable

---

## 👥 Team & Responsibilities

| Role | Responsibility |
|------|----------------|
| **Backend Dev** | Laravel API, business logic, database |
| **Frontend Dev** | React components, UI/UX, Tailwind styling |
| **DevOps** | Docker, Dokploy, monitoring, backups |
| **QA** | Testing, bug reporting, UAT |

---

**Document Version**: 1.0  
**Last Updated**: 20 Juni 2026  
**Maintained By**: Mall Approval System Dev Team  
**Status**: ✅ Production Ready
