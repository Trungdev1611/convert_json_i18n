import { Card, Table, Tag, Space, Statistic, Typography, Alert, Tooltip, Collapse } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ChangeRecord } from '../utils/types';

const { Paragraph, Text } = Typography;

interface LogTableProps {
  changes: ChangeRecord[];
}

const LogTable = ({ changes }: LogTableProps) => {
  // Lọc bỏ những key không thay đổi và sắp xếp: updated trước, added sau
  const filteredChanges = changes
    .filter(c => c.status !== 'unchanged')
    .sort((a, b) => {
      // Updated trước, Added sau
      if (a.status === 'updated' && b.status === 'added') return -1;
      if (a.status === 'added' && b.status === 'updated') return 1;
      return 0;
    });

  // Render cell với cảnh báo cho updated
  const renderCellWithUpdate = (record: ChangeRecord, field: 'en' | 'jp' | 'malay', newValue: string) => {
    if (record.status === 'updated') {
      const oldValue = record[`old${field.charAt(0).toUpperCase() + field.slice(1)}` as 'oldEn' | 'oldJp' | 'oldMalay'];
      const hasChanged = oldValue !== undefined && oldValue !== newValue;
      
      if (hasChanged) {
        return (
          <Tooltip
            title={
              <div style={{ color: '#000' }}>
                <div style={{ marginBottom: '12px' }}>
                  <Text strong style={{ color: '#ff4d4f', display: 'block', marginBottom: '4px' }}>Dữ liệu cũ:</Text>
                  <div style={{ 
                    marginTop: '4px', 
                    padding: '8px', 
                    background: '#fff1f0', 
                    borderRadius: '4px',
                    border: '1px solid #ffccc7',
                    color: '#000'
                  }}>
                    {oldValue ? <span style={{ color: '#000' }}>{oldValue}</span> : <span style={{ color: '#999' }}>(trống)</span>}
                  </div>
                </div>
                <div>
                  <Text strong style={{ color: '#52c41a', display: 'block', marginBottom: '4px' }}>Dữ liệu mới:</Text>
                  <div style={{ 
                    marginTop: '4px', 
                    padding: '8px', 
                    background: '#f6ffed', 
                    borderRadius: '4px',
                    border: '1px solid #b7eb8f',
                    color: '#000'
                  }}>
                    {newValue ? <span style={{ color: '#000' }}>{newValue}</span> : <span style={{ color: '#999' }}>(trống)</span>}
                  </div>
                </div>
              </div>
            }
            placement="topLeft"
            overlayStyle={{ maxWidth: '400px' }}
          >
            <div style={{ position: 'relative' }}>
              <span style={{ color: '#52c41a', fontWeight: 500 }}>{newValue || <span className="text-gray-400">-</span>}</span>
              <span style={{ 
                display: 'inline-block', 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#ff4d4f', 
                marginLeft: '6px',
                verticalAlign: 'middle'
              }} title="Đã thay đổi" />
            </div>
          </Tooltip>
        );
      }
    }
    return newValue || <span className="text-gray-400">-</span>;
  };

  const columns: ColumnsType<ChangeRecord> = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      width: 200,
      fixed: 'left',
      render: (text: string) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{text}</code>,
    },
    {
      title: 'English',
      dataIndex: 'en',
      key: 'en',
      ellipsis: true,
      render: (text: string, record: ChangeRecord) => renderCellWithUpdate(record, 'en', text),
    },
    {
      title: 'Japanese',
      dataIndex: 'jp',
      key: 'jp',
      ellipsis: true,
      render: (text: string, record: ChangeRecord) => renderCellWithUpdate(record, 'jp', text),
    },
    {
      title: 'Malay',
      dataIndex: 'malay',
      key: 'malay',
      ellipsis: true,
      render: (text: string, record: ChangeRecord) => renderCellWithUpdate(record, 'malay', text),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        if (status === 'added') {
          return <Tag color="green">➕ Added</Tag>;
        } else if (status === 'updated') {
          return <Tag color="orange">🔄 Updated</Tag>;
        }
        return null;
      },
    },
  ];

  const addedCount = filteredChanges.filter(c => c.status === 'added').length;
  const updatedCount = filteredChanges.filter(c => c.status === 'updated').length;

  // Hàm để set màu cho từng row
  const getRowClassName = (record: ChangeRecord) => {
    if (record.status === 'updated') {
      return 'updated-row'; // Màu cảnh báo cho updated
    } else if (record.status === 'added') {
      return 'added-row'; // Màu nhẹ nhàng cho added
    }
    return '';
  };

  return (
    <Card 
      title="📋 Bảng Thay Đổi" 
      className="mb-4"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
      }}
      extra={
        filteredChanges.length > 0 && (
          <span className="text-gray-500 text-sm">
            Tổng: {filteredChanges.length} bản ghi
          </span>
        )
      }
    >
      <Space direction="vertical" size="middle" className="w-full">
        <Collapse
          items={[
            {
              key: '1',
              label: 'ℹ️ Mô tả chức năng',
              children: (
                <Paragraph className="mb-0 text-sm">
                  <strong>Hiển thị thay đổi:</strong> Bảng này chỉ hiển thị các key mới được thêm (Added) và các key đã được cập nhật (Updated). 
                  Các key không thay đổi sẽ không được hiển thị.
                  <br />
                  <strong>Trạng thái:</strong>
                  <br />
                  • <strong>➕ Added:</strong> Key mới được thêm vào từ file Excel (màu xanh nhẹ)
                  <br />
                  • <strong>🔄 Updated:</strong> Key đã tồn tại nhưng giá trị đã được cập nhật (màu cam cảnh báo). Hover vào giá trị để xem dữ liệu cũ và mới.
                </Paragraph>
              ),
            },
          ]}
          size="small"
          ghost
        />

        {filteredChanges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có thay đổi nào. Hãy upload Excel file để bắt đầu.</p>
          </div>
        ) : (
          <>
            <Space size="large" className="mb-4">
              <Statistic
                title="Updated"
                value={updatedCount}
                valueStyle={{ color: '#fa8c16' }}
                prefix="🔄"
              />
              <Statistic
                title="Added"
                value={addedCount}
                valueStyle={{ color: '#52c41a' }}
                prefix="➕"
              />
            </Space>

            <Table
              columns={columns}
              dataSource={filteredChanges.map((change, index) => ({ ...change, id: index }))}
              rowKey={(record, index) => `${record.key}-${index}`}
              rowClassName={getRowClassName}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bản ghi`,
              }}
              scroll={{ x: 800 }}
              size="small"
            />
          </>
        )}
      </Space>
    </Card>
  );
};

export default LogTable;
