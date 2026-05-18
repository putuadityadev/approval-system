import { useState, useEffect, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * Security QR Scanner — QRIS-style
 *
 * Desktop: centered modal card layout
 * Mobile: full-screen camera, no zoom
 * Camera feed always shown at natural resolution (object-fit: contain) so it stays sharp.
 */
export default function Scanner({ errors }) {
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [lastScan, setLastScan] = useState(null);
    const [scanFeedback, setScanFeedback] = useState(null);
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
                fps: 15,
                // Scan 80% of the viewfinder — QR doesn't need to be dead-center
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    const side = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.8);
                    return { width: side, height: side };
                },
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true,
                },
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

    const onScanSuccess = (decodedText) => {
        if (lastScan && Date.now() - lastScan < 3000) return;
        setLastScan(Date.now());
        setScanFeedback('detected');
        submitQrCode(decodedText);
    };

    const onScanFailure = () => {
        // Normal scan miss — ignore
    };

    const submitQrCode = async (qrContent) => {
        setProcessing(true);
        await stopScanning();

        router.post(route('security.scan'), {
            qr_content: qrContent,
        }, {
            onFinish: () => {
                setProcessing(false);
                setScanFeedback(null);
            },
            onError: () => {
                setProcessing(false);
                setScanFeedback(null);
                setTimeout(() => startScanning(), 2000);
            }
        });
    };

    useEffect(() => {
        startScanning();
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(() => {});
            }
        };
    }, []);

    /* ─── Corner bracket component ─── */
    const CornerBrackets = () => (
        <div className="scanner-corners">
            <div className="corner tl" />
            <div className="corner tr" />
            <div className="corner bl" />
            <div className="corner br" />
            <div className="scan-line" />
        </div>
    );

    return (
        <>
            {/* ─── Global styles for html5-qrcode overrides ─── */}
            <style dangerouslySetInnerHTML={{__html: `
                /* ── html5-qrcode internals ── */
                #qr-reader {
                    border: none !important;
                    background: #000 !important;
                    position: relative !important;
                    width: 100% !important;
                    height: 100% !important;
                }
                #qr-reader video {
                    /* CONTAIN = no zoom, shows full camera feed at native aspect ratio */
                    object-fit: contain !important;
                    width: 100% !important;
                    height: 100% !important;
                    display: block !important;
                    background: #000 !important;
                }
                #qr-reader__scan_region {
                    background: transparent !important;
                    min-height: 0 !important;
                }
                /* Hide ALL library UI chrome */
                #qr-reader__scan_region > img,
                #qr-reader__scan_region > canvas,
                #qr-reader__dashboard_section_csr,
                #qr-reader__dashboard_section_swaplink,
                #qr-reader__header_message,
                #qr-reader__status_span,
                #qr-reader__dashboard,
                #qr-shaded-region {
                    display: none !important;
                }

                /* ── Corner bracket overlay ── */
                .scanner-corners {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: none;
                    z-index: 20;
                }
                .scanner-corners .corner {
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    border-color: rgba(255,255,255,0.85);
                    border-style: solid;
                    border-width: 0;
                }
                .scanner-corners .tl { top: 15%; left: 15%; border-top-width: 3px; border-left-width: 3px; border-radius: 6px 0 0 0; }
                .scanner-corners .tr { top: 15%; right: 15%; border-top-width: 3px; border-right-width: 3px; border-radius: 0 6px 0 0; }
                .scanner-corners .bl { bottom: 15%; left: 15%; border-bottom-width: 3px; border-left-width: 3px; border-radius: 0 0 0 6px; }
                .scanner-corners .br { bottom: 15%; right: 15%; border-bottom-width: 3px; border-right-width: 3px; border-radius: 0 0 6px 0; }

                /* Animated scan line between corners */
                .scan-line {
                    position: absolute;
                    left: 15%;
                    right: 15%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #1e8dae, transparent);
                    opacity: 0.7;
                    animation: scanLineMove 2.5s ease-in-out infinite;
                }
                @keyframes scanLineMove {
                    0%, 100% { top: 16%; }
                    50%       { top: 83%; }
                }

                /* ── Responsive layout ── */
                /* Mobile: full-screen camera */
                @media (max-width: 767px) {
                    .scanner-page {
                        position: fixed;
                        inset: 0;
                        background: #000;
                        display: flex;
                        flex-direction: column;
                        z-index: 100;
                    }
                    .scanner-viewport {
                        flex: 1;
                        position: relative;
                        overflow: hidden;
                        background: #000;
                    }
                }

                /* Desktop: centered modal card */
                @media (min-width: 768px) {
                    .scanner-page {
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.7);
                        backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 100;
                        padding: 2rem;
                    }
                    .scanner-modal {
                        background: #111;
                        border-radius: 1.25rem;
                        overflow: hidden;
                        width: 100%;
                        max-width: 560px;
                        box-shadow: 0 25px 60px rgba(0,0,0,0.5);
                        display: flex;
                        flex-direction: column;
                    }
                    .scanner-viewport {
                        position: relative;
                        width: 100%;
                        /* 4:3 aspect ratio container — matches most webcams */
                        aspect-ratio: 4 / 3;
                        overflow: hidden;
                        background: #000;
                    }
                }

                /* Green flash on scan */
                @keyframes flashBorder {
                    0% { box-shadow: inset 0 0 0 4px rgba(74,222,128,0.9); }
                    100% { box-shadow: inset 0 0 0 4px rgba(74,222,128,0); }
                }
            `}} />

            <div className="scanner-page text-white font-sans antialiased">
                {/* Desktop: wraps everything in a card. Mobile: ignored. */}
                <div className="scanner-modal md:max-w-[560px] w-full flex flex-col h-full md:h-auto">

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-4 py-3 bg-black/60 md:bg-[#111] md:border-b md:border-white/10 z-40 relative">
                        <Link
                            href={route('security.dashboard')}
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-90"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </Link>
                        <h1 className="font-bold text-base tracking-wide">Scan QR Code</h1>
                        <div className="w-9 h-9" />
                    </div>

                    {/* ── Camera viewport ── */}
                    <div className="scanner-viewport">
                        {/* html5-qrcode mounts video here */}
                        <div
                            id={scannerDivId}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                            }}
                        />

                        {/* Corner guide overlay */}
                        {scanning && <CornerBrackets />}

                        {/* Scan detected flash */}
                        {scanFeedback === 'detected' && (
                            <div
                                className="absolute inset-0 z-30 pointer-events-none"
                                style={{ animation: 'flashBorder 0.4s ease-out forwards' }}
                            />
                        )}

                        {/* Camera paused fallback */}
                        {!scanning && !processing && !cameraError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#0a0a0a]">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-3xl text-slate-500">no_photography</span>
                                </div>
                                <p className="text-slate-400 font-semibold text-sm">Camera Paused</p>
                            </div>
                        )}

                        {/* Processing overlay */}
                        {processing && (
                            <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                <div className="w-14 h-14 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-base font-bold">Verifying...</p>
                            </div>
                        )}

                        {/* Error toast */}
                        {(errors?.qr_content || cameraError) && (
                            <div className="absolute bottom-4 left-3 right-3 z-50 bg-red-500/95 backdrop-blur-md text-white px-4 py-3 rounded-xl text-sm font-medium shadow-xl flex items-start gap-2.5">
                                <span className="material-symbols-outlined text-xl flex-shrink-0 mt-px">error</span>
                                <span className="leading-snug">{errors?.qr_content || cameraError}</span>
                            </div>
                        )}
                    </div>

                    {/* ── Bottom controls ── */}
                    <div className="px-4 py-4 bg-black/60 md:bg-[#111] md:border-t md:border-white/10 z-40 relative">
                        <p className="text-center text-xs text-white/60 mb-3 font-medium">
                            Arahkan kamera ke QR Code — scan otomatis
                        </p>
                        <div className="max-w-xs mx-auto">
                            {!scanning ? (
                                <button
                                    onClick={startScanning}
                                    disabled={processing}
                                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-3 font-bold transition-all active:scale-[0.97] flex justify-center items-center gap-2 text-sm shadow-lg disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">videocam</span>
                                    Start Camera
                                </button>
                            ) : (
                                <button
                                    onClick={stopScanning}
                                    disabled={processing}
                                    className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl py-3 font-bold transition-all active:scale-[0.97] flex justify-center items-center gap-2 text-sm"
                                >
                                    <span className="material-symbols-outlined text-red-400 text-lg">videocam_off</span>
                                    Stop Camera
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
