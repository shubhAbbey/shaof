'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UseMobileBackOptions {
  fallbackUrl?: string;
  onBeforeBack?: () => boolean | void;
}

/**
 * Custom hook providing safe, resilient mobile back navigation.
 *
 * If internal application history exists within the current session, it uses router.back()
 * to preserve scroll position, active filters, and pagination state.
 *
 * If the user accessed the page directly (fresh tab, external link, direct URL entry),
 * it safely navigates to a designated application fallback (e.g., category or homepage)
 * to avoid blank screens, loops, or unexpected browser exits.
 */
export function useMobileBack(options: UseMobileBackOptions = {}) {
  const router = useRouter();
  const { fallbackUrl = '/', onBeforeBack } = options;

  const handleBack = useCallback(() => {
    if (onBeforeBack && onBeforeBack() === false) {
      return;
    }

    if (typeof window !== 'undefined') {
      const hasInternalHistory =
        window.history.length > 1 &&
        Boolean(document.referrer) &&
        (document.referrer.includes(window.location.host) ||
          document.referrer.startsWith(window.location.origin));

      if (hasInternalHistory) {
        router.back();
        return;
      }
    }

    // Direct entry or no internal history: Navigate to safe application fallback
    router.push(fallbackUrl);
  }, [router, fallbackUrl, onBeforeBack]);

  return { handleBack };
}
