import React from 'react';
import { cn } from '../../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: React.ElementType;
}

const containerSizes: Record<string, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1440px]',
  full: 'max-w-full',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'xl', as = 'div', className, children, ...props }, ref) => {
    const Component = as;
    return (
      <Component
        ref={ref}
        className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', containerSizes[size], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Container.displayName = 'Container';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: React.ElementType;
}

const sectionSpacings: Record<string, string> = {
  none: 'py-0',
  sm: 'py-4 sm:py-6',
  md: 'py-6 sm:py-8 md:py-10',
  lg: 'py-8 sm:py-12 md:py-16',
  xl: 'py-12 sm:py-16 md:py-24',
};

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ spacing = 'md', as = 'section', className, children, ...props }, ref) => {
    const Component = as;
    return (
      <Component ref={ref} className={cn('w-full', sectionSpacings[spacing], className)} {...props}>
        {children}
      </Component>
    );
  }
);
Section.displayName = 'Section';
