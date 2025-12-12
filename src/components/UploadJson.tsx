// 3 phiên bản eng, ja, malay
//khi upload xong sẽ được lưu vào localstorage
//để cập nhật dữ liệu mới nhất nếu có vào localstorage- nếu không thì sẽ dùng dữ liệu localstorage- người dùng lựa chọn file eng, jp hay malay
import { useState, useRef } from 'react';
import { Card, Button, Modal, message, Space, Typography, Alert, Collapse } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { saveLanguage, hasInitialData } from '../utils/storage';
import type { Language } from '../utils/storage';

const { Paragraph } = Typography;

const UploadJson = () => {
  const [status, setStatus] = useState<string>('');
  const [isUploaded, setIsUploaded] = useState(hasInitialData());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRefEn = useRef<HTMLInputElement>(null);
  const fileInputRefJp = useRef<HTMLInputElement>(null);
  const fileInputRefMalay = useRef<HTMLInputElement>(null);

  const handleButtonClick = (lang: Language) => {
    if (lang === 'en') {
      fileInputRefEn.current?.click();
    } else if (lang === 'jp') {
      fileInputRefJp.current?.click();
    } else if (lang === 'malay') {
      fileInputRefMalay.current?.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, lang: Language) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      message.error(`File ${file.name} không phải file JSON!`);
      setStatus(`❌ File ${file.name} không phải file JSON!`);
      return;
    }

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Validate JSON structure
      if (typeof jsonData !== 'object' || Array.isArray(jsonData)) {
        message.error(`File ${file.name} không đúng định dạng JSON (phải là object)`);
        setStatus(`❌ File ${file.name} không đúng định dạng JSON (phải là object)`);
        return;
      }

      // Lưu vào localStorage
      saveLanguage(lang, jsonData);
      message.success(`Đã upload ${file.name} thành công!`);
      setStatus(`✅ Đã upload ${file.name} thành công!`);
      setIsUploaded(hasInitialData());
      setIsModalOpen(false);

      // Reset input
      event.target.value = '';
    } catch (error) {
      const errorMsg = `Lỗi khi đọc file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      message.error(errorMsg);
      setStatus(`❌ ${errorMsg}`);
    }
  };

  return (
    <>
      <Card
        title="📤 Upload JSON Files"
        className="mb-0"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e8e8e8',
          borderRadius: '8px',
        }}
        extra={
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setIsModalOpen(true)}>
            Chọn file JSON
          </Button>
        }
      >
        <Collapse
          items={[
            {
              key: '1',
              label: 'ℹ️ Mô tả chức năng',
              children: (
                <Paragraph className="mb-0 text-sm">
                  Upload dữ liệu trong json lên nếu có để đồng bộ mới
                </Paragraph>
              ),
            },
          ]}
          size="small"
          ghost
        />

        {isUploaded && (
          <Alert
            message="Đã có dữ liệu"
            description="Đã có dữ liệu cũ được lưu. Bạn có thể upload lại để thay thế."
            type="success"
            showIcon
            className="mt-4"
          />
        )}

        {status && (
          <Alert
            message={status}
            type={status.includes('✅') ? 'success' : 'error'}
            showIcon
            className="mt-4"
          />
        )}
      </Card>

      <Modal
        title="📤 Chọn file JSON để upload"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Space direction="vertical" size="large" className="w-full">
          <Paragraph className="text-gray-600 text-sm mb-0">
            Chọn file JSON bạn muốn upload. Bạn có thể upload từng file riêng lẻ hoặc upload cả 3
            file.
          </Paragraph>

          <div>
            <input
              ref={fileInputRefEn}
              type="file"
              accept=".json"
              onChange={(e) => handleFileUpload(e, 'en')}
              style={{ display: 'none' }}
            />
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => handleButtonClick('en')}
              className="w-full mb-2"
            >
              Upload EN.json (English)
            </Button>
          </div>

          <div>
            <input
              ref={fileInputRefJp}
              type="file"
              accept=".json"
              onChange={(e) => handleFileUpload(e, 'jp')}
              style={{ display: 'none' }}
            />
            <Button
              type="primary"
              danger
              icon={<UploadOutlined />}
              onClick={() => handleButtonClick('jp')}
              className="w-full mb-2"
            >
              Upload JP.json (Japanese)
            </Button>
          </div>

          <div>
            <input
              ref={fileInputRefMalay}
              type="file"
              accept=".json"
              onChange={(e) => handleFileUpload(e, 'malay')}
              style={{ display: 'none' }}
            />
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => handleButtonClick('malay')}
              className="w-full"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Upload Malay.json (Malay)
            </Button>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default UploadJson;
