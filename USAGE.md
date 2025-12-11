# Cách sử dụng TranslationKey trong code

Sau khi chạy `node scripts/generate-translation-types.cjs`, bạn sẽ có type `TranslationKey` với tất cả keys từ file JSON.

## 📝 Cách sử dụng cơ bản

### 1. Import type

```typescript
import type { TranslationKey } from '@/types/translations';
```

### 2. Sử dụng với variable

```typescript
const key: TranslationKey = 'home_title'; // ✅ Auto-complete
const invalid: TranslationKey = 'invalid_key'; // ❌ Type error
```

### 3. Với Next.js Intl

```tsx
'use client';

import { useTranslations } from 'next-intl';
import type { TranslationKey } from '@/types/translations';

export default function HomePage() {
  const t = useTranslations();
  
  return (
    <div>
      {/* Type assertion */}
      <h1>{t('home_title' as TranslationKey)}</h1>
      <p>{t('welcome_message' as TranslationKey)}</p>
      <button>{t('login_button' as TranslationKey)}</button>
    </div>
  );
}
```

### 4. Wrapper function (Recommended)

Tạo wrapper function để type-safe hơn:

```typescript
// src/lib/i18n-typed.ts
import { useTranslations } from 'next-intl';
import type { TranslationKey } from '@/types/translations';

export function useTypedTranslations(namespace?: string) {
  const t = useTranslations(namespace);
  
  return (key: TranslationKey, values?: Record<string, any>) => {
    return t(key as any, values);
  };
}
```

Sử dụng:

```tsx
'use client';

import { useTypedTranslations } from '@/lib/i18n-typed';

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
```

### 5. Array of keys

```typescript
import type { TranslationKey } from '@/types/translations';

const navigationKeys: TranslationKey[] = [
  'home_title',
  'about_us',
  'contact_us'
];

// Sử dụng trong map
navigationKeys.map(key => (
  <a key={key} href={`#${key}`}>
    {t(key)}
  </a>
));
```

### 6. Function parameter

```typescript
import type { TranslationKey } from '@/types/translations';

function getTranslation(key: TranslationKey): string {
  // Your logic here
  return translations[key];
}

// ✅ Valid
getTranslation('home_title');
getTranslation('welcome_message');

// ❌ Type error
// getTranslation('invalid_key');
```

### 7. React component props

```tsx
import React from 'react';
import type { TranslationKey } from '@/types/translations';

interface Props {
  translationKey: TranslationKey;
}

export const TranslatedText: React.FC<Props> = ({ translationKey }) => {
  return <span>{t(translationKey)}</span>;
};

// Sử dụng:
<TranslatedText translationKey="home_title" /> {/* ✅ */}
<TranslatedText translationKey="invalid" /> {/* ❌ Type error */}
```

## 🎯 Lợi ích

1. **Auto-complete**: VS Code sẽ gợi ý các keys khi bạn gõ
2. **Type-safe**: TypeScript sẽ báo lỗi nếu key không tồn tại
3. **Refactor-safe**: Khi đổi tên key trong JSON, TypeScript sẽ báo lỗi ở tất cả nơi dùng
4. **Documentation**: Hover vào key sẽ thấy type definition

## 💡 Tips

- Luôn import type: `import type { TranslationKey }`
- Dùng wrapper function để code gọn hơn
- Tạo constants cho các nhóm keys liên quan
- Chạy `node scripts/generate-translation-types.cjs` sau mỗi lần update JSON

