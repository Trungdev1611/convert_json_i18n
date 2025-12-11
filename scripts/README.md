# i18n Type Generator

Script tự động generate TypeScript types từ JSON translation files.

**✨ Không cần dependencies** - Chỉ dùng Node.js built-in modules!

## 🚀 Quick Start

### 1. Copy folder `scripts/` sang project mới

### 2. Chỉnh sửa `config.json` theo cấu trúc project:

```json
{
  "localesDir": "src/translate",        // Đường dẫn đến folder chứa JSON files
  "outputDir": "src/types",             // Folder output cho type definitions
  "outputFile": "translations.d.ts",    // Tên file output
  "sourceLocale": "en",                 // Locale dùng làm source
  "locales": ["en", "jp", "malay"],     // Danh sách locales
  "namespace": "next-intl",             // Namespace (next-intl, react-i18next, etc.)
  "enableWatch": false                  // Enable watch mode
}
```

### 3. Chạy script:

```bash
node scripts/generate-translation-types.cjs
```

Types sẽ được generate vào `src/types/translations.d.ts`

### 4. Sử dụng trong code:

```typescript
import type { TranslationKey } from '@/types/translations';

// TypeScript sẽ auto-complete keys
const key: TranslationKey = 'home_title'; // ✅
const invalid: TranslationKey = 'invalid_key'; // ❌ Type error
```

## 📁 Cấu trúc tối thiểu

```
scripts/
├── config.json                    # Config file (chỉnh sửa theo project)
├── generate-translation-types.cjs # Script chính
└── README.md                      # File này
```

## ⚙️ Cấu hình

Chỉnh sửa `config.json`:

- **localesDir**: Đường dẫn đến folder chứa JSON files (relative từ project root)
- **outputDir**: Folder sẽ chứa file type definitions
- **outputFile**: Tên file output
- **sourceLocale**: Locale nào dùng để generate keys (thường là `en`)
- **locales**: Danh sách tất cả locales (optional, chỉ để reference)
- **namespace**: (Optional) Namespace cho TypeScript module declaration
  - Dùng để extend type definitions của thư viện i18n
  - `next-intl` cho Next.js Intl
  - `react-i18next` cho React i18next
  - `vue-i18n` cho Vue i18n
  - `null` hoặc bỏ qua nếu không cần (khuyến nghị)

### Namespace là gì?

Namespace được dùng để **extend type definitions** của thư viện i18n. 

**Khi nào cần:**
- Khi thư viện i18n có sẵn type definitions và bạn muốn extend chúng
- Khi bạn muốn type-safe cho các hàm translation của thư viện

**Khi nào KHÔNG cần:**
- Khi bạn chỉ dùng `TranslationKey` type trực tiếp (như hầu hết các trường hợp)
- Khi thư viện i18n không có type definitions sẵn

**Ví dụ:**

Với namespace `next-intl`, script sẽ generate:
```typescript
declare module 'next-intl' {
  interface Messages {
    [key: string]: any;
  }
}
```

Nhưng thực tế, bạn chỉ cần dùng:
```typescript
import type { TranslationKey } from '@/types/translations';
const key: TranslationKey = 'home_title'; // ✅
```

**Khuyến nghị:** Để `null` hoặc bỏ qua namespace nếu không chắc chắn.

## 📝 Sử dụng

### Generate types một lần

```bash
node scripts/generate-translation-types.cjs
```

### Watch mode (tự động regenerate khi JSON thay đổi)

```bash
node scripts/generate-translation-types.cjs --watch
```

## 🔄 Copy sang Repo khác

1. Copy folder `scripts/` sang repo mới
2. Chỉnh sửa `config.json` theo cấu trúc repo mới
3. Chạy: `node scripts/generate-translation-types.cjs`
4. Done! Types sẽ được generate

## 💻 Tích hợp vào workflow (Optional)

Thêm vào `package.json`:

```json
{
  "scripts": {
    "dev": "node scripts/generate-translation-types.cjs && vite",
    "build": "node scripts/generate-translation-types.cjs && tsc -b && vite build"
  }
}
```

## 🎯 Ví dụ Config cho các Framework

### Next.js Intl
```json
{
  "localesDir": "src/translate",
  "outputDir": "src/types",
  "outputFile": "translations.d.ts",
  "sourceLocale": "en",
  "namespace": "next-intl"
}
```

### React i18next
```json
{
  "localesDir": "public/locales",
  "outputDir": "src/@types",
  "outputFile": "i18n.d.ts",
  "sourceLocale": "en",
  "namespace": "react-i18next"
}
```

### Vue i18n
```json
{
  "localesDir": "locales",
  "outputDir": "types",
  "outputFile": "translations.d.ts",
  "sourceLocale": "en",
  "namespace": "vue-i18n"
}
```

## 🐛 Troubleshooting

### Error: Source locale file not found

Kiểm tra:
1. File JSON có tồn tại không?
2. Đường dẫn trong `config.json` đúng chưa?
3. File có đúng format JSON không?

### Types không được generate

1. Kiểm tra `config.json` có đúng format JSON không
2. Chạy script và xem error message
3. Đảm bảo output directory có thể write được

## 📄 License

MIT
