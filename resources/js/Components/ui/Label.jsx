/**
 * Label
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan label untuk input field
 * - Menampilkan asterisk (*) merah jika field required
 * - Styling konsisten dengan Tailwind CSS
 *
 * Cara kerjanya:
 * 1. Menerima props htmlFor (untuk link ke input), children (text label), dan required
 * 2. Render label dengan styling yang sesuai
 * 3. Jika required=true, tampilkan asterisk merah di sebelah text
 *
 * Props:
 * - htmlFor: string (required) — id dari input yang di-label (untuk accessibility)
 * - children: node (required) — text label yang ditampilkan
 * - required: boolean (default: false) — apakah field ini wajib diisi
 * - className: string — class tambahan untuk custom styling
 */

function Label({ htmlFor, children, required = false, className = '' }) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
        >
            {children}
            {/* Asterisk merah - tampil jika required=true */}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
}

export default Label;
