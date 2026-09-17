import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({
  label,
  error,
  id,
  className = '',
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/30 ${
          error
            ? 'border-status-rejected focus:border-status-rejected'
            : 'border-slate-300 focus:border-primary-500'
        } ${className}`}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-status-rejected">
          {error}
        </p>
      )}
    </div>
  );
}
