/**
 * Button
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan tombol dengan berbagai variant (primary, secondary, danger, outline)
 * - Menangani loading state dengan spinner
 * - Disable tombol saat sedang processing
 */

function Button({
    type = 'button',
    variant = 'primary',
    disabled = false,
    loading = false,
    children,
    onClick,
    className = '',
    ...props
}) {
    const getVariantClasses = () => {
        const variants = {
            primary:
                'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm focus:ring-primary',
            secondary:
                'bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-sm focus:ring-secondary',
            danger:
                'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm focus:ring-destructive',
            outline:
                'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            ghost:
                'hover:bg-accent hover:text-accent-foreground'
        };

        return variants[variant] || variants.primary;
    };

    const getDisabledClasses = () => {
        if (disabled || loading) {
            return 'opacity-50 cursor-not-allowed';
        }
        return '';
    };

    const handleClick = (e) => {
        if (disabled || loading) {
            e.preventDefault();
            return;
        }
        if (onClick) onClick(e);
    };

    return (
        <button
            type={type}
            onClick={handleClick}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center
                px-4 py-3 border border-transparent rounded-lg
                font-bold text-sm tracking-wide uppercase
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
                transition-all duration-200
                ${getVariantClasses()}
                ${getDisabledClasses()}
                ${className}
            `}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            {children}
        </button>
    );
}

export default Button;
