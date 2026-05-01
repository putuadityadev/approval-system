/**
 * ValidationErrors
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan daftar validation errors dari backend (Laravel)
 * - Menerima errors object dari Inertia.js
 * - Styling konsisten dengan Alert component untuk error messages
 *
 * Cara kerjanya:
 * 1. Menerima errors object dari Inertia (format: { field: [error1, error2] })
 * 2. Mengecek apakah ada errors yang perlu ditampilkan
 * 3. Mengubah errors object menjadi array of messages
 * 4. Render list of errors dengan styling merah dan icon warning
 *
 * Props:
 * - errors: object — errors object dari Inertia (key: field name, value: array of error messages)
 * - className: string — class tambahan untuk custom styling
 *
 * Requirements: 11.7
 */

function ValidationErrors({ errors = {}, className = '' }) {
    /**
     * getErrorMessages
     *
     * Mengubah errors object menjadi flat array of error messages.
     * Contoh input: { email: ['Email wajib diisi'], password: ['Password minimal 8 karakter'] }
     * Contoh output: ['Email wajib diisi', 'Password minimal 8 karakter']
     */
    const getErrorMessages = () => {
        const messages = [];

        // Loop semua field yang ada error
        Object.keys(errors).forEach((field) => {
            const fieldErrors = errors[field];

            // Jika fieldErrors adalah array, ambil semua message
            if (Array.isArray(fieldErrors)) {
                messages.push(...fieldErrors);
            }
            // Jika fieldErrors adalah string, push langsung
            else if (typeof fieldErrors === 'string') {
                messages.push(fieldErrors);
            }
        });

        return messages;
    };

    const errorMessages = getErrorMessages();

    // Jika tidak ada error, jangan render apa-apa
    if (errorMessages.length === 0) {
        return null;
    }

    return (
        <div
            className={`
                flex items-start p-4 rounded-md border
                bg-red-50 border-red-400
                ${className}
            `}
            role="alert"
        >
            {/* Icon - X Circle untuk error */}
            <div className="flex-shrink-0 text-red-400">
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
            </div>

            {/* Error messages list */}
            <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                    Terdapat {errorMessages.length} kesalahan:
                </h3>

                <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                    {errorMessages.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ValidationErrors;
