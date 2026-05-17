@extends('emails.layouts.base')

@section('title', 'Surat Ditolak')

@section('content')
    <h2>⚠️ Surat Anda Ditolak</h2>

    <p>Halo <strong>{{ $requestModel->vendor->pic_name ?? 'Vendor' }}</strong>,</p>

    <p>Mohon maaf, surat Anda telah <strong>ditolak</strong> oleh <strong>{{ $approver->getRoleDisplayName() }}</strong>.</p>

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
                <td class="label">Ditolak oleh</td>
                <td class="value">{{ $approver->getRoleDisplayName() }}</td>
            </tr>
            <tr>
                <td class="label">Status</td>
                <td class="value">
                    <span class="status-badge status-rejected">DITOLAK</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="alert alert-danger">
        <strong>❌ Alasan Penolakan:</strong>
        <p style="margin: 8px 0 0 0; font-style: italic;">
            "{{ $reason }}"
        </p>
    </div>

    <div class="alert alert-info">
        <strong>💡 Apa yang bisa Anda lakukan?</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8;">
            <li>Periksa kembali dokumen Anda sesuai alasan penolakan di atas</li>
            <li>Perbaiki dan ajukan surat baru melalui sistem</li>
            <li>Hubungi tim terkait jika ada pertanyaan</li>
        </ul>
    </div>

    <p style="text-align: center; margin-top: 24px;">
        <a href="{{ url('/vendor/requests/' . $requestModel->id) }}" class="btn btn-secondary" style="margin-right: 8px;">
            Lihat Detail
        </a>
        <a href="{{ url('/vendor/requests/create') }}" class="btn btn-primary">
            Ajukan Surat Baru
        </a>
    </p>
@endsection
