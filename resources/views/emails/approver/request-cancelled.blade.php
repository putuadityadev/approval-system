@extends('emails.layouts.base')

@section('title', 'Surat Dibatalkan')

@section('content')
    <h2>🚫 Surat Dibatalkan oleh Vendor</h2>

    <p>Halo <strong>Approver</strong>,</p>

    <p>Surat yang sebelumnya ada di antrian approval Anda telah <strong>dibatalkan oleh vendor</strong>. Tidak diperlukan tindakan lebih lanjut untuk surat ini.</p>

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
                <td class="label">Status</td>
                <td class="value">
                    <span class="status-badge status-cancelled">DIBATALKAN</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="alert alert-warning">
        <strong>📝 Alasan Pembatalan:</strong>
        <p style="margin: 8px 0 0 0; font-style: italic;">
            "{{ $reason }}"
        </p>
    </div>

    <p style="font-size: 13px; color: #64748b;">
        Surat ini telah dihapus dari antrian approval Anda. Tidak ada tindakan yang perlu dilakukan.
    </p>
@endsection
