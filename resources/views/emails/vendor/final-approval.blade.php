@extends('emails.layouts.base')

@section('title', 'Surat Disetujui Penuh')

@section('content')
    <h2>🎉 Surat Anda DISETUJUI PENUH!</h2>

    <p>Halo <strong>{{ $requestModel->vendor->pic_name ?? 'Vendor' }}</strong>,</p>

    <p>Selamat! Surat Anda telah <strong>disetujui oleh semua level approval</strong> dan siap untuk dieksekusi.</p>

    <div class="info-box">
        <table>
            <tr>
                <td class="label">Jenis Surat</td>
                <td class="value">{{ $requestModel->getTypeLabel() }}</td>
            </tr>
            <tr>
                <td class="label">No. Seri Dokumen</td>
                <td class="value">{{ $requestModel->document_serial_no ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Perusahaan</td>
                <td class="value">{{ $requestModel->vendor->company_name ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Status</td>
                <td class="value">
                    <span class="status-badge status-approved">DISETUJUI</span>
                </td>
            </tr>
        </table>
    </div>

    {{-- Progress Bar 100% --}}
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress-fill" style="width: 100%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #2563eb; font-weight: 600;">
            <span>Dept ✓</span>
            <span>Ops ✓</span>
            <span>Finance ✓</span>
            <span>GM ✓</span>
        </div>
    </div>

    <div class="alert alert-success">
        <strong>✅ Langkah Selanjutnya:</strong>
        <ol style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8;">
            <li>Login ke sistem untuk melihat <strong>QR Code</strong> surat Anda</li>
            <li>Tunjukkan QR Code ke petugas <strong>Security</strong> di lokasi</li>
            <li>Security akan memverifikasi dan mengeksekusi surat Anda</li>
        </ol>
    </div>

    <p style="text-align: center; margin-top: 24px;">
        <a href="{{ url('/vendor/requests/' . $requestModel->id) }}" class="btn btn-primary">
            Lihat QR Code & Detail
        </a>
    </p>

    <hr class="divider">

    <div class="alert alert-warning">
        <strong>⚠️ Penting:</strong> Pastikan Anda membawa QR Code saat ke lokasi.
        QR Code dapat diakses melalui halaman detail surat di sistem.
    </div>
@endsection
