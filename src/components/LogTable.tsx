import { Card, Table, Tag, Space, Statistic, Typography, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ChangeRecord } from '../utils/types';

const { Paragraph } = Typography;

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
      render: (text: string) => text || <span className="text-gray-400">-</span>,
    },
    {
      title: 'Japanese',
      dataIndex: 'jp',
      key: 'jp',
      ellipsis: true,
      render: (text: string) => text || <span className="text-gray-400">-</span>,
    },
    {
      title: 'Malay',
      dataIndex: 'malay',
      key: 'malay',
      ellipsis: true,
      render: (text: string) => text || <span className="text-gray-400">-</span>,
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
        <Alert
          message="Mô tả chức năng"
          description={
            <Paragraph className="mb-0 text-sm">
              <strong>Hiển thị thay đổi:</strong> Bảng này chỉ hiển thị các key mới được thêm (Added) và các key đã được cập nhật (Updated). 
              Các key không thay đổi sẽ không được hiển thị.
              <br />
              <strong>Trạng thái:</strong>
              <br />
              • <strong>➕ Added:</strong> Key mới được thêm vào từ file Excel (màu xanh nhẹ)
              <br />
              • <strong>🔄 Updated:</strong> Key đã tồn tại nhưng giá trị đã được cập nhật (màu cam cảnh báo)
            </Paragraph>
          }
          type="info"
          showIcon
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
