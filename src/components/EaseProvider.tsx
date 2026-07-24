'use client';

import { useEffect } from 'react';
import { registerEase } from '@/lib/ease';

/**
 * Registers the CustomEase once on mount. Rendered by the root layout so every
 * route gets it before any tween is created.
 */
export default function EaseProvider() {
  useEffect(() => {
    registerEase();
  }, []);
  return null;
}
