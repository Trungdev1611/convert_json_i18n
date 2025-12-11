# 🌍 i18n Translation Tool

Công cụ quản lý và đồng bộ translations cho các dự án đa ngôn ngữ. Tool hỗ trợ upload JSON files ban đầu, merge translations từ Excel files, và download các file JSON đã được cập nhật.

## ✨ Tính năng

- 📤 **Upload JSON Files**: Upload 3 file JSON ban đầu (EN, JP, Malay) để tạo "bộ từ điển chính thức"
- 📊 **Upload Excel File**: Upload file Excel để merge translations mới vào JSON trong localStorage
- 🔍 **Tự động phát hiện thay đổi**: Tự động phân biệt key mới (added) và key đã cập nhật (updated)
- 📋 **Bảng thay đổi**: Hiển thị bảng với màu sắc phân biệt cho các thay đổi
- 🚀 **Download Tất Cả Files Cho Project Mới**: Tự động download 4 files (en.json, jp.json, malay.json, translations.d.ts) cùng lúc - **Không cần Node.js!**
- 💾 **Download JSON**: Tải xuống từng file riêng hoặc tất cả trong 1 file
- 📘 **TypeScript Type Definition**: Download type definitions đã được generate từ localStorage
- 🔧 **Export cho CI/CD**: Export JSON files để dùng với script Node.js trong CI/CD
- 🎨 **Giao diện đẹp**: Sử dụng Ant Design và Tailwind CSS

## 🚀 Cài đặt

### Yêu cầu

- Node.js >= 18
- npm hoặc yarn

### Cài đặt dependencies

```bash
npm install
```

## 🏃 Chạy ứng dụng

### Development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 📖 Hướng dẫn sử dụng

### Bước 1: Upload JSON Files (Lần đầu tiên)

1. Click button **"Chọn file JSON"** trên card Upload JSON Files
2. Chọn file JSON bạn muốn upload:
   - **EN.json** (English)
   - **JP.json** (Japanese)
   - **Malay.json** (Malay)
3. Các file sẽ được lưu vào localStorage làm "bộ từ điển chính thức"

### Bước 2: Upload Excel File (Các lần sau)

1. Chuẩn bị file Excel theo format yêu cầu (xem phần Format Excel bên dưới)
2. Click button **"Upload Excel File"** trên card Upload Excel File
3. Chọn file Excel của bạn
4. Tool sẽ tự động:
   - Đọc file Excel
   - Merge vào JSON trong localStorage
   - Phát hiện các thay đổi (added/updated)
   - Hiển thị bảng thay đổi

### Bước 3: Xem bảng thay đổi

- Bảng sẽ hiển thị các key đã thay đổi với màu sắc phân biệt:
  - 🟠 **Màu cam**: Key đã được cập nhật (updated)
  - 🟢 **Màu xanh lá**: Key mới được thêm (added)
- Các key không thay đổi sẽ không được hiển thị

### Bước 4: Download Files Cho Project Mới (Khuyến nghị)

**✨ Workflow đơn giản nhất:**

1. Click button **"Chọn loại download"** trên card Download JSON Files
2. Chọn **"Download Tất Cả Files Cho Project Mới"** (button đầu tiên, màu xanh lá)
3. Tool sẽ tự động download **4 files**:
   - `en.json` → Copy vào `src/translate/en.json`
   - `jp.json` → Copy vào `src/translate/jp.json`
   - `malay.json` → Copy vào `src/translate/malay.json`
   - `translations.d.ts` → Copy vào `src/types/translations.d.ts`
4. Copy các files vào project mới và dùng ngay!

**✅ Ưu điểm:**
- Không cần Node.js
- Không cần chạy script
- Tất cả files đã được generate sẵn
- Copy và dùng ngay trong project mới

### Bước 5: Download Các Loại Khác (Tùy chọn)

Nếu bạn chỉ cần một số files cụ thể:

1. **Download All**: Tải xuống 1 file chứa cả 3 ngôn ngữ (`all_translations.json`)
2. **Download từng file riêng**: Tải xuống EN.json, JP.json, hoặc Malay.json
3. **Export cho CI/CD**: Tải xuống `en.json`, `jp.json`, `malay.json` để dùng với script Node.js trong CI/CD

### Bước 6: Generate TypeScript Types (Tùy chọn - Đã có trong Bước 4)

Nếu bạn đã dùng **Bước 4** (Download Tất Cả Files), bạn đã có sẵn `translations.d.ts` rồi, không cần làm bước này!

Nếu bạn muốn generate lại hoặc tự động hóa, có **2 cách độc lập**:

#### ✨ Cách 1: Generate trực tiếp từ localStorage (Khuyến nghị - Không cần Node.js)

**Luồng flow:**
1. Upload JSON/Excel → Dữ liệu lưu vào **localStorage**
2. Click button **"Download translations.d.ts (Từ localStorage - Không cần Node.js)"**
3. Tool tự động:
   - Đọc từ localStorage
   - Flatten nested keys
   - Generate file `translations.d.ts`
   - Download về máy
4. Copy file vào `src/types/translations.d.ts` trong project
5. Sử dụng ngay:
   ```typescript
   import type { TranslationKey } from '@/types/translations';
   const key: TranslationKey = 'home_title'; // ✅ Auto-complete
   ```

**✅ Ưu điểm:**
- Không cần Node.js
- Không cần chạy script
- Nhanh, đơn giản
- Hoạt động trực tiếp trong browser

#### 🔧 Cách 2: Generate từ file JSON bằng script Node.js (Cho CI/CD)

**Luồng flow:**
1. Upload JSON/Excel → Dữ liệu lưu vào **localStorage**
2. Click button **"Export JSON Files (en.json, jp.json, malay.json) - Cho CI/CD"**
3. Copy 3 file JSON vào `src/translate/` trong project
4. Chạy script:
   ```bash
   node scripts/generate-translation-types.cjs
   ```
5. File `src/types/translations.d.ts` được tạo tự động

**✅ Ưu điểm:**
- Tự động hóa trong GitHub Actions / CI/CD
- Version control JSON files trong repo
- Tích hợp vào build process

**📝 Lưu ý:**
- **2 cách này HOÀN TOÀN ĐỘC LẬP** - bạn chỉ cần chọn 1 cách
- Cách 1: Dùng khi làm việc thủ công, không cần automation
- Cách 2: Dùng khi cần tự động hóa trong CI/CD (như GitHub Actions)
- GitHub Actions workflow vẫn cần script Node.js vì không có localStorage trong server environment

Xem thêm chi tiết trong [`scripts/README.md`](./scripts/README.md).

## 📊 Format Excel

### Yêu cầu

- File phải có **2 hoặc 3 cột**
- **Hàng đầu tiên** là header (tên cột)
- Phải có 1 cột tên là **"English"** (không phân biệt hoa thường)
- Các cột khác có thể là: Japanese, JP, JA, Malay, MS...

### Ví dụ Format

#### Format 1: 3 cột (English | Japanese | Malay)

```
English              | Japanese            | Malay
Home Title           | ホームタイトル        | Tajuk Utama
Welcome Message      | ようこそメッセージ     | Mesej Selamat Datang
Login Button         | ログインボタン        | Butang Log Masuk
Logout Button        | ログアウトボタン      | Butang Log Keluar
```

#### Format 2: 2 cột (English | Japanese)

```
English              | Japanese
Home Title           | ホームタイトル
Welcome Message      | ようこそメッセージ
Login Button         | ログインボタン
```

#### Format 3: 2 cột với tên ngắn (English | JP)

```
English              | JP
Home Title           | ホームタイトル
Welcome Message      | ようこそメッセージ
```

### Tạo Key tự động

Key sẽ được tạo tự động từ cột **English**:
- "Home Title" → `home_title`
- "Welcome Message" → `welcome_message`
- "Login Button" → `login_button`

**Quy tắc tạo key:**
- Chuyển sang chữ thường
- Thay khoảng trắng bằng dấu gạch dưới (`_`)
- Loại bỏ ký tự đặc biệt
- Loại bỏ dấu gạch dưới thừa

## 🗂️ Cấu trúc Project

```
i18n-tool/
├── src/
│   ├── components/
│   │   ├── UploadJson.tsx          # Component upload JSON files
│   │   ├── UploadExcel.tsx         # Component upload Excel file
│   │   ├── LogTable.tsx            # Component hiển thị bảng thay đổi
│   │   └── DownloadJSONtranslated.tsx  # Component download JSON
│   ├── utils/
│   │   ├── storage.ts              # Utilities quản lý localStorage
│   │   └── types.ts                # TypeScript types
│   ├── App.tsx                     # Component chính
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json
└── README.md
```

## 🛠️ Công nghệ sử dụng

- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Ant Design 6** - UI Components
- **Tailwind CSS 4** - Utility-first CSS
- **xlsx** - Xử lý file Excel
- **file-saver** - Download files

## 💾 Lưu trữ dữ liệu

Dữ liệu được lưu trữ trong **localStorage** của browser với key `i18n_translations`.

Cấu trúc dữ liệu:
```json
{
  "en": {
    "home_title": "Home Title",
    "welcome_message": "Welcome Message"
  },
  "jp": {
    "home_title": "ホームタイトル",
    "welcome_message": "ようこそメッセージ"
  },
  "malay": {
    "home_title": "Tajuk Utama",
    "welcome_message": "Mesej Selamat Datang"
  }
}
```

## 📝 Notes

- Dữ liệu chỉ lưu trong localStorage của browser hiện tại
- Nếu xóa cache hoặc đổi browser, cần upload lại JSON files
- File Excel phải có cột "English" ở hàng đầu tiên
- Key được tạo tự động từ giá trị cột English

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT
# convert_json_i18n
# convert_json_i18n
