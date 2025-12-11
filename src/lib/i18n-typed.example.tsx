/**
 * Example usage of typed translations
 * 
 * This file demonstrates how to use the generated TranslationKey types
 * with Next.js Intl or other i18n libraries.
 */

import type { TranslationKey } from '@/types/translations';

// ============================================
// Example 1: Direct type usage
// ============================================

const example1 = () => {
  // ✅ Valid keys - TypeScript will auto-complete
  const key1: TranslationKey = 'home_title';
  const key2: TranslationKey = 'welcome_message';
  const key3: TranslationKey = 'login_button';
  
  // ❌ Invalid key - TypeScript error
  // const invalidKey: TranslationKey = 'invalid_key'; // Type error!
  
  return { key1, key2, key3 };
};

// ============================================
// Example 2: With Next.js Intl
// ============================================

/*
'use client';

import { useTranslations } from 'next-intl';
import { createTypedT } from '@/lib/i18n-typed';

export default function ExampleComponent() {
  const t = useTranslations();
  const typedT = createTypedT(t);
  
  return (
    <div>
      <h1>{typedT('home_title')}</h1> {/* ✅ Auto-complete */}
      <p>{typedT('welcome_message')}</p>
      <button>{typedT('login_button')}</button>
      
      {/* ❌ Type error */}
      {/* <p>{typedT('invalid_key')}</p> */}
    </div>
  );
}
*/

// ============================================
// Example 3: Custom wrapper function
// ============================================

/*
import { useTranslations } from 'next-intl';

export function useTypedTranslations(namespace?: string) {
  const t = useTranslations(namespace);
  
  return (key: TranslationKey, values?: Record<string, any>) => {
    return t(key as any, values);
  };
}

// Usage:
const t = useTypedTranslations();
t('home_title'); // ✅ Auto-complete
*/

// ============================================
// Example 4: Type guard
// ============================================

export function isValidKey(key: string): key is TranslationKey {
  // In a real implementation, you'd check against actual keys
  // For now, this is just a type guard
  const validKeys: TranslationKey[] = [
    'home_title',
    'welcome_message',
    'login_button',
    'logout_button',
    'user_profile',
    'settings',
    'about_us',
    'contact_us'
  ];
  
  return validKeys.includes(key as TranslationKey);
}

// Usage:
const userInput = 'home_title';
if (isValidKey(userInput)) {
  // TypeScript knows userInput is TranslationKey here
  const key: TranslationKey = userInput; // ✅
}

// ============================================
// Example 5: Array of keys
// ============================================

export const navigationKeys: TranslationKey[] = [
  'home_title',
  'about_us',
  'contact_us'
];

// ============================================
// Example 6: Object mapping
// ============================================

export const buttonKeys = {
  login: 'login_button' as TranslationKey,
  logout: 'logout_button' as TranslationKey,
} as const;

// Usage:
// typedT(buttonKeys.login); // ✅

