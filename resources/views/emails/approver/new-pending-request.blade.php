@extends('emails.layouts.base')

@section('title', 'Surat Baru Menunggu Approval')

@section('content')
    <h2>🔔 Surat Baru Menunggu Approval Anda</h2>

    <p>Halo <strong>Approver {{ $approverRoleLabel }}</strong>,</p>

    <p>Ada surat baru dari vendor yang memerlukan <strong>persetujuan Anda</strong>. Silakan review dan proses surat berikut:</p>

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
                <td class="label">Tanggal Pengajuan</td>
                <td class="value">{{ $requestModel->created_at->format('d M Y, H:i') }} WIB</td>
            </tr>
            <tr>
                <td class="label">Level Approval</td>
                <td class="value">
                    <span class="status-badge status-pending">{{ $approverRoleLabel }}</span>
                </td>
            </tr>
        </table>
    </div>

    @if($requestModel->sikmDetail)
        <div class="alert alert-info">
            <strong>📦 Detail Barang:</strong>
            <br>Lantai Asal: {{ $requestModel->sikmDetail->origin_floor ?? '-' }}
            <br>Tujuan: {{ $requestModel->sikmDetail->dest_address ?? '-' }}
            <br>Waktu: {{ $requestModel->sikmDetail->start_date }} s/d {{ $requestModel->sikmDetail->end_date }}
        </div>
    @endif

    @if($requestModel->sikDetail)
        <div class="alert alert-info">
            <strong>🔨 Detail Pekerjaan:</strong>
            <br>Jenis: {{ $requestModel->sikDetail->job_type ?? '-' }}
            <br>Lokasi: {{ $requestModel->sikDetail->location ?? '-' }}
            <br>Jumlah Pekerja: {{ $requestModel->sikDetail->worker_count ?? '-' }} orang
            <br>Waktu: {{ $requestModel->sikDetail->start_date }} s/d {{ $requestModel->sikDetail->end_date }}
        </div>
    @endif

    <div class="alert alert-warning">
        <strong>⏰ Perhatian:</strong> Mohon segera proses surat ini untuk menghindari keterlambatan.
    </div>

    <p style="text-align: center; margin-top: 24px;">
        <a href="{{ url('/approver/requests/' . $requestModel->id) }}" class="btn btn-primary">
            Review & Proses Surat
        </a>
    </p>
@endsection
