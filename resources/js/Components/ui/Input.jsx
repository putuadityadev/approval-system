/**
 * Input
 *
 * Komponen ini digunakan untuk:
 * - Menampilkan input field dengan label, icon, dan error handling
 * - Styling modern dan terhubung dengan shadcn/ui theme
 */

import Label from './Label';
import { forwardRef } from 'react';

const Input = forwardRef(({
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
    icon = null,
    rightElement = null,
    labelRight = null,
    ...props
}, ref) => {
    const getInputClasses = () => {
        const baseClasses =
            'block w-full py-3 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition-all duration-200 placeholder:text-slate-400 bg-background dark:bg-slate-800 text-foreground';

        const normalClasses =
            'border border-input focus:border-primary focus:ring-primary/20';
        const errorClasses =
            'border border-destructive focus:border-destructive focus:ring-destructive/20';
        const disabledClasses = 'bg-slate-100 dark:bg-slate-900 cursor-not-allowed opacity-60';

        let classes = `${baseClasses} `;
        if (disabled) classes += disabledClasses;
        else if (error) classes += errorClasses;
        else classes += normalClasses;

        // padding adjustments based on icons
        if (icon) classes += ' pl-10 pr-3';
        else classes += ' px-3';
        
        if (rightElement) classes += ' pr-10';

        return classes;
    };

    return (
        <div className={`${className}`}>
            {label && (
                <div className="flex justify-between items-end mb-2">
                    <Label htmlFor={name} required={required} className="mb-0">
                        {label}
                    </Label>
                    {labelRight && (
                        <div className="text-sm">{labelRight}</div>
                    )}
                </div>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-xl">{icon}</span>
                    </div>
                )}
                
                <input
                    ref={ref}
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
                    {...props}
                />

                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>

            {error && (
                <p id={`${name}-error`} className="mt-1 text-sm text-destructive font-medium" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
});

// Setting display name for debugging since it's wrapped in forwardRef
Input.displayName = 'Input';

export default Input;
