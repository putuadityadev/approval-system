import { useState, useEffect, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * Security QR Scanner
 *
 * Halaman untuk scan QR code surat menggunakan camera dengan html5-qrcode library.
 * Didesain full-screen 100vh tanpa scrolling (standalone modal feel).
 */
export default function Scanner({ errors }) {
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [lastScan, setLastScan] = useState(null);
    const html5QrCodeRef = useRef(null);
    const scannerDivId = 'qr-reader';

    const startScanning = async () => {
        try {
            setCameraError(null);
            
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode(scannerDivId);
            }

            const qrCodeScanner = html5QrCodeRef.current;
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0, // Or let it be responsive
            };

            await qrCodeScanner.start(
                { facingMode: "environment" },
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

    const onScanSuccess = (decodedText, decodedResult) => {
        if (lastScan && Date.now() - lastScan < 3000) {
            return;
        }

        setLastScan(Date.now());
        submitQrCode(decodedText);
    };

    const onScanFailure = (error) => {
        // Normal, ignore
    };

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
                setProcessing(false);
                setTimeout(() => {
                    startScanning();
                }, 2000);
            }
        });
    };

    useEffect(() => {
        // Auto start scanning if camera is available
        startScanning();
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(err => {
                    console.error('Error stopping scanner on unmount:', err);
                });
            }
        };
    }, []);

    return (
        <div className="bg-black h-[100dvh] w-full text-white font-sans antialiased flex flex-col relative overflow-hidden">
            {/* Custom Styles for Html5Qrcode to force full screen cover */}
            <style dangerouslySetInnerHTML={{__html: `
                #qr-reader {
                    border: none !important;
                    width: 100% !important;
                    height: 100% !important;
                    position: absolute !important;
                    top: 0;
                    left: 0;
                }
                #qr-reader video {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                #qr-reader__scan_region {
                    background: black;
                    width: 100% !important;
                    height: 100% !important;
                }
                /* Hide everything else */
                #qr-reader__dashboard_section_csr span,
                #qr-reader__dashboard_section_swaplink {
                    display: none !important;
                }
            `}} />

            {/* Header (Absolute, overlay on top of camera) */}
            <header className="absolute top-0 left-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent text-white flex justify-between items-center px-4 pt-safe pb-6 h-24">
                <Link href={route('security.dashboard')} className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </Link>
                <h1 className="font-bold text-lg drop-shadow-md">Scan QR Code</h1>
                <div className="w-10 h-10"></div>
            </header>

            {/* Main Scanner Area */}
            <main className="flex-1 w-full h-full relative">
                
                {/* The Div where Html5Qrcode injects its elements */}
                <div id={scannerDivId} className="w-full h-full bg-black relative z-10"></div>

                {/* Fallback Screen when Camera is Stopped */}
                {!scanning && !processing && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-900">
                        <span className="material-symbols-outlined text-6xl text-slate-600 mb-3">no_photography</span>
                        <p className="text-slate-400 font-bold tracking-wide">CAMERA PAUSED</p>
                    </div>
                )}

                {/* Processing Overlay */}
                {processing && (
                    <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-bold">Verifying Code...</p>
                    </div>
                )}

                {/* Errors Overlay */}
                {(errors?.qr_content || cameraError) && (
                    <div className="absolute top-24 left-4 right-4 z-50 bg-red-500 text-white p-4 rounded-2xl text-sm font-medium shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                        <span className="material-symbols-outlined text-2xl">error</span>
                        <div className="flex-1 leading-relaxed mt-0.5">
                            {errors?.qr_content || cameraError}
                        </div>
                    </div>
                )}
            </main>

            {/* Controls (Absolute, overlay on bottom) */}
            <div className="absolute bottom-0 left-0 w-full p-6 pb-safe bg-gradient-to-t from-black via-black/80 to-transparent z-30 pt-16">
                <p className="text-center text-sm text-white/80 mb-6 px-4 drop-shadow-md font-medium">
                    Arahkan kamera ke QR Code surat. Pemindaian akan berjalan otomatis.
                </p>
                <div className="flex justify-center max-w-sm mx-auto">
                    {!scanning ? (
                        <button 
                            onClick={startScanning}
                            disabled={processing}
                            className="w-full bg-primary hover:bg-cyan-600 text-white rounded-2xl py-4 font-bold transition-all active:scale-95 flex justify-center items-center gap-2 shadow-[0_4px_20px_0_rgba(30,141,174,0.5)]"
                        >
                            <span className="material-symbols-outlined text-xl">videocam</span>
                            Start Camera
                        </button>
                    ) : (
                        <button 
                            onClick={stopScanning}
                            disabled={processing}
                            className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-2xl py-4 font-bold transition-all active:scale-95 flex justify-center items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-red-400 text-xl">videocam_off</span>
                            Stop Camera
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
