/**
 * Input
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan input field dengan label dan error handling
 * - Menampilkan error message di bawah input jika ada validasi error
 * - Styling konsisten dengan Tailwind CSS dan responsive
 *
 * Cara kerjanya:
 * 1. Menerima props untuk konfigurasi input (type, name, value, dll)
 * 2. Render label di atas input menggunakan komponen Label
 * 3. Menampilkan input field dengan styling yang sesuai
 * 4. Jika ada error, tampilkan border merah dan error message di bawah input
 * 5. Memanggil onChange handler saat user mengetik
 *
 * Props:
 * - type: string (default: 'text') — tipe input HTML (text/email/password/number/dll)
 * - name: string (required) — nama input untuk form submission
 * - value: string/number — nilai input (controlled component)
 * - onChange: function (required) — fungsi yang dipanggil saat input berubah
 * - error: string — pesan error validasi (jika ada)
 * - label: string — label yang ditampilkan di atas input
 * - placeholder: string — placeholder text di dalam input
 * - required: boolean (default: false) — apakah input wajib diisi
 * - disabled: boolean (default: false) — apakah input disabled
 * - className: string — class tambahan untuk custom styling
 */

import Label from './Label';

function Input({
    type = 'text',
    name,
    value,
    onChange,
    error,
    label,
    placeholder,
    required = false,
    disabled = false,
    className = '',
}) {
    /**
     * getInputClasses
     *
     * Menentukan class Tailwind untuk input field.
     * Jika ada error, border jadi merah.
     * Jika disabled, background jadi abu-abu.
     */
    const getInputClasses = () => {
        const baseClasses =
            'block w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200';

        const normalClasses =
            'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
        const errorClasses =
            'border-red-500 focus:border-red-500 focus:ring-red-500';
        const disabledClasses = 'bg-gray-100 cursor-not-allowed opacity-60';

        let classes = `${baseClasses} `;

        if (disabled) {
            classes += disabledClasses;
        } else if (error) {
            classes += errorClasses;
        } else {
            classes += normalClasses;
        }

        return classes;
    };

    return (
        <div className={`${className}`}>
            {/* Label - tampil jika prop label ada */}
            {label && (
                <Label htmlFor={name} required={required}>
                    {label}
                </Label>
            )}

            {/* Input field */}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={getInputClasses()}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${name}-error` : undefined}
            />

            {/* Error message - tampil jika ada error */}
            {error && (
                <p
                    id={`${name}-error`}
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

export default Input;
