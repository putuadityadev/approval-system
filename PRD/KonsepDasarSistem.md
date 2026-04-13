Konsep Dasar Sistem Approval
User story
Pengguna adalah seorang admin/pekerja di salah satu mall di bali. Mereka biasanya bekerja dalam membersihkan mall, menyimpan berkas, dan melakukan pekerjaan lain di mall. Nah ini biasanya membutuhkan surat ijin, sekarang pengguna memiliki masalah dimana sistem approval atau persetujuan surat ijin kerja, barang masuk, barang keluar susah di track dikarenakan masih manual.
Example
Saya mempunyai vendor yang ingin melakukan suatu pekerjaan di mall tersebut lalu pihak pekerja ini memerlukan approval dari pihak mall (manajemen) pada saat sampai di mall pekerja tersebut mengisikan atau membawa surat izin kerja yang diperlukan untuk melakukan pekerjaan di mal tersebut lalu pada saat Waktu penandatanganan dokumen tersebut membutuhkan approval dari pihak manajemen apakah diperbolehkan. saya ingin membuat approval tersebut dilakukan secara dengan digital atau online yang tidak perlu bertemu dengan pihak manajemen secara langsung sehingga membuat Waktu efisien dan dapat diakses dimana saja dan kapan saja oleh pihak manajemen maupun pihak terkait yang membutuhkan akses untuk approval.
Pre-req
User ingin sistem ini memiliki 2 user role utama yaitu:
Admin (Sebagai orang yang akan approve/reject surat)
Requester (Sebagai orang yang akan mengajukan surat)
Skema dalam mengajukan suratnya adalah sebagai berikut
Vendor/Requester user ingin melakukan suatu pekerjaan di mall
Vendor tersebut memerlukan surat ijin approval berupa (Ijin kerja, Ijin Barang Masuk, Ijin Barang Keluar)
Requester melakukan pengajuan surat lewat aplikasi sesuai jenis suratnya, alurnya: a. Requester login ke aplikasi dan memilih buat pengajuan baru 
b. Requester memasukan judul, memilih jenis dan mengirim/foto surat tersebut. 
c. Requester memilih jenis/kategori dari surat tersebut
d. Requester klik kirim surat 
e. Admin dapat notifikasi surat masuk
 f. Admin buka sistem dan cek surat yang dikirim vendor 
g. Admin melalukan apporve dan status surat menjadi approve
Setelah surat di acc requester akan mendapatkan bukti berupa gambar/bukti di aplikasi
Requester/Vendor menunjukan suratnya ke pihak keamanan untuk melakukan pekerjaaan
Semua valid dan vendor bisa bekerja seperti biasa.

1. Definisi Jenis Surat (Fixed)
Sistem ini secara khusus hanya akan melayani tiga jenis kategori surat yang sudah ditetapkan:
Loading In (Surat Ijin Barang Masuk)
Loading Out (Surat Ijin Barang Keluar)
Ijin Kerja (Surat Ijin Melakukan Pekerjaan)
Catatan: Tidak ada penambahan kategori surat lain di luar ketiga jenis ini untuk menjaga kesederhanaan sistem.
2. Mekanisme Masa Berlaku & Status
Masa Berlaku: Tidak ada masa berlaku otomatis (kadaluarsa) berdasarkan waktu.
Ketentuan: Selama surat belum diproses oleh admin, maka statusnya akan tetap Pending dan tetap valid untuk ditinjau.
3. Struktur Akun & Registrasi
Self-Registration: Vendor/Requester diberikan akses untuk mendaftar akun mereka sendiri langsung melalui aplikasi web tanpa perlu dibuatkan manual oleh admin.
4. Audit Log & Keamanan (Audit Trail)
Scope Logging: Sistem akan mencatat setiap Aksi/Event utama saja (Who, When, What Action).
Detail: Tidak perlu mencatat detail perubahan data (seperti before vs after), yang terpenting adalah tercatat siapa yang membuat request dan admin mana yang mengubah status surat tersebut untuk keperluan transparansi dan proteksi keamanan.
5. Verifikasi & Bukti Akhir (MVP Focus)
Format: Setelah surat di-approve, requester cukup menunjukkan Status Approval yang tertera pada layar aplikasi web mereka kepada pihak keamanan.
Verifikasi Cepat: Untuk tahap MVP (Minimum Viable Product), sistem tidak akan menghasilkan QR Code atau PDF, melainkan fokus pada tampilan status di dashboard aplikasi.
6. Data Persistence & Storage
Kebijakan: Semua data dan foto yang diunggah ke Cloudflare R2 akan tetap disimpan di dalam sistem (tidak ada penghapusan otomatis) untuk menjaga ketersediaan riwayat data di masa depan.





