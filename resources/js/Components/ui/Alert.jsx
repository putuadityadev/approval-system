/**
 * Alert
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan pesan notifikasi dengan berbagai tipe (success/error/warning/info)
 * - Styling berbeda untuk setiap tipe dengan warna dan icon yang sesuai
 * - Digunakan untuk flash messages, validation errors, atau notifikasi umum
 *
 * Cara kerjanya:
 * 1. Menerima props type dan message
 * 2. Menentukan warna background, border, text, dan icon berdasarkan type
 * 3. Render alert box dengan icon dan message
 *
 * Props:
 * - type: string (default: 'info') — tipe alert (success/error/warning/info)
 * - message: string (required) — pesan yang ditampilkan
 * - className: string — class tambahan untuk custom styling
 */

function Alert({ type = 'info', message, className = '' }) {
    /**
     * getAlertConfig
     *
     * Menentukan konfigurasi styling dan icon berdasarkan type alert.
     * Setiap type punya warna background, border, text, dan icon yang berbeda.
     */
    const getAlertConfig = () => {
        const configs = {
            success: {
                bgColor: 'bg-green-50',
                borderColor: 'border-green-400',
                textColor: 'text-green-800',
                iconColor: 'text-green-400',
                icon: (
                    // Checkmark icon
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
                    // X Circle icon
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
                    // Exclamation Triangle icon
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
                    // Information Circle icon
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

    const config = getAlertConfig();

    // Jika tidak ada message, jangan render apa-apa
    if (!message) {
        return null;
    }

    return (
        <div
            className={`
                flex items-start p-4 rounded-md border
                ${config.bgColor}
                ${config.borderColor}
                ${className}
            `}
            role="alert"
        >
            {/* Icon */}
            <div className={`flex-shrink-0 ${config.iconColor}`}>
                {config.icon}
            </div>

            {/* Message */}
            <div className={`ml-3 flex-1 ${config.textColor}`}>
                <p className="text-sm font-medium">{message}</p>
            </div>
        </div>
    );
}

export default Alert;
