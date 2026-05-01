________________________________________
🧱 PART 1: Data Utama (Foundation)
Sebelum masuk ke detail form, sistem kita mengandalkan 2 tabel utama sebagai pondasi:
1.	vendors: Menyimpan otomatis identitas perusahaan (Nama PT, Nama Penanggung Jawab, No HP, Alamat). Jadi vendor tidak perlu mengetik ulang data ini setiap kali membuat surat.
2.	requests: Tabel Induk penyimpan metadata semua surat (baik SIK maupun SIKMB). Menyimpan Foto Form Asli (untuk proses OCR) dan status berjalannya dokumen.
________________________________________
📦 PART 2: Mapping Form SIKMB (Ijin Keluar / Masuk Barang)
Ini adalah alur ketika Vendor membawa barang masuk atau keluar area mall.
Bagian di Form Fisik	Tabel di Database	Nama Kolom	Penjelasan Teknis
Foto Form Asli	requests	original_form_image	Link gambar form yang difoto vendor di awal untuk di-scan OCR.
No Form (SM-ICB/001)	requests	sop_form_code	Kode standar formulir.
No Seri Merah (001518)	requests	document_serial_no	Diset Unique agar 1 kertas form tidak bisa dipakai 2x.
Jenis Surat (Coretan)	requests	category_id	Menjadi Enum: LOADING_IN atau LOADING_OUT.
Identitas Pemohon	vendors	name, pic_name, pic_phone	Ditarik dari akun vendor yang login.
Lokasi Asal Barang	sikmb_details	origin_floor, origin_unit	Lantai dan Unit tempat barang diambil.
Jadwal Pelaksanaan	sikmb_details	start_date, end_date	Dipecah 2 kolom untuk mengakomodir jika angkut barang berhari-hari.
Waktu Pelaksanaan	sikmb_details	start_time, end_time	Dipecah 2 kolom (contoh: 22:00 s/d 05:00).
Tujuan & PIC Tujuan	sikmb_details	dest_address, dest_floor, dest_phone	Lokasi pengiriman beserta nomor HP orang yang akan menerima barang.
Daftar Barang	sikmb_items	item_name, quantity, unit, remarks	Tabel relasi 1-to-Many. quantity khusus angka (2), unit khusus teks ("kotak/pcs").
________________________________________
🛠️ PART 3: Mapping Form SIK (Surat Ijin Kerja)
Ini adalah alur ketika Vendor/Kontraktor akan melakukan pekerjaan (renovasi, fitting out, perbaikan AC, dll) di area mall.
Bagian di Form Fisik	Tabel di Database	Nama Kolom	Penjelasan Teknis
Identitas Surat	requests	sop_form_code, document_serial_no	Sama perlakuannya dengan SIKMB (pakai OCR/Manual input).
Kontraktor / Pemohon	vendors	name, pic_name, pic_phone	Ditarik otomatis dari Master Data.
Jumlah Tenaga Kerja	sik_details	worker_count	Angka jumlah tukang. Penting untuk Security ngecek ID pekerja.
Jadwal Kerja	sik_details	start_date, end_date	Batas maksimal biasanya 7 hari kerja.
Waktu Kerja (Jam)	sik_details	start_time, end_time	Menentukan jam lembur/jam kerja.
Lokasi Kerja	sik_details	location	Area pengerjaan (contoh: "Toilet Lt. GF", "Toko A").
Jenis Pekerjaan	sik_details	job_type	Contoh: "Instalasi Listrik", "Pengecatan".
Keterangan / Permit	sik_details	description	Catatan ijin khusus, contoh: "Hot Work Permit (Pengelasan)".
________________________________________
✍️ PART 4: Sistem Tanda Tangan / Approval Flow (State Machine)
Di form fisik, ini adalah deretan kotak TTD di bagian bawah surat. Di sistem digital, kita tidak membuat kolom terpisah untuk setiap TTD. Semua masuk ke satu tabel Audit Trail yaitu approval_logs.
Ini adalah urutan perjalanannya:
1.	Pemohon (Vendor Submit)
○	Sistem mencatat action: SUBMITTED oleh role: TENANT di tabel approval_logs.
○	Status utama surat di requests berubah jadi PENDING_DEPT.
2.	Departemen Terkait (Review Teknis)
○	Admin Dept klik Approve. Sistem mencatat jam & siapa adminnya.
○	Status surat maju jadi PENDING_OPS.
3.	Operation (Review Lapangan)
○	Ops klik Approve. Log tercatat. Status maju jadi PENDING_FINANCE.
4.	Finance (Cek Tunggakan)
○	Finance klik Approve. Log tercatat. Status maju jadi PENDING_GM.
5.	GM Operation (Finalisasi)
○	GM klik Approve. Log tercatat.
○	Status surat berubah menjadi APPROVED. Barcode/QR Code surat langsung aktif di HP Vendor.
(Jika ada pihak yang menolak, sistem akan mencatat action: REJECTED, menyimpan alasannya di kolom notes, dan status surat akan otomatis batal).
________________________________________
👮 PART 5: Alur Security & Eksekusi Lapangan (Evidences)
Ini adalah eksekusi di hari H. Ketika Vendor datang ke Loading Dock atau mulai bekerja, Security mall harus memastikan barang/orang sesuai dengan surat. Semua foto lapangan masuk ke tabel request_evidences.
Skenario 1: Vendor Bawa Barang (SIKMB)
1.	Vendor menunjukkan layar HP yang berisi Barcode/Nomor Surat berstatus APPROVED.
2.	Security scan kode tersebut. Di HP Security muncul Detail Barang (sikmb_items).
3.	Security menghitung jumlah dus di pick-up. Cocok.
4.	Security memfoto mobil & barang lewat aplikasi.
○	Sistem menyimpan gambar ke tabel request_evidences dengan penanda: evidence_type = SECURITY_LOADING_IN (jika barang masuk) atau SECURITY_LOADING_OUT (jika barang keluar).
Skenario 2: Vendor Mulai Bekerja Ngelas (SIK)
1.	Vendor datang bawa 5 orang tukang. Security cek surat SIK-nya, kolom worker_count = 5. Cocok.
2.	Vendor mulai bekerja memotong besi (Hot Work).
3.	Tim Safety/Security memfoto mereka sedang bekerja menggunakan kacamata las.
4.	Foto di-upload ke aplikasi.
○	Sistem menyimpan gambar dengan penanda: evidence_type = SIK_WORK_PROOF.
________________________________________
Kesimpulan:
Dengan satu dokumen panduan ini, kamu memiliki pondasi sistem yang Sangat Enterprise. Semua edge case (tanggal rentang, satuan barang dinamis, OCR dokumen fisik, log persetujuan anti-manipulasi, dan bukti foto lapangan) sudah ter-cover 100%.