/**
 * Security QR Scanner
 *
 * Halaman untuk scan QR code surat menggunakan camera dengan html5-qrcode library.
 *
 * Cara kerja:
 * 1. Request camera permission
 * 2. Scan QR code dari camera menggunakan Html5Qrcode
 * 3. Decode QR content otomatis
 * 4. Submit ke backend untuk validasi
 * 5. Redirect ke request detail jika valid
 *
 * Props:
 * - auth: object — data user yang sedang login
 * - errors: object — validation errors dari backend
 */

import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/ui/Button';
import ValidationErrors from '@/Components/shared/ValidationErrors';

function Scanner({ auth, errors }) {
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [lastScan, setLastScan] = useState(null);
    const html5QrCodeRef = useRef(null);
    const scannerDivId = 'qr-reader';

    /**
     * Start camera dan scanning dengan html5-qrcode
     */
    const startScanning = async () => {
        try {
            setCameraError(null);
            
            // Initialize Html5Qrcode jika belum ada
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode(scannerDivId);
            }

            const qrCodeScanner = html5QrCodeRef.current;

            // Configuration untuk scanning
            const config = {
                fps: 10, // Frame per second untuk scanning
                qrbox: { width: 250, height: 250 }, // Scanning box size
                aspectRatio: 1.0, // Square aspect ratio
            };

            // Start scanning
            await qrCodeScanner.start(
                { facingMode: "environment" }, // Use back camera
                config,
                onScanSuccess,
                onScanFailure
            );

            setScanning(true);

        } catch (error) {
            console.error('Camera error:', error);
            setCameraError('Tidak dapat mengakses camera. Pastikan permission sudah diberikan.');
        }
    };

    /**
     * Stop camera dan scanning
     */
    const stopScanning = async () => {
        try {
            if (html5QrCodeRef.current && scanning) {
                await html5QrCodeRef.current.stop();
                setScanning(false);
            }
        } catch (error) {
            console.error('Error stopping scanner:', error);
        }
    };

    /**
     * Callback saat QR code berhasil di-scan
     */
    const onScanSuccess = (decodedText, decodedResult) => {
        // Prevent duplicate scan dalam 3 detik
        if (lastScan && Date.now() - lastScan < 3000) {
            return;
        }

        setLastScan(Date.now());
        console.log('QR Code detected:', decodedText);

        // Submit QR content ke backend
        submitQrCode(decodedText);
    };

    /**
     * Callback saat scan gagal (normal, terus scanning)
     */
    const onScanFailure = (error) => {
        // Ini normal, QR belum terdeteksi
        // Tidak perlu log karena akan spam console
    };

    /**
     * Submit QR content ke backend
     */
    const submitQrCode = async (qrContent) => {
        setProcessing(true);
        await stopScanning();

        router.post(route('security.scan'), {
            qr_content: qrContent,
        }, {
            onFinish: () => {
                setProcessing(false);
            },
            onError: () => {
                // Restart scanning jika error
                setProcessing(false);
                setTimeout(() => {
                    startScanning();
                }, 2000);
            }
        });
    };

    /**
     * Manual input nomor seri dokumen (untuk testing)
     */
    const [manualInput, setManualInput] = useState('');
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualInput.trim()) {
            setProcessing(true);
            stopScanning();

            router.post(route('security.scan.by.serial'), {
                document_serial_no: manualInput.trim(),
            }, {
                onFinish: () => {
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                }
            });
        }
    };

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(err => {
                    console.error('Error stopping scanner on unmount:', err);
                });
            }
        };
    }, []);

    return (
        <AuthenticatedLayout auth={auth}>
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Scan QR Code
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Arahkan camera ke QR code pada surat untuk memulai verifikasi
                        </p>
                    </div>

                    <ValidationErrors errors={errors} />

                    {/* Scanner Container */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            {/* Camera Error */}
                            {cameraError && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-red-800">Camera Error</h3>
                                            <p className="text-sm text-red-700 mt-1">{cameraError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* QR Reader Container */}
                            <div className="relative">
                                <div id={scannerDivId} className="rounded-lg overflow-hidden"></div>
                                
                                {/* Processing overlay */}
                                {processing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-lg z-10">
                                        <div className="text-center text-white">
                                            <svg className="animate-spin h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <p className="text-lg font-medium">Memproses QR Code...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Placeholder saat tidak scanning */}
                                {!scanning && !processing && (
                                    <div className="bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white py-32">
                                        <svg className="w-24 h-24 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                        <p className="text-lg font-medium">Camera Tidak Aktif</p>
                                        <p className="text-sm text-gray-400 mt-2">Klik tombol "Mulai Scan" untuk mengaktifkan camera</p>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="mt-6 flex gap-4 justify-center">
                                {!scanning ? (
                                    <Button
                                        variant="primary"
                                        onClick={startScanning}
                                        disabled={processing}
                                        className="flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Mulai Scan
                                    </Button>
                                ) : (
                                    <Button
                                        variant="danger"
                                        onClick={stopScanning}
                                        disabled={processing}
                                        className="flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Stop Scan
                                    </Button>
                                )}
                            </div>

                            {/* Scanning Tips */}
                            {scanning && !processing && (
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-blue-900 mb-1">Tips Scanning</h3>
                                            <ul className="text-xs text-blue-800 space-y-1">
                                                <li>• Pastikan QR code berada dalam kotak hijau</li>
                                                <li>• Jaga jarak 15-30 cm dari camera</li>
                                                <li>• Pastikan pencahayaan cukup terang</li>
                                                <li>• Hindari refleksi cahaya pada QR code</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manual Input (untuk testing) */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Input Manual (Testing)
                            </h3>
                            <form onSubmit={handleManualSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomor Seri Dokumen
                                    </label>
                                    <input
                                        type="text"
                                        value={manualInput}
                                        onChange={(e) => setManualInput(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contoh: 001518DD"
                                        disabled={processing}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Masukkan nomor seri dokumen yang tertera pada surat (contoh: 001518DD)
                                    </p>
                                    {errors.document_serial_no && (
                                        <p className="text-sm text-red-600 mt-1">
                                            {errors.document_serial_no}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={processing || !manualInput.trim()}
                                >
                                    {processing ? 'Memproses...' : 'Cari Surat'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Scanner;
