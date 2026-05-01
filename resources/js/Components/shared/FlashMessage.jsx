/**
 * FlashMessage
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan flash message dari backend (success/error/warning/info)
 * - Auto-dismiss setelah 5 detik
 * - Animasi fade in saat muncul dan fade out saat hilang
 * - Tombol close manual untuk dismiss sebelum 5 detik
 *
 * Cara kerjanya:
 * 1. Menerima message dan type dari props
 * 2. Menggunakan state untuk kontrol visibility
 * 3. Set timeout 5 detik untuk auto-dismiss
 * 4. Cleanup timeout saat component unmount
 * 5. Animasi fade in/out dengan Tailwind transition classes
 *
 * Props:
 * - message: string — pesan yang ditampilkan
 * - type: string (default: 'info') — tipe message (success/error/warning/info)
 * - duration: number (default: 5000) — durasi dalam ms sebelum auto-dismiss
 * - onClose: function — callback yang dipanggil saat message di-dismiss
 * - className: string — class tambahan untuk custom styling
 *
 * Requirements: 6.4
 */

import { useState, useEffect } from 'react';

function FlashMessage({
    message,
    type = 'info',
    duration = 5000,
    onClose,
    className = '',
}) {
    // State untuk kontrol visibility dan animasi
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    /**
     * useEffect untuk auto-dismiss
     *
     * Set timeout untuk mulai animasi fade out setelah duration.
     * Cleanup timeout saat component unmount untuk avoid memory leak.
     */
    useEffect(() => {
        if (!message) return;

        // Set timeout untuk mulai fade out
        const fadeOutTimer = setTimeout(() => {
            handleDismiss();
        }, duration);

        // Cleanup timeout saat unmount
        return () => {
            clearTimeout(fadeOutTimer);
        };
    }, [message, duration]);

    /**
     * handleDismiss
     *
     * Memulai animasi fade out dan hide component setelah animasi selesai.
     * Memanggil onClose callback jika ada.
     */
    const handleDismiss = () => {
        // Mulai animasi fade out
        setIsExiting(true);

        // Tunggu animasi selesai (300ms) baru hide component
        setTimeout(() => {
            setIsVisible(false);

            // Panggil onClose callback jika ada
            if (onClose) {
                onClose();
            }
        }, 300);
    };

    /**
     * getMessageConfig
     *
     * Menentukan konfigurasi styling dan icon berdasarkan type message.
     * Sama seperti Alert component untuk konsistensi.
     */
    const getMessageConfig = () => {
        const configs = {
            success: {
                bgColor: 'bg-green-50',
                borderColor: 'border-green-400',
                textColor: 'text-green-800',
                iconColor: 'text-green-400',
                icon: (
                    <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                        />
                    </svg>
                ),
            },
            error: {
                bgColor: 'bg-red-50',
                borderColor: 'border-red-400',
                textColor: 'text-red-800',
                iconColor: 'text-red-400',
                icon: (
                    <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                            clipRule="evenodd"
                        />
                    </svg>
                ),
            },
            warning: {
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-400',
                textColor: 'text-yellow-800',
                iconColor: 'text-yellow-400',
                icon: (
                    <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                        />
                    </svg>
                ),
            },
            info: {
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-400',
                textColor: 'text-blue-800',
                iconColor: 'text-blue-400',
                icon: (
                    <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                ),
            },
        };

        return configs[type] || configs.info;
    };

    const config = getMessageConfig();

    // Jika tidak ada message atau sudah di-dismiss, jangan render apa-apa
    if (!message || !isVisible) {
        return null;
    }

    return (
        <div
            className={`
                fixed top-4 right-4 z-50 max-w-md w-full
                transition-all duration-300 ease-in-out
                ${isExiting ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0'}
                ${className}
            `}
            role="alert"
            aria-live="polite"
        >
            <div
                className={`
                    flex items-start p-4 rounded-lg border shadow-lg
                    ${config.bgColor}
                    ${config.borderColor}
                `}
            >
                {/* Icon */}
                <div className={`flex-shrink-0 ${config.iconColor}`}>
                    {config.icon}
                </div>

                {/* Message */}
                <div className={`ml-3 flex-1 ${config.textColor}`}>
                    <p className="text-sm font-medium">{message}</p>
                </div>

                {/* Close button */}
                <button
                    type="button"
                    onClick={handleDismiss}
                    className={`
                        ml-3 flex-shrink-0 inline-flex rounded-md
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${config.iconColor} hover:opacity-75
                        transition-opacity duration-200
                    `}
                    aria-label="Tutup notifikasi"
                >
                    <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default FlashMessage;
