@extends('emails.layouts.base')

@section('title', 'Surat Disetujui')

@section('content')
    <h2>✅ Surat Anda Disetujui</h2>

    <p>Halo <strong>{{ $requestModel->vendor->pic_name ?? 'Vendor' }}</strong>,</p>

    <p>Surat Anda telah <strong>disetujui</strong> oleh <strong>{{ $approver->getRoleDisplayName() }}</strong> dan diteruskan ke level approval berikutnya.</p>

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
                <td class="label">Disetujui oleh</td>
                <td class="value">{{ $approver->getRoleDisplayName() }}</td>
            </tr>
            <tr>
                <td class="label">Status Saat Ini</td>
                <td class="value">
                    <span class="status-badge status-pending">{{ $requestModel->getStatusLabel() }}</span>
                </td>
            </tr>
        </table>
    </div>

    {{-- Progress Bar --}}
    <div class="progress-container">
        <p style="font-size: 13px; color: #64748b; margin-bottom: 8px;">
            <strong>Progress Approval:</strong> {{ $currentStep }} dari {{ $totalSteps }} level
        </p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: {{ $progressPercent }}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: #94a3b8;">
            <span style="{{ $currentStep >= 1 ? 'color: #2563eb; font-weight: 600;' : '' }}">Dept ✓</span>
            <span style="{{ $currentStep >= 2 ? 'color: #2563eb; font-weight: 600;' : '' }}">{{ $currentStep >= 2 ? 'Ops ✓' : 'Ops' }}</span>
            <span style="{{ $currentStep >= 3 ? 'color: #2563eb; font-weight: 600;' : '' }}">{{ $currentStep >= 3 ? 'Finance ✓' : 'Finance' }}</span>
            <span style="{{ $currentStep >= 4 ? 'color: #2563eb; font-weight: 600;' : '' }}">{{ $currentStep >= 4 ? 'GM ✓' : 'GM' }}</span>
        </div>
    </div>

    <div class="alert alert-success">
        <strong>📊 Status:</strong> Surat Anda sudah melewati {{ $currentStep }} dari {{ $totalSteps }} level approval.
        Silakan tunggu notifikasi selanjutnya.
    </div>

    <p style="text-align: center; margin-top: 24px;">
        <a href="{{ url('/vendor/requests/' . $requestModel->id) }}" class="btn btn-primary">
            Lihat Detail Surat
        </a>
    </p>
@endsection
