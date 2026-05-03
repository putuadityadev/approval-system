/**
 * Label
 */
function Label({ htmlFor, children, required = false, className = '' }) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ${className}`}
        >
            {children}
            {required && <span className="text-destructive ml-1">*</span>}
        </label>
    );
}

export default Label;
