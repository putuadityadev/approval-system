/**
 * Button
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan tombol dengan berbagai variant (primary, secondary, danger)
 * - Menangani loading state dengan spinner
 * - Disable tombol saat sedang processing
 *
 * Cara kerjanya:
 * 1. Menerima props untuk konfigurasi tampilan dan behavior
 * 2. Menentukan styling berdasarkan variant yang dipilih
 * 3. Menampilkan spinner dan disable tombol jika loading=true
 * 4. Memanggil onClick handler saat tombol diklik (jika tidak disabled/loading)
 *
 * Props:
 * - type: string (default: 'button') — tipe tombol HTML (button/submit/reset)
 * - variant: string (default: 'primary') — variant styling (primary/secondary/danger)
 * - disabled: boolean (default: false) — apakah tombol disabled
 * - loading: boolean (default: false) — apakah tombol dalam state loading
 * - children: node — konten di dalam tombol (text/icon)
 * - onClick: function — fungsi yang dipanggil saat tombol diklik
 * - className: string — class tambahan untuk custom styling
 */

function Button({
    type = 'button',
    variant = 'primary',
    disabled = false,
    loading = false,
    children,
    onClick,
    className = '',
}) {
    /**
     * getVariantClasses
     *
     * Menentukan class Tailwind berdasarkan variant yang dipilih.
     * Setiap variant punya warna dan hover state yang berbeda.
     */
    const getVariantClasses = () => {
        const variants = {
            primary:
                'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
            secondary:
                'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
            danger:
                'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
        };

        return variants[variant] || variants.primary;
    };

    /**
     * getDisabledClasses
     *
     * Menentukan class untuk state disabled/loading.
     * Tombol jadi opacity rendah dan cursor not-allowed.
     */
    const getDisabledClasses = () => {
        if (disabled || loading) {
            return 'opacity-50 cursor-not-allowed';
        }
        return '';
    };

    /**
     * handleClick
     *
     * Handler untuk event click.
     * Tidak akan memanggil onClick jika tombol disabled atau loading.
     */
    const handleClick = (e) => {
        if (disabled || loading) {
            e.preventDefault();
            return;
        }

        if (onClick) {
            onClick(e);
        }
    };

    return (
        <button
            type={type}
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center
                px-4 py-2
                border border-transparent
                rounded-md
                font-medium text-sm
                focus:outline-none focus:ring-2 focus:ring-offset-2
                transition-colors duration-200
                ${getVariantClasses()}
                ${getDisabledClasses()}
                ${className}
            `}
        >
            {/* Spinner - tampil jika loading=true */}
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}

            {/* Konten tombol */}
            {children}
        </button>
    );
}

export default Button;
