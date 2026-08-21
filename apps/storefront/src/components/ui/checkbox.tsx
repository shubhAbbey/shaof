import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, checked, defaultChecked, onChange, disabled, ...props }, ref) => {
    const inputId = id || `cb-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="flex items-start space-x-2.5">
        <div className="relative flex items-center pt-0.5">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={cn(
              'peer h-4 w-4 shrink-0 rounded border border-gray-300 text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 accent-brand-600',
              error && 'border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="grid gap-0.5 leading-none">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'text-sm font-medium text-gray-800 select-none cursor-pointer',
                  disabled && 'cursor-not-allowed opacity-70'
                )}
              >
                {label}
              </label>
            )}
            {description && <p className="text-xs text-gray-500">{description}</p>}
            {error && (
              <p className="text-xs text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
