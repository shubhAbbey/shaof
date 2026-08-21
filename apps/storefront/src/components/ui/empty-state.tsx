import React from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionHref,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 my-6',
        className
      )}
      role="region"
      aria-label={title}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
        {icon || <PackageOpen className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {(actionText && (onAction || actionHref)) && (
        <div className="mt-5">
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex h-9 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {actionText}
            </a>
          ) : (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
EmptyState.displayName = 'EmptyState';
