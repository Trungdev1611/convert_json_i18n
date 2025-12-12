//BA sẽ upload excel, file mà định nghĩa các translation key và value cho 3 bản dịch
//key được nối dựa trên cột eng: ví dụ Home Title sẽ là home_title
import { useState, useRef } from 'react';
import {
  Card,
  Button,
  message,
  Space,
  Alert,
  Typography,
  Tabs,
  Input,
  Modal,
  Collapse,
} from 'antd';
import { FileExcelOutlined, BgColorsOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { getTranslations, saveTranslations, saveUndoSnapshot } from '../utils/storage';
import type { ChangeRecord, ChangeStatus } from '../utils/types';

const { Paragraph } = Typography;

interface UploadExcelProps {
  onChangesDetected: (changes: ChangeRecord[]) => void;
}

const UploadExcel = ({ onChangesDetected }: UploadExcelProps) => {
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pastedData, setPastedData] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert text to key format: "Home Title" -> "home_title" (max 16 words)
  const textToKey = (text: string): string => {
    const words = text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .split(/\s+/) // Split by spaces
      .filter((word) => word.length > 0) // Remove empty strings
      .slice(0, 16); // Take only first 16 words

    return words
      .join('_')
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  };

  // Parse pasted text data (tab-separated or multiple spaces)
  const parsePastedData = (text: string): string[][] => {
    const lines = text.trim().split(/\r?\n/); // Support both \n and \r\n
    return lines
      .map((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return []; // Skip empty lines

        // Split by tab first (most reliable for Excel paste)
        if (trimmedLine.includes('\t')) {
          // Split by tab and map, preserving empty strings for empty cells
          const cells = trimmedLine.split('\t');
          // Map cells and trim, but keep empty strings (don't filter them out)
          // This allows us to detect columns 2 and 3 even if they're empty
          return cells.map((cell) => cell.trim());
        } else {
          // Try to split by multiple spaces (2 or more)
          // Use a regex that matches 2+ consecutive spaces
          const parts = trimmedLine.split(/\s{2,}/);
          // If we got more than 1 part, it's likely separated by multiple spaces
          if (parts.length > 1) {
            return parts.map((cell) => cell.trim());
          }
          // Otherwise, return as single column
          return [trimmedLine];
        }
      })
      .filter((row) => row.length > 0); // Remove empty rows
  };

  // Process data array (shared logic for both file upload and paste)
  const processDataArray = (
    jsonData: (string | number | null | undefined)[][],
    englishColIndex: number
  ): void => {
    if (jsonData.length === 0) {
      throw new Error('Dữ liệu trống!');
    }

    // Hàng đầu tiên là header (tên cột)
    const headers = jsonData[0].map((h: string | number | null | undefined) =>
      String(h || '').trim()
    );

    // Kiểm tra số cột: phải có 2 hoặc 3 cột
    if (headers.length < 2 || headers.length > 3) {
      throw new Error(`Dữ liệu phải có 2 hoặc 3 cột (hiện tại có ${headers.length} cột)!`);
    }

    // Lấy dữ liệu hiện tại từ localStorage
    const currentTranslations = getTranslations() || { en: {}, jp: {}, malay: {} };

    // Parse data từ hàng thứ 2 trở đi (bỏ qua header)
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
    });

    // Nếu không xác định được cột Japanese/Malay từ header, dùng logic mặc định
    if (japaneseColIndex === -1 && malayColIndex === -1) {
      // Có 3 cột: cột 1 = English (đã biết), cột 2 = Japanese, cột 3 = Malay
      if (headers.length === 3) {
        japaneseColIndex = otherColIndices[0]?.index ?? -1;
        malayColIndex = otherColIndices[1]?.index ?? -1;
      }
      // Có 2 cột: cột 1 = English, cột 2 = Japanese
      else if (headers.length === 2) {
        japaneseColIndex = otherColIndices[0]?.index ?? -1;
      }
    } else if (japaneseColIndex === -1) {
      // Đã có Malay nhưng chưa có Japanese, và có 3 cột
      if (headers.length === 3) {
        japaneseColIndex =
          otherColIndices.find(({ index }) => index !== malayColIndex)?.index ?? -1;
      }
    } else if (malayColIndex === -1 && headers.length === 3) {
      // Đã có Japanese nhưng chưa có Malay, và có 3 cột
      malayColIndex = otherColIndices.find(({ index }) => index !== japaneseColIndex)?.index ?? -1;
    }

    console.log('Japanese column index:', japaneseColIndex);
    console.log('Malay column index:', malayColIndex);

    // Xử lý từng dòng dữ liệu (bỏ qua hàng đầu tiên là header)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;

      const engText = String(row[englishColIndex] || '').trim();
      if (!engText) continue; // Bỏ qua dòng không có English

      // Lấy giá trị Japanese và Malay, kiểm tra index có trong bounds
      const jpValue =
        japaneseColIndex >= 0 && japaneseColIndex < row.length
          ? String(row[japaneseColIndex] || '').trim()
          : '';
      const malayValue =
        malayColIndex >= 0 && malayColIndex < row.length
          ? String(row[malayColIndex] || '').trim()
          : '';

      // Debug log for first few rows
      if (i <= 3) {
        console.log(`Row ${i}:`, {
          engText: engText.substring(0, 50) + (engText.length > 50 ? '...' : ''),
          jpValue: jpValue
            ? jpValue.substring(0, 30) + (jpValue.length > 30 ? '...' : '')
            : '(empty)',
          malayValue: malayValue
            ? malayValue.substring(0, 30) + (malayValue.length > 30 ? '...' : '')
            : '(empty)',
          rowLength: row.length,
          jpIndex: japaneseColIndex,
          malayIndex: malayColIndex,
          fullRow: row,
        });
      }

      // Tạo key từ cột English: lấy tối đa 16 từ đầu
      const key = textToKey(engText);

      if (!key) continue; // Bỏ qua nếu không tạo được key

      // Nếu key trùng, sẽ thay thế giá trị cũ bằng giá trị mới (overwrite)

      // Kiểm tra thay đổi cho từng ngôn ngữ
      const oldEn = currentTranslations.en[key] || '';
      const oldJp = currentTranslations.jp[key] || '';
      const oldMalay = currentTranslations.malay[key] || '';

      // So sánh chính xác (trim để tránh lỗi do whitespace)
      const enChanged = oldEn.trim() !== engText.trim();
      // Chỉ check changed nếu cả 2 đều có giá trị (không phải empty) và khác nhau
      const jpChanged =
        japaneseColIndex >= 0 && jpValue && oldJp && jpValue.trim() !== oldJp.trim();
      const malayChanged =
        malayColIndex >= 0 && malayValue && oldMalay && malayValue.trim() !== oldMalay.trim();

      // Kiểm tra thêm trường hợp: nếu cột có giá trị nhưng trong localStorage trống (hoặc ngược lại)
      const jpAddedValue = japaneseColIndex >= 0 && jpValue && !oldJp;
      const malayAddedValue = malayColIndex >= 0 && malayValue && !oldMalay;
      const jpRemovedValue = japaneseColIndex >= 0 && !jpValue && oldJp;
      const malayRemovedValue = malayColIndex >= 0 && !malayValue && oldMalay;

      const isNew =
        !(key in currentTranslations.en) &&
        !(key in currentTranslations.jp) &&
        !(key in currentTranslations.malay);

      // Chỉ báo có thay đổi nếu thực sự có sự khác biệt
      const hasRealChange =
        isNew ||
        enChanged ||
        jpChanged ||
        malayChanged ||
        jpAddedValue ||
        malayAddedValue ||
        jpRemovedValue ||
        malayRemovedValue;

      if (hasRealChange) {
        // Update translations
        updatedTranslations.en[key] = engText;

        // Lưu Japanese nếu có giá trị (chỉ lưu nếu có giá trị, không lưu empty string)
        if (japaneseColIndex >= 0 && jpValue) {
          updatedTranslations.jp[key] = jpValue;
        }
        // Lưu Malay nếu có giá trị
        if (malayColIndex >= 0 && malayValue) {
          updatedTranslations.malay[key] = malayValue;
        }

        // Xác định status
        let changeStatus: ChangeStatus = 'unchanged';
        if (isNew) {
          changeStatus = 'added';
        } else if (
          enChanged ||
          jpChanged ||
          malayChanged ||
          jpAddedValue ||
          malayAddedValue ||
          jpRemovedValue ||
          malayRemovedValue
        ) {
          changeStatus = 'updated';
        }

        const changeRecord: ChangeRecord = {
          key,
          en: engText,
          jp: jpValue || oldJp || '',
          malay: malayValue || oldMalay || '',
          status: changeStatus,
        };

        // Thêm dữ liệu cũ cho trường hợp updated
        if (changeStatus === 'updated') {
          changeRecord.oldEn = oldEn || '';
          changeRecord.oldJp = oldJp || '';
          changeRecord.oldMalay = oldMalay || '';
        }

        changes.push(changeRecord);
      }
    }

    // Lưu snapshot trước khi thay đổi để undo
    const currentBeforeSave = getTranslations();
    if (currentBeforeSave) {
      saveUndoSnapshot(currentBeforeSave);
    }

    // Lưu vào localStorage
    saveTranslations(updatedTranslations);

    // Gọi callback với changes
    onChangesDetected(changes);

    const addedCount = changes.filter((c) => c.status === 'added').length;
    const updatedCount = changes.filter((c) => c.status === 'updated').length;
    const successMsg = `Đã merge dữ liệu thành công! Phát hiện ${changes.length} thay đổi (${addedCount} mới, ${updatedCount} cập nhật)`;

    message.success(successMsg);
    setStatus(`✅ ${successMsg}`);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Helper function to find English column and handle missing case
  const findEnglishColumn = (headers: string[]): Promise<number> => {
    return new Promise((resolve, reject) => {
      const englishColIndex = headers.findIndex(
        (h: string) => h.toLowerCase().trim() === 'english'
      );

      if (englishColIndex !== -1) {
        resolve(englishColIndex);
        return;
      }

      // Dismiss loading message before showing modal
      message.destroy('pasting');
      message.destroy('uploading');

      // Không tìm thấy cột English, hiển thị confirm dialog
      Modal.confirm({
        title: '⚠️ Cảnh báo: Không tìm thấy cột "English"',
        content: (
          <div>
            <p>Trong dữ liệu của bạn không có cột tên "English" ở dòng đầu tiên.</p>
            <p>
              <strong>Các cột hiện tại:</strong>{' '}
              {headers.length > 0 ? headers.join(', ') : 'Không có cột nào'}
            </p>
            <p style={{ marginTop: '8px' }}>
              Hệ thống sẽ coi <strong>cột đầu tiên</strong> ({headers[0] || 'Cột 1'}) là cột
              English.
            </p>
            <p style={{ marginTop: '8px' }}>Bạn có đồng ý tiếp tục không?</p>
          </div>
        ),
        okText: 'Đồng ý, tiếp tục',
        cancelText: 'Hủy',
        onOk: () => {
          resolve(0); // Cột đầu tiên
        },
        onCancel: () => {
          reject(new Error('Người dùng đã hủy'));
        },
      });
    });
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
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (
        | string
        | number
        | null
        | undefined
      )[][];

      if (jsonData.length === 0) {
        throw new Error('File Excel trống!');
      }

      // Hàng đầu tiên là header (tên cột)
      const headers = jsonData[0].map((h: string | number | null | undefined) =>
        String(h || '').trim()
      );

      // Tìm cột English hoặc hỏi người dùng
      const englishColIndex = await findEnglishColumn(headers);

      // Xử lý dữ liệu
      processDataArray(jsonData, englishColIndex);

      // Reset input
      event.target.value = '';
    } catch (error) {
      message.destroy('uploading');
      if (error instanceof Error && error.message === 'Người dùng đã hủy') {
        message.info('Đã hủy xử lý dữ liệu');
        setStatus('ℹ️ Đã hủy xử lý dữ liệu');
      } else {
        const errorMsg = `Lỗi khi xử lý file Excel: ${error instanceof Error ? error.message : 'Unknown error'}`;
        message.error(errorMsg);
        setStatus(`❌ ${errorMsg}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteData = async () => {
    if (!pastedData.trim()) {
      message.warning('Vui lòng paste dữ liệu vào ô text!');
      return;
    }

    setIsProcessing(true);
    setStatus('⏳ Đang xử lý dữ liệu đã paste...');
    message.loading({ content: 'Đang xử lý dữ liệu...', key: 'pasting', duration: 0 });

    try {
      // Parse dữ liệu đã paste
      const jsonData = parsePastedData(pastedData);

      if (jsonData.length === 0) {
        message.destroy('pasting');
        throw new Error('Dữ liệu trống!');
      }

      // Debug: Log để kiểm tra
      console.log('Parsed data:', jsonData);
      console.log('Number of rows:', jsonData.length);
      console.log('First row (headers):', jsonData[0]);

      // Hàng đầu tiên là header (tên cột)
      const headers = jsonData[0]
        .map((h: string | number | null | undefined) => String(h || '').trim())
        .filter((h) => h);

      console.log('Headers after filter:', headers);
      console.log('Number of columns:', headers.length);

      if (headers.length === 0) {
        message.destroy('pasting');
        throw new Error('Không tìm thấy header (dòng đầu tiên)!');
      }

      // Tìm cột English hoặc hỏi người dùng
      const englishColIndex = await findEnglishColumn(headers);

      // Xử lý dữ liệu
      processDataArray(jsonData, englishColIndex);

      // Dismiss loading và show success
      message.destroy('pasting');

      // Clear textarea
      setPastedData('');
    } catch (error) {
      message.destroy('pasting');
      if (error instanceof Error && error.message === 'Người dùng đã hủy') {
        message.info('Đã hủy xử lý dữ liệu');
        setStatus('ℹ️ Đã hủy xử lý dữ liệu');
      } else {
        const errorMsg = `Lỗi khi xử lý dữ liệu: ${error instanceof Error ? error.message : 'Unknown error'}`;
        message.error(errorMsg);
        setStatus(`❌ ${errorMsg}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card
      title="📊 Upload Excel / Paste Dữ Liệu"
      className="mb-0"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        width: '100%',
      }}
    >
      <Space direction="vertical" size="middle" className="w-full">
        <Collapse
          items={[
            {
              key: '1',
              label: 'ℹ️ Mô tả chức năng',
              children: (
                <Paragraph className="mb-0 text-sm">
                  <strong>Cập nhật translations:</strong> Dữ liệu từ file Excel hoặc paste trực tiếp
                  sẽ được tạo ra json.
                  <br />
                  <strong>"Home Title" → "home_title"</strong>
                </Paragraph>
              ),
            },
          ]}
          size="small"
          ghost
        />

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'upload' | 'paste')}
          items={[
            {
              key: 'upload',
              label: '📁 Upload File',
              children: (
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
              ),
            },
            {
              key: 'paste',
              label: '📋 Paste từ Excel',
              children: (
                <Space direction="vertical" size="middle" className="w-full">
                  <Alert
                    message="💡 Khuyến khích sử dụng Upload File"
                    description={
                      <Paragraph className="mb-0 text-sm">
                        Để đảm bảo độ chính xác và xử lý tốt nhất, chúng tôi{' '}
                        <strong>khuyến khích bạn sử dụng tính năng Upload File</strong> thay vì
                        Paste.
                        <br />
                        <strong>Lý do:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          <li>Xử lý chính xác hơn với định dạng Excel gốc</li>
                          <li>Tránh lỗi khi copy/paste (đặc biệt với các ký tự đặc biệt)</li>
                          <li>Hỗ trợ nhiều sheet và định dạng phức tạp hơn</li>
                        </ul>
                        Nếu bạn vẫn muốn sử dụng Paste, vui lòng đảm bảo dữ liệu được copy đầy đủ và
                        chính xác.
                      </Paragraph>
                    }
                    type="warning"
                    showIcon
                    closable
                  />
                  <div>
                    <Paragraph className="text-sm mb-2">
                      <strong>Hướng dẫn:</strong> Copy 2-3 cột từ Excel và paste vào ô bên dưới.
                      Dòng đầu tiên phải là tiêu đề, có cột "English".
                    </Paragraph>
                    <Input.TextArea
                      rows={8}
                      placeholder={`Ví dụ:\nEnglish\tJapanese\tMalay\nHome Title\tホームタイトル\tTajuk Utama\nWelcome Message\tようこそメッセージ\tMesej Selamat Datang`}
                      value={pastedData}
                      onChange={(e) => setPastedData(e.target.value)}
                      disabled={isProcessing}
                      style={{ fontFamily: 'monospace', fontSize: '13px' }}
                    />
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    icon={<BgColorsOutlined />}
                    onClick={handlePasteData}
                    loading={isProcessing}
                    className="w-full"
                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                  >
                    {isProcessing ? 'Đang xử lý...' : 'Xử lý dữ liệu đã paste'}
                  </Button>
                </Space>
              ),
            },
          ]}
        />

        <Collapse
          items={[
            {
              key: '1',
              label: '⚠️ Yêu cầu format dữ liệu',
              children: (
                <div className="text-sm">
                  <p>
                    <strong>Bắt buộc:</strong>
                  </p>
                  <ul className="list-disc ml-5 mt-1">
                    <li>
                      Phải có <strong>2 hoặc 3 cột</strong>
                    </li>
                    <li>
                      Hàng đầu tiên là <strong>header (tên cột)</strong>
                    </li>
                    <li>
                      Phải có 1 cột tên là <strong>"English"</strong> (không phân biệt hoa thường)
                    </li>
                    <li>Các cột khác có thể là: Japanese, JP, JA, Malay, MS...</li>
                  </ul>
                  <p className="mt-2">
                    <strong>Ví dụ:</strong>
                  </p>
                  <div className="ml-4 font-mono text-xs bg-gray-50 p-2 rounded">
                    <div>
                      English&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Japanese&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Malay
                    </div>
                    <div>
                      Home Title&nbsp;&nbsp;&nbsp;&nbsp;ホームタイトル&nbsp;&nbsp;&nbsp;&nbsp;Tajuk
                      Utama
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    <strong>Lưu ý:</strong> Khi paste từ Excel, các cột sẽ được phân tách tự động
                    (tab hoặc nhiều khoảng trắng)
                  </p>
                </div>
              ),
            },
          ]}
          size="small"
          ghost
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
