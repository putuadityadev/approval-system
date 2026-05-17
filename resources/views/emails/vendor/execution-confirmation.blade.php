@extends('emails.layouts.base')

@section('title', 'Surat Selesai Dieksekusi')

@section('content')
    <h2>✅ Surat Selesai Dieksekusi</h2>

    <p>Halo <strong>{{ $requestModel->vendor->pic_name ?? 'Vendor' }}</strong>,</p>

    <p>Surat Anda telah <strong>selesai diverifikasi dan dieksekusi</strong> oleh petugas Security di lapangan.</p>

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
                    <span class="status-badge status-executed">SELESAI</span>
                </td>
            </tr>
            <tr>
                <td class="label">Tanggal Eksekusi</td>
                <td class="value">{{ $requestModel->updated_at->format('d M Y, H:i') }} WIB</td>
            </tr>
        </table>
    </div>

    <div class="alert alert-success">
        <strong>🎉 Proses Selesai!</strong>
        Surat Anda telah melalui seluruh proses dari pengajuan hingga eksekusi lapangan.
        Terima kasih telah menggunakan sistem {{ config('app.name') }}.
    </div>

    <p style="text-align: center; margin-top: 24px;">
        <a href="{{ url('/vendor/requests/' . $requestModel->id) }}" class="btn btn-primary">
            Lihat Detail Lengkap
        </a>
    </p>
@endsection
