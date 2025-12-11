# 🚀 Quick Start - Workflow Đơn Giản Nhất

## Workflow: Upload Excel → Download Files → Copy Vào Project Mới

### Bước 1: Upload Excel File

1. Chuẩn bị file Excel với format:
   ```
   English              | Japanese            | Malay
   Home Title           | ホームタイトル        | Tajuk Utama
   Welcome Message      | ようこそメッセージ     | Mesej Selamat Datang
   ```

2. Click button **"Upload Excel File"** trên tool
3. Chọn file Excel của bạn
4. Tool tự động:
   - Đọc file Excel
   - Tạo keys từ cột English (ví dụ: "Home Title" → `home_title`)
   - Lưu vào localStorage

### Bước 2: Download Tất Cả Files

1. Click button **"Chọn loại download"** trên card Download JSON Files
2. Chọn button đầu tiên: **"🚀 Download Tất Cả Files"** (màu xanh lá)
3. Tool sẽ tự động download **4 files**:
   - `en.json`
   - `jp.json`
   - `malay.json`
   - `translations.d.ts`

### Bước 3: Copy Vào Project Mới

**📝 Lưu ý quan trọng:**
- **File JSON** (`en.json`, `jp.json`, `malay.json`) có thể copy vào **bất kỳ đâu** trong project (vị trí không ảnh hưởng đến auto-complete)
- **File `translations.d.ts`** phải copy vào thư mục `types` (hoặc thư mục được include trong `tsconfig.json`)

Ví dụ cấu trúc:

```
project/
├── src/
│   ├── translate/          ← JSON files có thể vào đây
│   │   ├── en.json          ← Copy từ download (vị trí tùy ý)
│   │   ├── jp.json          ← Copy từ download (vị trí tùy ý)
│   │   └── malay.json       ← Copy từ download (vị trí tùy ý)
│   └── types/
│       └── translations.d.ts  ← Copy vào đây (BẮT BUỘC)
```

Hoặc:

```
project/
├── locales/                 ← JSON files có thể vào đây
│   ├── en.json
│   ├── jp.json
│   └── malay.json
├── src/
│   └── types/
│       └── translations.d.ts  ← File types BẮT BUỘC vào đây
```

### Bước 4: Sử Dụng Trong Code - Auto-complete với useTranslation()

**✨ File `translations.d.ts` đã có module augmentation**, bạn sẽ có **auto-complete tự động** khi gõ `t('h`!

#### Với react-i18next:

```tsx
import { useTranslation } from 'react-i18next';
// Không cần import TranslationKey!

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      {/* ✅ Auto-complete khi gõ t('h → gợi ý home_title, welcome_message, etc. */}
      <h1>{t('home_title')}</h1>
      <p>{t('welcome_message')}</p>
      
      {/* ❌ Type error nếu key không tồn tại */}
      {/* <p>{t('invalid_key')}</p> */}
    </div>
  );
}
```

#### Với next-intl:

```tsx
import { useTranslations } from 'next-intl';
// Không cần import TranslationKey!

export default function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      {/* ✅ Auto-complete khi gõ t('h → gợi ý home_title, welcome_message, etc. */}
      <h1>{t('home_title')}</h1>
      <p>{t('welcome_message')}</p>
    </div>
  );
}
```

**🎯 Kết quả:** Khi bạn gõ `t('h`, VS Code sẽ tự động gợi ý tất cả keys bắt đầu bằng 'h'!

## ✅ Hoàn Thành!

Bạn đã có:
- ✅ 3 file JSON translations (en, jp, malay)
- ✅ TypeScript type definitions
- ✅ Auto-complete và type checking trong code

**Không cần:**
- ❌ Node.js
- ❌ Chạy script
- ❌ Cấu hình phức tạp

## 📝 Lưu Ý

- Nếu bạn cần tự động hóa trong CI/CD, xem thêm [`README.md`](./README.md) phần "Generate TypeScript Types - Cách 2"
- File `translations.d.ts` đã được generate sẵn từ localStorage, không cần chạy script Node.js
- Tất cả files đã sẵn sàng để copy vào project mới và dùng ngay!

