import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * DocumentViewer
 *
 * Komponen reusable untuk menampilkan preview dokumen (image/PDF)
 * dengan fitur zoom in, zoom out, dan reset zoom.
 *
 * Props:
 * - url: string — URL dokumen (image atau PDF)
 * - title: string — Judul dokumen (opsional)
 * - className: string — Kelas tambahan untuk wrapper (opsional)
 */
export default function DocumentViewer({ url, title = 'Preview Dokumen', className = '' }) {
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const isPdf = url && (
        url.toLowerCase().includes('.pdf') ||
        url.toLowerCase().includes('application/pdf') ||
        url.includes('content-type=application%2Fpdf')
    );

    const MIN_SCALE = 0.3;
    const MAX_SCALE = 5;
    const SCALE_STEP = 0.25;

    const zoomIn = useCallback(() => setScale(s => Math.min(s + SCALE_STEP, MAX_SCALE)), []);
    const zoomOut = useCallback(() => {
        setScale(s => {
            const newScale = Math.max(s - SCALE_STEP, MIN_SCALE);
            if (newScale <= 1) setPosition({ x: 0, y: 0 });
            return newScale;
        });
    }, []);
    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Mouse drag untuk pan (hanya kalau sudah dizoom)
    const handleMouseDown = (e) => {
        if (scale <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    // Attach wheel event dengan passive:false agar preventDefault() bisa memblokir
    // native browser zoom/scroll saat cursor berada di atas viewer area.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onWheel = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.deltaY < 0) zoomIn();
            else zoomOut();
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [zoomIn, zoomOut]);

    if (!url) {
        return (
            <div className={`border-2 border-dashed border-slate-200 rounded-xl p-10 text-center bg-slate-50 ${className}`}>
                <span className="material-symbols-outlined text-slate-300 text-[48px] block mb-3">image_not_supported</span>
                <p className="text-sm font-bold text-slate-500">Tidak ada dokumen</p>
                <p className="text-xs text-slate-400 mt-1">Dokumen belum diunggah</p>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border border-slate-200 overflow-hidden bg-slate-100 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                        {isPdf ? 'picture_as_pdf' : 'image'}
                    </span>
                    {title}
                </span>
                <div className="flex items-center gap-1">
                    {/* Zoom out */}
                    <button
                        onClick={zoomOut}
                        disabled={scale <= MIN_SCALE}
                        title="Zoom Out"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">zoom_out</span>
                    </button>

                    {/* Zoom level pill */}
                    <button
                        onClick={resetZoom}
                        title="Reset Zoom"
                        className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors min-w-[52px] text-center"
                    >
                        {Math.round(scale * 100)}%
                    </button>

                    {/* Zoom in */}
                    <button
                        onClick={zoomIn}
                        disabled={scale >= MAX_SCALE}
                        title="Zoom In"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                    </button>

                    <div className="w-px h-4 bg-slate-200 mx-1" />

                    {/* Open in new tab */}
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Buka di Tab Baru"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                    </a>
                </div>
            </div>

            {/* Viewer Area */}
            <div
                ref={containerRef}
                className="relative overflow-hidden"
                style={{
                    height: isPdf ? '640px' : '520px',
                    cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {isPdf ? (
                    /* PDF via iframe — tidak bisa di-zoom native, buka fullscreen */
                    <iframe
                        src={url}
                        className="w-full h-full border-0"
                        title={title}
                    />
                ) : (
                    /* Image dengan transform zoom + pan */
                    <div className="w-full h-full flex items-center justify-center p-3">
                        <img
                            src={url}
                            alt={title}
                            draggable={false}
                            style={{
                                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                                transformOrigin: 'center center',
                                transition: isDragging ? 'none' : 'transform 0.15s ease',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                userSelect: 'none',
                            }}
                            onError={(e) => {
                                e.target.parentNode.innerHTML = `
                                    <div class="flex flex-col items-center justify-center h-full gap-3">
                                        <span class="material-symbols-outlined text-red-300 text-[48px]">broken_image</span>
                                        <p class="text-sm font-bold text-slate-500">Gagal memuat gambar</p>
                                        <a href="${url}" target="_blank" class="text-xs font-bold text-primary underline">Buka di tab baru</a>
                                    </div>`;
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Footer hint */}
            {!isPdf && scale === 1 && (
                <div className="px-4 py-2 bg-white border-t border-slate-100 text-center">
                    <p className="text-[11px] text-slate-400">
                        Scroll atau gunakan tombol <strong>+/-</strong> untuk zoom · Klik % untuk reset
                    </p>
                </div>
            )}
            {!isPdf && scale > 1 && (
                <div className="px-4 py-2 bg-white border-t border-slate-100 text-center">
                    <p className="text-[11px] text-slate-400">
                        Drag untuk geser gambar · Klik <strong>{Math.round(scale * 100)}%</strong> untuk reset
                    </p>
                </div>
            )}
        </div>
    );
}
