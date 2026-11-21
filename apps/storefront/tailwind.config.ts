import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        feedback: {
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
        },
        semantic: {
          primary: 'var(--color-brand-primary)',
          'primary-hover': 'var(--color-brand-primary-hover)',
          'primary-active': 'var(--color-brand-primary-active)',
          'brand-light': 'var(--color-brand-light)',
          'brand-border': 'var(--color-brand-border)',
          'surface-page': 'var(--color-surface-page)',
          'surface-subtle': 'var(--color-surface-subtle)',
          'surface-muted': 'var(--color-surface-muted)',
          'surface-card': 'var(--color-surface-card)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',
          'text-disabled': 'var(--color-text-disabled)',
          'text-inverse': 'var(--color-text-inverse)',
          'border-subtle': 'var(--color-border-subtle)',
          'border-default': 'var(--color-border-default)',
          'border-strong': 'var(--color-border-strong)',
          'border-control': 'var(--color-border-control)',
          'border-control-hover': 'var(--color-border-control-hover)',
          'status-success': 'var(--color-status-success)',
          'status-error': 'var(--color-status-error)',
          'status-warning': 'var(--color-status-warning)',
          'focus-ring': 'var(--color-focus-ring)',
        },
      },
      fontSize: {
        hero: ['2.5rem', { lineHeight: '3.25rem', fontWeight: '700' }], // H1 40px / 52px Bold
        section: ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }], // H2 28px / 36px Bold
        card: ['1.125rem', { lineHeight: '1.625rem', fontWeight: '600' }], // H3 18px / 26px Semibold
        body: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // Body 14px / 20px Regular
        caption: ['0.75rem', { lineHeight: '1.0rem', fontWeight: '400' }], // Caption 12px / 16px Regular
      },
      boxShadow: {
        'soft-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'soft-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'soft-md': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 12px 24px -4px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideInBottom: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        fadeIn: 'fadeIn 0.2s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
        slideInLeft: 'slideInLeft 0.3s ease-out',
        slideInBottom: 'slideInBottom 0.3s ease-out',
        pulseSubtle: 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
