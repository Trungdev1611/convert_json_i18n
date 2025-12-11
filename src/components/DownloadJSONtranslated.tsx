//File để download json đã được translated từ file excel BA upload lên, 
//người dùng sẽ dowload được 3 file json hoặc 1 file với 3 phần eng, jp và malay
import { useState } from 'react';
import { Card, Button, Modal, Space, message, Typography, Divider } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { getLanguage, getTranslations } from '../utils/storage';

const { Text, Paragraph } = Typography;

// Flatten nested keys giống như script Node.js
const flattenKeys = (obj: Record<string, any>, prefix = ''): string[] => {
  const keys: string[] = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Nested object - recurse
        keys.push(...flattenKeys(obj[key], fullKey));
      } else {
        // Leaf node - add key
        keys.push(fullKey);
      }
    }
  }
  
  return keys.sort(); // Sort alphabetically
};

const DownloadJSONtranslated = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = (lang: 'en' | 'jp' | 'malay', fileName: string) => {
    const data = getLanguage(lang);
    
    if (Object.keys(data).length === 0) {
      message.warning(`Chưa có dữ liệu ${lang.toUpperCase()} trong localStorage!`);
      return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    saveAs(blob, fileName);
    message.success(`Đã tải xuống ${fileName}`);
    setIsModalOpen(false);
  };

  const handleDownloadAll = () => {
    const translations = getTranslations();
    
    if (!translations) {
      message.warning('Chưa có dữ liệu trong localStorage!');
      return;
    }

    const allData = {
      en: translations.en,
      jp: translations.jp,
      malay: translations.malay
    };

    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    saveAs(blob, 'all_translations.json');
    message.success('Đã tải xuống all_translations.json');
    setIsModalOpen(false);
  };

  const handleDownloadTypeDefinition = () => {
    const translations = getTranslations();
    
    if (!translations) {
      message.warning('Chưa có dữ liệu trong localStorage!');
      return;
    }

    // Generate type definition from current translations in localStorage
    // Flatten nested keys giống như script Node.js
    const enKeys = flattenKeys(translations.en || {});
    
    if (enKeys.length === 0) {
      message.warning('Chưa có translation keys!');
      return;
    }

    const typeDefinition = `// Auto-generated file. Do not edit manually.
// Generated at: ${new Date().toISOString()}
// Generated from: localStorage (Browser)
// Alternative: Run node scripts/generate-translation-types.cjs (from JSON files)

export type TranslationKey = 
${enKeys.map(key => `  | '${key}'`).join('\n')};

// Union type for easier use
export type TranslationKeyUnion = ${enKeys.map(key => `'${key}'`).join(' | ')};

// Module augmentation cho react-i18next (tự động gợi ý khi dùng useTranslation)
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: Record<TranslationKey, string>;
    };
  }
}

// Module augmentation cho next-intl (tự động gợi ý khi dùng useTranslations)
declare module 'next-intl' {
  interface Messages extends Record<TranslationKey, string> {}
}

declare global {
  namespace TranslationKeys {
    type Key = TranslationKey;
  }
}
`;

    const blob = new Blob([typeDefinition], { type: 'text/typescript;charset=utf-8' });
    saveAs(blob, 'translations.d.ts');
    message.success(`Đã tải xuống translations.d.ts với ${enKeys.length} keys`);
  };

  // Export JSON files với tên đúng để copy vào src/translate/ cho script generate types
  const handleExportForTypeGeneration = () => {
    const translations = getTranslations();
    
    if (!translations) {
      message.warning('Chưa có dữ liệu trong localStorage!');
      return;
    }

    // Download từng file với tên đúng: en.json, jp.json, malay.json
    const languages: Array<{ lang: 'en' | 'jp' | 'malay'; fileName: string }> = [
      { lang: 'en', fileName: 'en.json' },
      { lang: 'jp', fileName: 'jp.json' },
      { lang: 'malay', fileName: 'malay.json' },
    ];

    languages.forEach(({ lang, fileName }, index) => {
      const data = translations[lang] || {};
      if (Object.keys(data).length > 0) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        // Delay để download từng file một cách tuần tự
        setTimeout(() => {
          saveAs(blob, fileName);
        }, index * 200);
      }
    });

    message.success('Đã tải xuống en.json, jp.json, malay.json. Copy vào src/translate/ để generate types!');
    setIsModalOpen(false);
  };

  // Download tất cả files đã generate: JSON files + Type Definition
  const handleDownloadAllGeneratedFiles = () => {
    const translations = getTranslations();
    
    if (!translations) {
      message.warning('Chưa có dữ liệu trong localStorage!');
      return;
    }

    // 1. Download JSON files: en.json, jp.json, malay.json
    const languages: Array<{ lang: 'en' | 'jp' | 'malay'; fileName: string }> = [
      { lang: 'en', fileName: 'en.json' },
      { lang: 'jp', fileName: 'jp.json' },
      { lang: 'malay', fileName: 'malay.json' },
    ];

    languages.forEach(({ lang, fileName }, index) => {
      const data = translations[lang] || {};
      if (Object.keys(data).length > 0) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        setTimeout(() => {
          saveAs(blob, fileName);
        }, index * 200);
      }
    });

    // 2. Generate và download Type Definition
    const enKeys = flattenKeys(translations.en || {});
    
    if (enKeys.length > 0) {
      const typeDefinition = `// Auto-generated file. Do not edit manually.
// Generated at: ${new Date().toISOString()}
// Generated from: localStorage (Browser)

export type TranslationKey = 
${enKeys.map(key => `  | '${key}'`).join('\n')};

// Union type for easier use
export type TranslationKeyUnion = ${enKeys.map(key => `'${key}'`).join(' | ')};

// Module augmentation cho react-i18next (tự động gợi ý khi dùng useTranslation)
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: Record<TranslationKey, string>;
    };
  }
}

// Module augmentation cho next-intl (tự động gợi ý khi dùng useTranslations)
declare module 'next-intl' {
  interface Messages extends Record<TranslationKey, string> {}
}

declare global {
  namespace TranslationKeys {
    type Key = TranslationKey;
  }
}
`;

      const blob = new Blob([typeDefinition], { type: 'text/typescript;charset=utf-8' });
      setTimeout(() => {
        saveAs(blob, 'translations.d.ts');
      }, languages.length * 200);
    }

    message.success(`Đã tải xuống tất cả files: en.json, jp.json, malay.json, translations.d.ts (${enKeys.length} keys)`);
    setIsModalOpen(false);
  };

  return (
    <>
      <Card 
        title="💾 Download JSON Files" 
        className="mb-4"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
        }}
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Chọn loại download
          </Button>
        }
      >
        <Paragraph className="text-gray-600 mb-0">
          <strong>Mô tả:</strong> Tải xuống các file JSON đã được dịch và cập nhật, hoặc TypeScript type definition. 
          Bạn có thể tải xuống từng file riêng lẻ (EN.json, JP.json, Malay.json), 
          tải xuống tất cả trong 1 file (all_translations.json), hoặc download type definition (translations.d.ts) để dùng trong project khác.
        </Paragraph>
      </Card>

      <Modal
        title="📥 Chọn loại file để download"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Space direction="vertical" size="large" className="w-full">
          {/* Section: Download All Generated Files - Cho project mới */}
          <div>
            <Text strong className="text-base block mb-2">✨ Download Tất Cả Files Cho Project Mới (Khuyến nghị)</Text>
            <Paragraph className="text-gray-600 text-sm mb-3">
              <strong>Workflow đơn giản nhất:</strong> Upload Excel → Download tất cả files → Copy vào project mới → Dùng ngay!
              <br />
              Tool sẽ tự động download <strong>4 files</strong>:
              <ul className="list-disc ml-5 mt-1">
                <li><code className="bg-gray-100 px-1 rounded">en.json</code> - Copy vào <code className="bg-gray-100 px-1 rounded">src/translate/en.json</code></li>
                <li><code className="bg-gray-100 px-1 rounded">jp.json</code> - Copy vào <code className="bg-gray-100 px-1 rounded">src/translate/jp.json</code></li>
                <li><code className="bg-gray-100 px-1 rounded">malay.json</code> - Copy vào <code className="bg-gray-100 px-1 rounded">src/translate/malay.json</code></li>
                <li><code className="bg-gray-100 px-1 rounded">translations.d.ts</code> - Copy vào <code className="bg-gray-100 px-1 rounded">src/types/translations.d.ts</code></li>
              </ul>
              <strong className="text-green-600">Không cần Node.js, không cần chạy script!</strong>
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleDownloadAllGeneratedFiles}
              className="w-full"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              🚀 Download Tất Cả Files (en.json + jp.json + malay.json + translations.d.ts)
            </Button>
          </div>

          <Divider>Hoặc download từng loại riêng</Divider>

          <div>
            <Text strong className="text-base block mb-2">Tải xuống tất cả (Recommended)</Text>
            <Paragraph className="text-gray-600 text-sm mb-3">
              Tải xuống 1 file duy nhất chứa tất cả 3 ngôn ngữ (en, jp, malay) trong cùng một object.
              File này phù hợp khi bạn muốn quản lý tất cả translations trong một nơi.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleDownloadAll}
              className="w-full"
              style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
            >
              Download All (all_translations.json)
            </Button>
          </div>

          <Divider>Hoặc tải từng file riêng</Divider>

          <div>
            <Text strong className="text-base block mb-2">Tải xuống từng file riêng</Text>
            <Paragraph className="text-gray-600 text-sm mb-3">
              Tải xuống từng file JSON riêng biệt cho từng ngôn ngữ. 
              Phù hợp khi bạn cần sử dụng từng file độc lập trong dự án.
            </Paragraph>
            <Space direction="vertical" size="middle" className="w-full">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload('en', 'EN.json')}
                className="w-full"
              >
                Download EN.json (English)
              </Button>
              
              <Button
                type="primary"
                danger
                icon={<DownloadOutlined />}
                onClick={() => handleDownload('jp', 'JP.json')}
                className="w-full"
              >
                Download JP.json (Japanese)
              </Button>
              
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload('malay', 'Malay.json')}
                className="w-full"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Download Malay.json (Malay)
              </Button>
            </Space>
          </div>

          <Divider>🔧 Export cho CI/CD & Automation (Cần Node.js)</Divider>

          <div>
            <Text strong className="text-base block mb-2">Export JSON Files cho Script Generate Types</Text>
            <Paragraph className="text-gray-600 text-sm mb-3">
              <strong>Cho CI/CD và automation:</strong> Tải xuống các file JSON với tên đúng (<code className="bg-gray-100 px-1 rounded">en.json</code>, <code className="bg-gray-100 px-1 rounded">jp.json</code>, <code className="bg-gray-100 px-1 rounded">malay.json</code>) từ localStorage để copy vào thư mục <code className="bg-gray-100 px-1 rounded">src/translate/</code> trong project, sau đó chạy script Node.js để generate types tự động trong build process.
              <br />
              <br />
              <strong>Khi nào dùng cách này:</strong>
              <ul className="list-disc ml-5 mt-1">
                <li>Khi muốn tự động generate types trong GitHub Actions / CI/CD</li>
                <li>Khi muốn tích hợp vào build process</li>
                <li>Khi muốn version control JSON files trong repo</li>
              </ul>
              <br />
              <strong>Cách dùng:</strong>
              <ol className="list-decimal ml-5 mt-1">
                <li>Click button bên dưới để download 3 file JSON</li>
                <li>Copy các file vào <code className="bg-gray-100 px-1 rounded">src/translate/</code> trong project</li>
                <li>Chạy: <code className="bg-gray-100 px-1 rounded">node scripts/generate-translation-types.cjs</code></li>
                <li>File <code className="bg-gray-100 px-1 rounded">src/types/translations.d.ts</code> sẽ được tạo tự động</li>
              </ol>
            </Paragraph>
            <Button
              type="default"
              size="large"
              icon={<DownloadOutlined />}
              onClick={handleExportForTypeGeneration}
              className="w-full"
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
            >
              📤 Export JSON Files (en.json, jp.json, malay.json) - Cho CI/CD
            </Button>
          </div>

          <Divider>📘 Type Definition (Khuyến nghị - Không cần Node.js)</Divider>

          <div>
            <Text strong className="text-base block mb-2">Download TypeScript Type Definition (Từ localStorage)</Text>
            <Paragraph className="text-gray-600 text-sm mb-3">
              <strong>✨ Cách đơn giản nhất:</strong> Generate và download file <code className="bg-gray-100 px-1 rounded">translations.d.ts</code> trực tiếp từ localStorage trong browser. 
              <strong className="text-green-600"> Không cần Node.js!</strong>
              <br />
              File này chứa tất cả translation keys (bao gồm nested keys) với type-safe cho TypeScript, giúp auto-complete và type checking khi code.
              <br />
              <br />
              <strong>Cách dùng:</strong>
              <ol className="list-decimal ml-5 mt-1">
                <li>Click button bên dưới để download <code className="bg-gray-100 px-1 rounded">translations.d.ts</code></li>
                <li>Copy file vào <code className="bg-gray-100 px-1 rounded">src/types/translations.d.ts</code> trong project</li>
                <li>Import và sử dụng: <code className="bg-gray-100 px-1 rounded">import type {'{'} TranslationKey {'}'} from '@/types/translations';</code></li>
              </ol>
              <br />
              <strong>💡 Lưu ý:</strong> Nếu bạn muốn tự động hóa trong CI/CD hoặc build process, hãy dùng cách "Export cho Type Generation" ở trên và chạy script Node.js.
            </Paragraph>
            <Button
              type="default"
              size="large"
              icon={<FileTextOutlined />}
              onClick={handleDownloadTypeDefinition}
              className="w-full"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
            >
              📥 Download translations.d.ts (Từ localStorage - Không cần Node.js)
            </Button>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default DownloadJSONtranslated;
