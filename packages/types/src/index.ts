export * from './search.js';
export * from './auth.js';
export * from './cms.js';
export * from './commerce.js';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type CurrencyCode = 'INR';
