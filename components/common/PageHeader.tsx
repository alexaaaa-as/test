import React from 'react';
import { Button, Space, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  extra?: React.ReactNode;
  backButton?: boolean;
  backUrl?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  extra, 
  backButton = false, 
  backUrl = '/dashboard'
}) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24,
        background: '#f8f8f8',
        padding: '16px 24px',
        borderRadius: 6
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {backButton && (
          <Link href={backUrl} style={{ marginLeft: 12 }}>
            <Button 
              icon={<ArrowRightOutlined />} 
              type="text"
            />
          </Link>
        )}
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
      </div>
      {extra && (
        <Space>
          {extra}
        </Space>
      )}
    </div>
  );
};

export default PageHeader; 