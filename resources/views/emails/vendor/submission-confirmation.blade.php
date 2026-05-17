@extends('emails.layouts.base')

@section('title', 'Surat Berhasil Diajukan')

@section('content')
    <h2>📋 Surat Berhasil Diajukan</h2>

    <p>Halo <strong>{{ $requestModel->vendor->pic_name ?? 'Vendor' }}</strong>,</p>

    <p>Surat Anda telah berhasil diajukan dan sedang menunggu proses approval. Berikut detail surat Anda:</p>

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
                <td class="label">Tanggal Pengajuan</td>
                <td class="value">{{ $requestModel->created_at->format('d M Y, H:i') }} WIB</td>
            </tr>
            <tr>
                <td class="label">Status</td>
                <td class="value">
                    <span class="status-badge status-submitted">Menunggu Approval</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="alert alert-info">
        <strong>ℹ️ Informasi:</strong> Surat Anda akan diproses melalui 4 level approval:
        <br>Departemen → Operasional → Finance → GM Operation
        <br>Anda akan menerima notifikasi email di setiap tahap.
    </div>

    <p style="text-align: center; margin-top: 24px;">
        <a href="{{ url('/vendor/requests/' . $requestModel->id) }}" class="btn btn-primary">
            Lihat Detail Surat
        </a>
    </p>
@endsection
