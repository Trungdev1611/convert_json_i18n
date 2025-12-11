//File để download json đã được translated từ file excel BA upload lên, 
//người dùng sẽ dowload được 3 file json hoặc 1 file với 3 phần eng, jp và malay
import { useState } from 'react';
import { Card, Button, Modal, Space, message, Typography, Divider } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import { getLanguage, getTranslations } from '../utils/storage';

const { Text, Paragraph } = Typography;

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
    const enKeys = Object.keys(translations.en || {}).sort();
    
    if (enKeys.length === 0) {
      message.warning('Chưa có translation keys!');
      return;
    }

    const typeDefinition = `// Auto-generated file. Do not edit manually.
// Generated at: ${new Date().toISOString()}
// Run: node scripts/generate-translation-types.cjs

export type TranslationKey = 
${enKeys.map(key => `  | '${key}'`).join('\n')};

// Union type for easier use
export type TranslationKeyUnion = ${enKeys.map(key => `'${key}'`).join(' | ')};

declare global {
  namespace TranslationKeys {
    type Key = TranslationKey;
  }
}
`;

    const blob = new Blob([typeDefinition], { type: 'text/typescript;charset=utf-8' });
    saveAs(blob, 'translations.d.ts');
    message.success('Đã tải xuống translations.d.ts');
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

          <Divider>📘 Type Definition (Cho project khác)</Divider>

          <div>
            <Text strong className="text-base block mb-2">Download TypeScript Type Definition</Text>
            <Paragraph className="text-gray-600 text-sm mb-3">
              Tải xuống file <code className="bg-gray-100 px-1 rounded">translations.d.ts</code> để sử dụng trong project khác. 
              File này chứa tất cả translation keys với type-safe cho TypeScript, giúp auto-complete và type checking khi code.
              <br />
              <strong>Cách dùng:</strong> Copy file vào <code className="bg-gray-100 px-1 rounded">src/types/translations.d.ts</code> trong project mới, sau đó import và sử dụng.
            </Paragraph>
            <Button
              type="default"
              size="large"
              icon={<FileTextOutlined />}
              onClick={handleDownloadTypeDefinition}
              className="w-full"
            >
              📥 Download translations.d.ts
            </Button>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default DownloadJSONtranslated;
