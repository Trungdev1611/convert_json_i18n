# 📖 Hướng Dẫn Sử Dụng - Auto-complete với useTranslation()

## ✅ Trả Lời Câu Hỏi

### 1. File JSON có thể copy vào đâu?

**Có thể copy vào bất kỳ đâu trong project!** Vị trí file JSON không ảnh hưởng đến auto-complete.

Ví dụ:

```
project/
├── src/
│   ├── translate/          ← Copy vào đây (khuyến nghị)
│   │   ├── en.json
│   │   ├── jp.json
│   │   └── malay.json
│   ├── locales/            ← Hoặc vào đây
│   │   ├── en.json
│   │   ├── jp.json
│   │   └── malay.json
│   └── i18n/               ← Hoặc vào đây
│       ├── en.json
│       ├── jp.json
│       └── malay.json
```

**Quan trọng:** File JSON chỉ cần được load vào thư viện i18n của bạn (react-i18next, next-intl, etc.). Vị trí file không ảnh hưởng đến TypeScript types.

### 2. File typeDefinition phải vào đâu?

**File `translations.d.ts` phải vào thư mục `types`** (hoặc bất kỳ thư mục nào được include trong `tsconfig.json`):

```
project/
├── src/
│   └── types/
│       └── translations.d.ts  ← Copy vào đây
```

Hoặc:

```
project/
├── types/
│   └── translations.d.ts      ← Hoặc vào đây (nếu include trong tsconfig.json)
```

**Lưu ý:** Đảm bảo `tsconfig.json` có include thư mục chứa `translations.d.ts`:

```json
{
  "compilerOptions": {
    // ...
  },
  "include": ["src", "types"] // ← Thêm "types" nếu đặt ở root
}
```

### 3. Làm sao để có auto-complete khi gõ `t('h`?

File `translations.d.ts` đã được generate với **module augmentation** cho các thư viện phổ biến. Chỉ cần:

1. Copy `translations.d.ts` vào `src/types/`
2. Import type (hoặc không cần import nếu dùng module augmentation)
3. Dùng `useTranslation()` như bình thường

## 🚀 Cách Sử Dụng

### Với react-i18next

```tsx
import { useTranslation } from 'react-i18next';
// Không cần import TranslationKey nếu dùng module augmentation

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      {/* ✅ Auto-complete khi gõ t('h */}
      <h1>{t('home_title')}</h1>
      <p>{t('welcome_message')}</p>

      {/* ❌ Type error nếu key không tồn tại */}
      {/* <p>{t('invalid_key')}</p> */}
    </div>
  );
}
```

**Khi gõ `t('h`, VS Code sẽ tự động gợi ý:**

- `home_title`
- `welcome_message`
- ... (tất cả keys bắt đầu bằng 'h')

### Với next-intl

```tsx
import { useTranslations } from 'next-intl';
// Không cần import TranslationKey nếu dùng module augmentation

export default function MyComponent() {
  const t = useTranslations();

  return (
    <div>
      {/* ✅ Auto-complete khi gõ t('h */}
      <h1>{t('home_title')}</h1>
      <p>{t('welcome_message')}</p>
    </div>
  );
}
```

### Với thư viện khác (không có module augmentation)

Nếu thư viện của bạn không được hỗ trợ sẵn, bạn có thể:

**Cách 1: Dùng wrapper function**

```tsx
// src/lib/i18n-typed.ts
import type { TranslationKey } from '@/types/translations';

export function useTypedTranslation() {
  const { t } = useTranslation(); // Thay bằng hook của bạn

  return (key: TranslationKey, values?: Record<string, any>) => {
    return t(key, values);
  };
}

// Sử dụng:
const t = useTypedTranslation();
t('home_title'); // ✅ Auto-complete
```

**Cách 2: Type assertion**

```tsx
import type { TranslationKey } from '@/types/translations';

const { t } = useTranslation();
t('home_title' as TranslationKey); // ✅ Auto-complete khi gõ
```

## 📝 Checklist

- [ ] Copy `en.json`, `jp.json`, `malay.json` vào project (vị trí tùy ý)
- [ ] Copy `translations.d.ts` vào `src/types/` (hoặc thư mục types)
- [ ] Đảm bảo `tsconfig.json` include thư mục chứa `translations.d.ts`
- [ ] Load JSON files vào thư viện i18n của bạn
- [ ] Dùng `useTranslation()` như bình thường
- [ ] ✅ Auto-complete sẽ hoạt động tự động!

## 💡 Tips

1. **Restart VS Code** sau khi copy `translations.d.ts` để TypeScript nhận diện types mới
2. **Kiểm tra tsconfig.json** đảm bảo include đúng thư mục
3. **Nếu không có auto-complete**, thử:
   - Reload VS Code window: `Cmd+Shift+P` → "Reload Window"
   - Kiểm tra TypeScript version: `tsc --version`
   - Đảm bảo file `.d.ts` được TypeScript nhận diện

## 🎯 Kết Quả

Sau khi setup đúng, bạn sẽ có:

- ✅ Auto-complete khi gõ `t('h` → gợi ý `home_title`, `welcome_message`, etc.
- ✅ Type error nếu key không tồn tại
- ✅ Refactor-safe: Khi đổi tên key, TypeScript sẽ báo lỗi ở tất cả nơi dùng
- ✅ Hover để xem type definition
