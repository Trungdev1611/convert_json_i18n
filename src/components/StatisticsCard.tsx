import { Card, Statistic, Row, Col } from 'antd';
import { useEffect, useState } from 'react';
import { getTranslations } from '../utils/storage';

const StatisticsCard = () => {
  const [translations, setTranslations] = useState(getTranslations());

  // Update when localStorage changes (check every 500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const newTranslations = getTranslations();
      setTranslations(newTranslations);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!translations) {
    return null;
  }

  const enKeys = Object.keys(translations.en || {});
  const jpKeys = Object.keys(translations.jp || {});
  const malayKeys = Object.keys(translations.malay || {});

  // Tổng số keys unique (lấy từ English làm base)
  const totalUniqueKeys = enKeys.length;

  // Đếm keys có đầy đủ 3 ngôn ngữ
  const completeKeys = enKeys.filter(
    (key) => translations.jp[key] && translations.malay[key]
  ).length;

  // Đếm keys thiếu translation
  const incompleteKeys = totalUniqueKeys - completeKeys;

  return (
    <Card
      title="📊 Thống Kê Dữ Liệu"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      <Row gutter={16}>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Tổng số Keys"
            value={totalUniqueKeys}
            valueStyle={{ color: '#1890ff' }}
            prefix="🔑"
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Keys đầy đủ"
            value={completeKeys}
            valueStyle={{ color: '#52c41a' }}
            prefix="✅"
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Keys thiếu"
            value={incompleteKeys}
            valueStyle={{ color: '#fa8c16' }}
            prefix="⚠️"
          />
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title="Tỷ lệ hoàn thành"
            value={totalUniqueKeys > 0 ? Math.round((completeKeys / totalUniqueKeys) * 100) : 0}
            suffix="%"
            valueStyle={{ color: completeKeys === totalUniqueKeys ? '#52c41a' : '#fa8c16' }}
            prefix="📈"
          />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col xs={8} sm={8} md={4}>
          <Statistic title="English" value={enKeys.length} valueStyle={{ fontSize: '16px' }} />
        </Col>
        <Col xs={8} sm={8} md={4}>
          <Statistic title="Japanese" value={jpKeys.length} valueStyle={{ fontSize: '16px' }} />
        </Col>
        <Col xs={8} sm={8} md={4}>
          <Statistic title="Malay" value={malayKeys.length} valueStyle={{ fontSize: '16px' }} />
        </Col>
      </Row>
    </Card>
  );
};

export default StatisticsCard;
