<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', config('app.name'))</title>
    <style>
        /* Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a2e;
            background-color: #f0f2f5;
            margin: 0;
            padding: 0;
            width: 100%;
        }

        .email-wrapper {
            width: 100%;
            background-color: #f0f2f5;
            padding: 30px 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            padding: 28px 30px;
            text-align: center;
        }

        .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        .email-header .subtitle {
            color: rgba(255,255,255,0.85);
            font-size: 13px;
            margin-top: 4px;
        }

        /* Body */
        .email-body {
            padding: 30px;
        }

        .email-body h2 {
            color: #1a1a2e;
            font-size: 18px;
            margin: 0 0 16px 0;
            font-weight: 600;
        }

        .email-body p {
            color: #4a4a68;
            font-size: 14px;
            margin: 0 0 12px 0;
            line-height: 1.7;
        }

        /* Info Box */
        .info-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 18px;
            margin: 18px 0;
        }

        .info-box table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-box td {
            padding: 6px 0;
            font-size: 13px;
            vertical-align: top;
        }

        .info-box .label {
            color: #64748b;
            width: 140px;
            font-weight: 500;
        }

        .info-box .value {
            color: #1a1a2e;
            font-weight: 600;
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-approved { background-color: #dcfce7; color: #166534; }
        .status-rejected { background-color: #fee2e2; color: #991b1b; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-executed { background-color: #dbeafe; color: #1e40af; }
        .status-cancelled { background-color: #f1f5f9; color: #475569; }
        .status-submitted { background-color: #e0e7ff; color: #3730a3; }

        /* Progress Bar */
        .progress-container {
            margin: 20px 0;
        }

        .progress-bar {
            width: 100%;
            background-color: #e2e8f0;
            border-radius: 10px;
            height: 10px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #2563eb, #3b82f6);
            border-radius: 10px;
            transition: width 0.3s ease;
        }

        .progress-label {
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
            text-align: center;
        }

        /* Button */
        .btn {
            display: inline-block;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
        }

        .btn-primary {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            color: #ffffff !important;
        }

        .btn-secondary {
            background-color: #f1f5f9;
            color: #475569 !important;
            border: 1px solid #e2e8f0;
        }

        /* Alert Boxes */
        .alert {
            padding: 14px 18px;
            border-radius: 8px;
            margin: 16px 0;
            font-size: 13px;
        }

        .alert-success {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            color: #166534;
        }

        .alert-warning {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            color: #92400e;
        }

        .alert-danger {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            color: #991b1b;
        }

        .alert-info {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            color: #1e40af;
        }

        /* Divider */
        .divider {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 20px 0;
        }

        /* Footer */
        .email-footer {
            background-color: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .email-footer p {
            font-size: 11px;
            color: #94a3b8;
            margin: 4px 0;
            line-height: 1.5;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container { margin: 0 10px; }
            .email-body { padding: 20px; }
            .email-header { padding: 20px; }
            .info-box .label { width: 110px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            {{-- Header --}}
            <div class="email-header">
                <h1>{{ config('app.name') }}</h1>
                <div class="subtitle">Sistem Manajemen Approval Surat</div>
            </div>

            {{-- Body --}}
            <div class="email-body">
                @yield('content')
            </div>

            {{-- Footer --}}
            <div class="email-footer">
                <p>Email ini dikirim secara otomatis oleh sistem {{ config('app.name') }}.</p>
                <p>Mohon tidak membalas email ini.</p>
                <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
