import { useState } from 'react';
import { ConfigProvider, Collapse, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import UploadJson from './components/UploadJson';
import UploadExcel from './components/UploadExcel';
import LogTable from './components/LogTable';
import DownloadJSONtranslated from './components/DownloadJSONtranslated';
import type { ChangeRecord } from './utils/types';
import './App.css';

const { Title, Paragraph, Text } = Typography;

function App() {
  const [changes, setChanges] = useState<ChangeRecord[]>([]);

  const handleChangesDetected = (newChanges: ChangeRecord[]) => {
    setChanges(newChanges);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            🌍 i18n Translation Tool
          </h1>
          
          {/* Quick Start Guide */}
          <Collapse
            items={[
              {
                key: '1',
                label: (
                  <span className="text-lg font-semibold">
                    <QuestionCircleOutlined className="mr-2" />
                    📖 Hướng Dẫn Sử Dụng - Quick Start
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    <div>
                      <Title level={4}>🚀 Workflow: Upload Excel → Download Files → Copy Vào Project Mới</Title>
                      
                      <Title level={5}>Bước 1: Upload Excel File</Title>
                      <Paragraph>
                        <ol className="list-decimal ml-5 space-y-2">
                          <li>Chuẩn bị file Excel với format:
                            <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
{`English              | Japanese            | Malay
Home Title           | ホームタイトル        | Tajuk Utama
Welcome Message      | ようこそメッセージ     | Mesej Selamat Datang`}
                            </pre>
                          </li>
                          <li>Click button <strong>"Upload Excel File"</strong> trên tool</li>
                          <li>Chọn file Excel của bạn</li>
                          <li>Tool tự động:
                            <ul className="list-disc ml-5 mt-1">
                              <li>Đọc file Excel</li>
                              <li>Tạo keys từ cột English (ví dụ: "Home Title" → <code className="bg-gray-100 px-1 rounded">home_title</code>)</li>
                              <li>Lưu vào localStorage</li>
                            </ul>
                          </li>
                        </ol>
                      </Paragraph>

                      <Title level={5}>Bước 2: Download Tất Cả Files</Title>
                      <Paragraph>
                        <ol className="list-decimal ml-5 space-y-2">
                          <li>Click button <strong>"Chọn loại download"</strong> trên card Download JSON Files</li>
                          <li>Chọn button đầu tiên: <strong>"🚀 Download Tất Cả Files"</strong> (màu xanh lá)</li>
                          <li>Tool sẽ tự động download <strong>4 files</strong>:
                            <ul className="list-disc ml-5 mt-1">
                              <li><code className="bg-gray-100 px-1 rounded">en.json</code></li>
                              <li><code className="bg-gray-100 px-1 rounded">jp.json</code></li>
                              <li><code className="bg-gray-100 px-1 rounded">malay.json</code></li>
                              <li><code className="bg-gray-100 px-1 rounded">translations.d.ts</code></li>
                            </ul>
                          </li>
                        </ol>
                      </Paragraph>

                      <Title level={5}>Bước 3: Copy Vào Project Mới</Title>
                      <Paragraph>
                        <Text strong className="block mb-2">📝 Lưu ý quan trọng:</Text>
                        <ul className="list-disc ml-5 space-y-1">
                          <li><strong>File JSON</strong> (<code className="bg-gray-100 px-1 rounded">en.json</code>, <code className="bg-gray-100 px-1 rounded">jp.json</code>, <code className="bg-gray-100 px-1 rounded">malay.json</code>) có thể copy vào <strong>bất kỳ đâu</strong> trong project (vị trí không ảnh hưởng đến auto-complete)</li>
                          <li><strong>File <code className="bg-gray-100 px-1 rounded">translations.d.ts</code></strong> phải copy vào thư mục <code className="bg-gray-100 px-1 rounded">types</code> (hoặc thư mục được include trong <code className="bg-gray-100 px-1 rounded">tsconfig.json</code>)</li>
                        </ul>
                        <Text strong className="block mt-3 mb-2">Ví dụ cấu trúc:</Text>
                        <pre className="bg-gray-100 p-3 rounded text-sm">
{`project/
├── src/
│   ├── translate/          ← JSON files có thể vào đây
│   │   ├── en.json          ← Copy từ download (vị trí tùy ý)
│   │   ├── jp.json          ← Copy từ download (vị trí tùy ý)
│   │   └── malay.json       ← Copy từ download (vị trí tùy ý)
│   └── types/
│       └── translations.d.ts  ← Copy vào đây (BẮT BUỘC)`}
                        </pre>
                      </Paragraph>

                      <Title level={5}>Bước 4: Sử Dụng Trong Code - Auto-complete với useTranslation()</Title>
                      <Paragraph>
                        <Text strong className="text-green-600">✨ File <code className="bg-gray-100 px-1 rounded">translations.d.ts</code> đã có module augmentation</Text>, bạn sẽ có <strong>auto-complete tự động</strong> khi gõ <code className="bg-gray-100 px-1 rounded">t('h</code>!
                      </Paragraph>

                      <Title level={5}>Với react-i18next:</Title>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { useTranslation } from 'react-i18next';
// Không cần import TranslationKey!

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      {/* ✅ Auto-complete khi gõ t('h → gợi ý home_title, welcome_message, etc. */}
      <h1>{t('home_title')}</h1>
      <p>{t('welcome_message')}</p>
    </div>
  );
}`}
                      </pre>

                      <Title level={5}>Với next-intl:</Title>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { useTranslations } from 'next-intl';
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
}`}
                      </pre>

                      <Paragraph>
                        <Text strong className="text-green-600">🎯 Kết quả:</Text> Khi bạn gõ <code className="bg-gray-100 px-1 rounded">t('h</code>, VS Code sẽ tự động gợi ý tất cả keys bắt đầu bằng 'h'!
                      </Paragraph>

                      <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
                        <Title level={5} className="text-green-800">✅ Hoàn Thành!</Title>
                        <Paragraph className="mb-2">
                          Bạn đã có:
                        </Paragraph>
                        <ul className="list-disc ml-5 space-y-1 text-green-800">
                          <li>3 file JSON translations (en, jp, malay)</li>
                          <li>TypeScript type definitions</li>
                          <li>Auto-complete và type checking trong code</li>
                        </ul>
                        <Paragraph className="mt-2 mb-0">
                          <Text strong className="text-green-800">Không cần:</Text>
                          <ul className="list-disc ml-5 space-y-1 text-green-800">
                            <li>Node.js</li>
                            <li>Chạy script</li>
                            <li>Cấu hình phức tạp</li>
                          </ul>
                        </Paragraph>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
            className="mb-6"
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
            }}
          />
          
          <div className="space-y-4">
            {/* Upload Section - 2 cards trên 1 dòng */}
            <div className="flex gap-x-3 border-amber-600 border-2">
              <UploadJson />
              <UploadExcel onChangesDetected={handleChangesDetected} />
            </div>

            {/* Download Section */}
            <div className='mt-4'>
            <DownloadJSONtranslated />

            </div>
         
            {/* Changes Table - riêng 1 dòng */}
            <LogTable changes={changes} />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
