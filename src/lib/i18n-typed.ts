/**
 * Type-safe translation helpers
 *
 * Sử dụng sau khi đã generate types:
 * node scripts/generate-translation-types.cjs
 */

import type { TranslationKey } from '@/types/translations';

/**
 * Wrapper function để type-safe với Next.js Intl
 *
 * @example
 * ```tsx
 * 'use client';
 * import { useTranslations } from 'next-intl';
 * import { useTypedTranslations } from '@/lib/i18n-typed';
 *
 * export default function Component() {
 *   const t = useTypedTranslations();
 *   return <h1>{t('home_title')}</h1>; // ✅ Auto-complete
 * }
 * ```
 */
export function useTypedTranslations(namespace?: string) {
  // Note: Actual implementation depends on your i18n library
  // For Next.js Intl, you would do:
  // const t = useTranslations(namespace);
  // return (key: TranslationKey, values?: Record<string, string | number>) => t(key as string, values);

  // Suppress unused parameter warning - this is a placeholder implementation
  void namespace;

  return (key: TranslationKey, values?: Record<string, string | number>): string => {
    // Suppress unused parameter warnings - this is a placeholder implementation
    void key;
    void values;
    // Placeholder - replace with actual implementation
    return '';
  };
}

/**
 * Create typed translation function from existing translation function
 *
 * @example
 * ```tsx
 * import { useTranslations } from 'next-intl';
 * import { createTypedT } from '@/lib/i18n-typed';
 *
 * const t = useTranslations();
 * const typedT = createTypedT(t);
 *
 * <h1>{typedT('home_title')}</h1> // ✅ Auto-complete
 * ```
 */
export function createTypedT<
  T extends (key: string, values?: Record<string, string | number>) => string,
>(t: T) {
  return (key: TranslationKey, values?: Record<string, string | number>): ReturnType<T> => {
    return t(key as string, values) as ReturnType<T>;
  };
}

/**
 * Type guard để check nếu string là valid translation key
 */
export function isValidTranslationKey(_key: string): _key is TranslationKey {
  // This is a type guard - actual implementation would check against keys
  return true;
}
