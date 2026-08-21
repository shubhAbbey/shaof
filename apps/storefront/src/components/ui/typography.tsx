import React from 'react';
import { cn } from '../../lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  as?: React.ElementType;
}

const headingSizeClasses: Record<string, string> = {
  xs: 'text-sm font-semibold tracking-tight',
  sm: 'text-base font-semibold tracking-tight',
  md: 'text-lg font-semibold tracking-tight',
  lg: 'text-xl font-bold tracking-tight',
  xl: 'text-2xl font-bold tracking-tight md:text-3xl',
  '2xl': 'text-3xl font-extrabold tracking-tight md:text-4xl',
  '3xl': 'text-4xl font-extrabold tracking-tight md:text-5xl',
  '4xl': 'text-5xl font-black tracking-tight md:text-6xl',
};

const defaultLevelSizes: Record<number, string> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'md',
  5: 'sm',
  6: 'xs',
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 2, size, as, className, children, ...props }, ref) => {
    const Component = as || (`h${level}` as React.ElementType);
    const resolvedSize = size || defaultLevelSizes[level];

    return (
      <Component
        ref={ref}
        className={cn('text-gray-900', headingSizeClasses[resolvedSize], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = 'Heading';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'lead' | 'subtle' | 'muted' | 'caption';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  as?: React.ElementType;
}

const textVariantClasses: Record<string, string> = {
  body: 'text-base text-gray-700 leading-relaxed',
  lead: 'text-lg text-gray-800 leading-relaxed',
  subtle: 'text-sm text-gray-600',
  muted: 'text-xs text-gray-500',
  caption: 'text-xs text-gray-400',
};

const textWeightClasses: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ variant = 'body', weight = 'normal', as = 'p', className, children, ...props }, ref) => {
    const Component = as;
    return (
      <Component
        ref={ref}
        className={cn(textVariantClasses[variant], textWeightClasses[weight], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Text.displayName = 'Text';
