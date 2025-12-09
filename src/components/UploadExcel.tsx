//BA sẽ upload excel, file mà định nghĩa các translation key và value cho 3 bản dịch
//key được nối dựa trên cột eng: ví dụ Home Title sẽ là home_title
import { useState, useRef } from 'react';
import { Card, Button, message, Space, Alert, Typography } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { getTranslations, saveTranslations } from '../utils/storage';
import type { ChangeRecord, ChangeStatus } from '../utils/types';

const { Paragraph } = Typography;

interface UploadExcelProps {
  onChangesDetected: (changes: ChangeRecord[]) => void;
}

const UploadExcel = ({ onChangesDetected }: UploadExcelProps) => {
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert text to key format: "Home Title" -> "home_title"
  const textToKey = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      message.error('File phải là Excel (.xlsx hoặc .xls)!');
      setStatus('❌ File phải là Excel (.xlsx hoặc .xls)!');
      return;
    }

    setIsProcessing(true);
    setStatus('⏳ Đang xử lý file Excel...');
    message.loading({ content: 'Đang xử lý file Excel...', key: 'uploading', duration: 0 });

    try {
      // Đọc file Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Đọc với header: true để lấy tên cột từ hàng đầu tiên
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length === 0) {
        throw new Error('File Excel trống!');
      }

      // Hàng đầu tiên là header (tên cột)
      const headers = jsonData[0].map((h: any) => String(h || '').trim());
      
      // Tìm cột "English" (case-insensitive nhưng phải match chính xác)
      const englishColIndex = headers.findIndex((h: string) => 
        h.toLowerCase() === 'english'
      );

      if (englishColIndex === -1) {
        message.error({ 
          content: 'File Excel phải có cột tên "English" ở hàng đầu tiên!', 
          key: 'uploading' 
        });
        setStatus('❌ File Excel phải có cột tên "English" ở hàng đầu tiên!');
        setIsProcessing(false);
        return;
      }

      // Kiểm tra số cột: phải có 2 hoặc 3 cột
      if (headers.length < 2 || headers.length > 3) {
        message.error({ 
          content: `File Excel phải có 2 hoặc 3 cột (hiện tại có ${headers.length} cột)!`, 
          key: 'uploading' 
        });
        setStatus(`❌ File Excel phải có 2 hoặc 3 cột (hiện tại có ${headers.length} cột)!`);
        setIsProcessing(false);
        return;
      }

      // Lấy dữ liệu hiện tại từ localStorage
      const currentTranslations = getTranslations() || { en: {}, jp: {}, malay: {} };

      // Parse Excel data từ hàng thứ 2 trở đi (bỏ qua header)
      const changes: ChangeRecord[] = [];
      const updatedTranslations = { ...currentTranslations };

      // Xác định các cột khác (có thể là Japanese hoặc Malay)
      const otherColIndices = headers
        .map((h, idx) => ({ name: h, index: idx }))
        .filter(({ index }) => index !== englishColIndex);

      // Xác định cột nào là Japanese và Malay
      let japaneseColIndex = -1;
      let malayColIndex = -1;

      otherColIndices.forEach(({ name, index }) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('japan') || lowerName.includes('jp') || lowerName.includes('ja')) {
          japaneseColIndex = index;
        } else if (lowerName.includes('malay') || lowerName.includes('ms')) {
          malayColIndex = index;
        }
      })

      // Nếu chỉ có 2 cột và không xác định được cột thứ 2, mặc định là Japanese
      if (headers.length === 2 && japaneseColIndex === -1 && malayColIndex === -1) {
        japaneseColIndex = otherColIndices[0]?.index ?? -1;
      }

      // Xử lý từng dòng dữ liệu (bỏ qua hàng đầu tiên là header)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const engText = String(row[englishColIndex] || '').trim();
        if (!engText) continue; // Bỏ qua dòng không có English

        const jpValue = japaneseColIndex >= 0 ? String(row[japaneseColIndex] || '').trim() : '';
        const malayValue = malayColIndex >= 0 ? String(row[malayColIndex] || '').trim() : '';

        // Tạo key từ cột English: "Home Title" -> "home_title"
        const key = textToKey(engText);

        // Kiểm tra thay đổi cho từng ngôn ngữ
        const oldEn = currentTranslations.en[key] || '';
        const oldJp = currentTranslations.jp[key] || '';
        const oldMalay = currentTranslations.malay[key] || '';

        const enChanged = oldEn !== engText;
        const jpChanged = japaneseColIndex >= 0 && oldJp !== jpValue;
        const malayChanged = malayColIndex >= 0 && oldMalay !== malayValue;

        const isNew = !(key in currentTranslations.en) && 
                     !(key in currentTranslations.jp) && 
                     !(key in currentTranslations.malay);

        if (isNew || enChanged || jpChanged || malayChanged) {
          // Update translations
          updatedTranslations.en[key] = engText;
          if (japaneseColIndex >= 0 && jpValue) updatedTranslations.jp[key] = jpValue;
          if (malayColIndex >= 0 && malayValue) updatedTranslations.malay[key] = malayValue;

          // Xác định status
          let changeStatus: ChangeStatus = 'unchanged';
          if (isNew) {
            changeStatus = 'added';
          } else if (enChanged || jpChanged || malayChanged) {
            changeStatus = 'updated';
          }

          changes.push({
            key,
            en: engText,
            jp: jpValue || oldJp,
            malay: malayValue || oldMalay,
            status: changeStatus
          });
        }
      }

      // Lưu vào localStorage
      saveTranslations(updatedTranslations);

      // Gọi callback với changes
      onChangesDetected(changes);

      const addedCount = changes.filter(c => c.status === 'added').length;
      const updatedCount = changes.filter(c => c.status === 'updated').length;
      const successMsg = `Đã merge Excel thành công! Phát hiện ${changes.length} thay đổi (${addedCount} mới, ${updatedCount} cập nhật)`;
      
      message.success({ content: successMsg, key: 'uploading', duration: 3 });
      setStatus(`✅ ${successMsg}`);
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      const errorMsg = `Lỗi khi xử lý file Excel: ${error instanceof Error ? error.message : 'Unknown error'}`;
      message.error({ content: errorMsg, key: 'uploading' });
      setStatus(`❌ ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card 
      title="📊 Upload Excel File" 
      className="mb-0"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        flex: 1
      }}
    >
      <Space direction="vertical" size="middle" className="w-full">
        <Alert
          message="Mô tả chức năng"
          description={
            <Paragraph className="mb-0 text-sm">
              <strong>Cập nhật translations:</strong> Dữ liệu từ file Excel sẽ được tạo ra json. 
              <br />
              <strong>Home Title" → "home_title</strong> 
            </Paragraph>
          }
          type="info"
          showIcon
        />

        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            disabled={isProcessing}
            style={{ display: 'none' }}
          />
          <Button
            type="primary"
            size="large"
            icon={<FileExcelOutlined />}
            onClick={handleButtonClick}
            loading={isProcessing}
            className="w-full"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            {isProcessing ? 'Đang xử lý...' : 'Upload Excel File'}
          </Button>
        </div>

        <Alert
          message="Yêu cầu format Excel"
          description={
            <div className="text-sm">
              <p><strong>Bắt buộc:</strong></p>
              <ul className="list-disc ml-5 mt-1">
                <li>File phải có <strong>2 hoặc 3 cột</strong></li>
                <li>Hàng đầu tiên là <strong>header (tên cột)</strong></li>
                <li>Phải có 1 cột tên là <strong>"English"</strong> (chính xác, không phân biệt hoa thường)</li>
                <li>Các cột khác có thể là: Japanese, JP, JA, Malay, MS...</li>
              </ul>
              <p className="mt-2"><strong>Ví dụ:</strong></p>
              <p className="ml-4">English | Japanese | Malay</p>
              <p className="ml-4">English | JP</p>
            </div>
          }
          type="warning"
          showIcon
        />

        {status && (
          <Alert
            message={status}
            type={status.includes('✅') ? 'success' : status.includes('⏳') ? 'info' : 'error'}
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};

export default UploadExcel;
