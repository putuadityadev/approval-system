@extends('emails.layouts.base')

@section('title', 'Surat Siap Diverifikasi')

@section('content')
    <h2>🛡️ Surat Approved — Siap Diverifikasi</h2>

    <p>Halo <strong>Tim Security</strong>,</p>

    <p>Sebuah surat telah <strong>disetujui sepenuhnya</strong> oleh semua level approver dan siap untuk verifikasi lapangan.</p>

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
                <td class="label">Vendor</td>
                <td class="value">{{ $requestModel->vendor->company_name ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">PIC Vendor</td>
                <td class="value">{{ $requestModel->vendor->pic_name ?? '-' }} ({{ $requestModel->vendor->pic_phone ?? '-' }})</td>
            </tr>
            <tr>
                <td class="label">Status</td>
                <td class="value">
                    <span class="status-badge status-approved">DISETUJUI — SIAP VERIFIKASI</span>
                </td>
            </tr>
        </table>
    </div>

    @if($requestModel->sikmDetail)
        <div class="alert alert-info">
            <strong>📦 Detail Barang:</strong>
            <br>Lantai Asal: {{ $requestModel->sikmDetail->origin_floor ?? '-' }}, Unit: {{ $requestModel->sikmDetail->origin_unit ?? '-' }}
            <br>Tujuan: {{ $requestModel->sikmDetail->dest_address ?? '-' }}
            <br>Jadwal: {{ $requestModel->sikmDetail->start_date }} ({{ $requestModel->sikmDetail->start_time }} - {{ $requestModel->sikmDetail->end_time }})
        </div>
    @endif

    @if($requestModel->sikDetail)
        <div class="alert alert-info">
            <strong>🔨 Detail Pekerjaan:</strong>
            <br>Jenis: {{ $requestModel->sikDetail->job_type ?? '-' }}
            <br>Lokasi: {{ $requestModel->sikDetail->location ?? '-' }}
            <br>Jumlah Pekerja: {{ $requestModel->sikDetail->worker_count ?? '-' }} orang
            <br>Jadwal: {{ $requestModel->sikDetail->start_date }} s/d {{ $requestModel->sikDetail->end_date }}
        </div>
    @endif

    <div class="alert alert-warning">
        <strong>📋 Instruksi:</strong>
        <ol style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8;">
            <li>Vendor akan datang dengan <strong>QR Code</strong></li>
            <li>Scan QR Code melalui aplikasi Security</li>
            <li>Verifikasi kesesuaian data dengan kondisi lapangan</li>
            <li>Upload foto evidence sebagai bukti</li>
        </ol>
    </div>

    <p style="text-align: center; margin-top: 24px;">
        <a href="{{ url('/security/dashboard') }}" class="btn btn-primary">
            Buka Dashboard Security
        </a>
    </p>
@endsection
