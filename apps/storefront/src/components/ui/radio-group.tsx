import React from 'react';
import { cn } from '../../lib/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  error,
  className,
  orientation = 'vertical',
}) => {
  return (
    <fieldset className={cn('space-y-2', className)}>
      {label && <legend className="text-sm font-medium text-gray-700">{label}</legend>}
      <div
        className={cn(
          'gap-3',
          orientation === 'horizontal' ? 'flex flex-wrap items-center' : 'flex flex-col'
        )}
      >
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const isChecked = value !== undefined ? value === option.value : undefined;

          return (
            <div key={option.value} className="flex items-start space-x-2.5">
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={isChecked}
                defaultChecked={defaultValue === option.value}
                disabled={option.disabled}
                onChange={() => onChange?.(option.value)}
                className="h-4 w-4 border-gray-300 text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 accent-brand-600 mt-0.5"
              />
              <div className="grid gap-0.5 leading-none">
                <label
                  htmlFor={optionId}
                  className={cn(
                    'text-sm font-medium text-gray-800 cursor-pointer',
                    option.disabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-xs text-gray-500">{option.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};
RadioGroup.displayName = 'RadioGroup';
