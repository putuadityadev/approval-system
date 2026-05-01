Konsep Dasar Sistem Approval
USER STORY
Pengguna adalah seorang admin/pekerja di salah satu mall di bali. Mereka biasanya bekerja dalam membersihkan mall, menyimpan berkas, dan melakukan pekerjaan lain di mall. Nah ini biasanya membutuhkan surat ijin, sekarang pengguna memiliki masalah dimana sistem approval atau persetujuan surat ijin kerja, barang masuk, barang keluar susah di track dikarenakan masih manual.
EXAMPLE
Saya mempunyai vendor yang ingin melakukan suatu pekerjaan di mall tersebut lalu pihak pekerja ini memerlukan approval dari pihak mall (manajemen) pada saat sampai di mall pekerja tersebut mengisikan atau membawa surat izin kerja yang diperlukan untuk melakukan pekerjaan di mal tersebut lalu pada saat Waktu penandatanganan dokumen tersebut membutuhkan approval dari pihak manajemen apakah diperbolehkan. saya ingin membuat approval tersebut dilakukan secara dengan digital atau online yang tidak perlu bertemu dengan pihak manajemen secara langsung sehingga membuat Waktu efisien dan dapat diakses dimana saja dan kapan saja oleh pihak manajemen maupun pihak terkait yang membutuhkan akses untuk approval.

CATATAN REVISI
Dokumen ini diperbarui agar konsisten dengan dokumen teknis terbaru. Seluruh section telah direvisi mencakup multi-level approval, role Security, dan Barcode/QR Code verification.

USER ROLES (DIPERBARUI)
1. Requester / Vendor — Pihak pengaju surat. Dapat self-registration tanpa bantuan admin.
2. Approver (Multi-Level — 4 Level Berurutan)
Level 1: Departemen Terkait (Review Teknis)
Level 2: Operasional (Review Lapangan)
Level 3: Finance (Cek Tunggakan)
Level 4: GM Operation (Finalisasi)
3. Security Lapangan — Verifikasi surat di lapangan, scan barcode, upload foto evidence.

JENIS SURAT (FIXED)
LOADING_IN — Surat Izin Barang Masuk (SIKMB)
LOADING_OUT — Surat Izin Barang Keluar (SIKMB)
IJIN_KERJA — Surat Izin Melakukan Pekerjaan (SIK)

ALUR PENGAJUAN (END-TO-END)
Fase 1 — Submit oleh Requester a. Login → Pilih "Buat Pengajuan Baru" → Isi form (SIK atau SIKMB) → Upload foto form fisik (opsional) → Klik Kirim b. Sistem mencatat SUBMITTED di approval_logs. Status → PENDING_DEPT. Notifikasi dikirim ke Approver Level 1.
Fase 2 — Multi-Level Approval (State Machine)
Status
Approver
Jika Approve
Jika Reject
PENDING_DEPT
Departemen
→ PENDING_OPS
→ REJECTED
PENDING_OPS
Operasional
→ PENDING_FINANCE
→ REJECTED
PENDING_FINANCE
Finance
→ PENDING_GM
→ REJECTED
PENDING_GM
GM Operation
→ APPROVED + QR aktif
→ REJECTED

Setiap aksi dicatat permanen di approval_logs. Alasan reject disimpan di kolom notes.
Fase 3 — Verifikasi Lapangan oleh Security
Skenario SIKMB: Vendor tunjukkan QR Code → Security scan → Sistem tampilkan detail barang → Security foto kendaraan & barang → Simpan ke request_evidences (SECURITY_LOADING_IN / SECURITY_LOADING_OUT)
Skenario SIK: Vendor tunjukkan QR Code → Security cocokkan worker_count → Security foto aktivitas kerja → Simpan ke request_evidences (SIK_WORK_PROOF)

KETENTUAN MASA BERLAKU
Tidak ada expiry otomatis. Surat PENDING tetap valid hingga diproses.
Status surat: SUBMITTED → PENDING_DEPT → PENDING_OPS → PENDING_FINANCE → PENDING_GM → APPROVED (atau REJECTED di level mana pun)

AUDIT LOG
Tabel approval_logs mencatat: Who → When → What Action. Field: request_id, approver_id, role_level, action, action_date, notes.

VERIFIKASI AKHIR
Setelah APPROVED, Barcode/QR Code aktif di HP vendor. Security scan untuk verifikasi real-time.

DATA STORAGE
Semua data & foto disimpan permanen di Cloudflare R2. Soft-delete diterapkan (tidak ada hard delete).

SCOPE MVP (Phase 1)
✅ Auth semua role | ✅ Self-registration vendor | ✅ Submit SIK & SIKMB (manual input) | ✅ Multi-level approval 4 level | ✅ Notifikasi in-app | ✅ QR Code generation | ✅ Security scan & evidence upload | ✅ Audit log lengkap
DITUNDA KE PHASE 2+
⏳ OCR form fisik | ⏳ Notifikasi Email/WA | ⏳ Export PDF | ⏳ Analytics dashboard | ⏳ Delegate approver
 
