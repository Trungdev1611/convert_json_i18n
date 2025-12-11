/**
 * Ví dụ cách sử dụng TranslationKey trong code
 * 
 * Sau khi chạy: node scripts/generate-translation-types.cjs
 * Bạn sẽ có type TranslationKey với tất cả keys từ en.json
 */

import type { TranslationKey } from '@/types/translations';

// ============================================
// Example 1: Basic usage với variable
// ============================================

const example1 = () => {
  // ✅ Valid keys - TypeScript sẽ auto-complete
  const key1: TranslationKey = 'home_title';
  const key2: TranslationKey = 'welcome_message';
  const key3: TranslationKey = 'login_button';
  
  // ❌ Invalid key - TypeScript sẽ báo lỗi
  // const invalidKey: TranslationKey = 'invalid_key'; // Type error!
  
  return { key1, key2, key3 };
};

// ============================================
// Example 2: Với Next.js Intl
// ============================================

/*
'use client';

import { useTranslations } from 'next-intl';
import type { TranslationKey } from '@/types/translations';

export default function HomePage() {
  const t = useTranslations();
  
  return (
    <div>
      {/* ✅ Auto-complete khi gõ */}
      <h1>{t('home_title' as TranslationKey)}</h1>
      <p>{t('welcome_message' as TranslationKey)}</p>
      <button>{t('login_button' as TranslationKey)}</button>
      
      {/* ❌ Type error nếu key không tồn tại */}
      {/* <p>{t('invalid_key' as TranslationKey)}</p> */}
    </div>
  );
}
*/

// ============================================
// Example 3: Wrapper function để type-safe hơn
// ============================================

/*
import { useTranslations } from 'next-intl';
import type { TranslationKey } from '@/types/translations';

// Tạo wrapper function
export function useTypedTranslations(namespace?: string) {
  const t = useTranslations(namespace);
  
  return (key: TranslationKey, values?: Record<string, any>) => {
    return t(key as any, values);
  };
}

// Sử dụng:
export default function Component() {
  const t = useTypedTranslations();
  
  return (
    <div>
      <h1>{t('home_title')}</h1> {/* ✅ Auto-complete, type-safe */}
      <p>{t('welcome_message')}</p>
      {/* t('invalid') */} {/* ❌ Type error */}
    </div>
  );
}
*/

// ============================================
// Example 4: Array of keys
// ============================================

const navigationKeys: TranslationKey[] = [
  'home_title',
  'about_us',
  'contact_us'
];

// Sử dụng trong map
const Navigation = () => {
  return (
    <nav>
      {navigationKeys.map(key => (
        <a key={key} href={`#${key}`}>
          {/* Render translation */}
        </a>
      ))}
    </nav>
  );
};

// ============================================
// Example 5: Object mapping
// ============================================

const buttonKeys = {
  login: 'login_button' as TranslationKey,
  logout: 'logout_button' as TranslationKey,
  settings: 'settings' as TranslationKey,
} as const;

// Sử dụng:
// t(buttonKeys.login); // ✅ Type-safe

// ============================================
// Example 6: Function với TranslationKey parameter
// ============================================

function getTranslation(key: TranslationKey): string {
  // Your translation logic here
  return '';
}

// ✅ Valid
getTranslation('home_title');
getTranslation('welcome_message');

// ❌ Type error
// getTranslation('invalid_key');

// ============================================
// Example 7: Type guard
// ============================================

function isValidTranslationKey(key: string): key is TranslationKey {
  // In real implementation, check against actual keys
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
if (isValidTranslationKey(userInput)) {
  // TypeScript biết userInput là TranslationKey ở đây
  const key: TranslationKey = userInput; // ✅
}

// ============================================
// Example 8: Với React component
// ============================================

/*
import React from 'react';
import type { TranslationKey } from '@/types/translations';

interface Props {
  translationKey: TranslationKey;
}

export const TranslatedText: React.FC<Props> = ({ translationKey }) => {
  // translationKey chỉ có thể là một trong các keys hợp lệ
  return <span>{/* Render translation */}</span>;
};

// Sử dụng:
<TranslatedText translationKey="home_title" /> {/* ✅ */}
<TranslatedText translationKey="invalid" /> {/* ❌ Type error */}
*/

export { example1, navigationKeys, buttonKeys, getTranslation, isValidTranslationKey };

