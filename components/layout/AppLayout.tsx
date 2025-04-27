import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, theme, ConfigProvider } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../../lib/store';
import Image from 'next/image';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const { sidebarCollapsed, toggleSidebar, currentUser, logout } = useStore();
  const { token } = theme.useToken();

  useEffect(() => {
    const path = pathname.split('/')[1] || 'dashboard';
    setSelectedKeys([path]);
  }, [pathname]);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">الرئيسية</Link>,
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: <Link href="/dashboard/products">المنتجات</Link>,
    },
    {
      key: 'representatives',
      icon: <TeamOutlined />,
      label: <Link href="/dashboard/representatives">المندوبين</Link>,
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: <Link href="/dashboard/customers">العملاء</Link>,
    },
    {
      key: 'invoices',
      icon: <FileTextOutlined />,
      label: <Link href="/dashboard/invoices">الفواتير</Link>,
    },
    {
      key: 'expenses',
      icon: <MoneyCollectOutlined />,
      label: <Link href="/dashboard/expenses">المصروفات</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link href="/dashboard/settings">الإعدادات</Link>,
    },
  ];

  const userMenuItems = {
    items: [
      {
        key: '1',
        label: 'الملف الشخصي',
        icon: <UserOutlined />,
      },
      {
        key: '2',
        label: 'الإعدادات',
        icon: <SettingOutlined />,
      },
      {
        type: 'divider' as const,
      },
      {
        key: '3',
        label: 'تسجيل الخروج',
        icon: <LogoutOutlined />,
        onClick: logout,
      },
    ],
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            bodyBg: '#f0f2f5',
            headerBg: '#fff',
            triggerBg: '#fff',
          }
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', direction: 'rtl', backgroundColor: '#f0f2f5' }}>
        <Sider
          collapsible
          collapsed={sidebarCollapsed}
          onCollapse={toggleSidebar}
          trigger={null}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 10,
          }}
          theme="light"
        >
          <div style={{ height: 64, padding: 16, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!sidebarCollapsed && (
                <div style={{ color: token.colorPrimary, fontSize: 18, fontWeight: 'bold' }}>
                  أليكس للمستلزمات الزراعية
                </div>
              )}
              {sidebarCollapsed && (
                <div style={{ color: token.colorPrimary, fontSize: 20, fontWeight: 'bold' }}>
                  أليكس
                </div>
              )}
            </div>
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            style={{ borderLeft: 0 }}
          />
        </Sider>
        <Layout style={{ marginRight: sidebarCollapsed ? 80 : 200, transition: 'all 0.2s' }}>
          <Header
            style={{
              padding: '0 16px',
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,21,41,.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Badge count={5} dot>
                <BellOutlined style={{ fontSize: 18 }} />
              </Badge>
              <Dropdown menu={userMenuItems} placement="bottomLeft">
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <Avatar style={{ backgroundColor: token.colorPrimary }}>
                    {currentUser?.name?.charAt(0) || 'U'}
                  </Avatar>
                  {!sidebarCollapsed && (
                    <span style={{ marginRight: 8 }}>{currentUser?.name || 'مستخدم'}</span>
                  )}
                </div>
              </Dropdown>
            </div>
          </Header>
          <Content
            style={{
              margin: '24px 16px',
              padding: 2,
              background: '#fff',
              minHeight: 280,
              borderRadius: 4,
            }}
          >
            {children}
          </Content>
          <div
            style={{
              textAlign: 'center',
              padding: '10px 0',
              backgroundColor: '#f0f2f5',
              fontSize: 14,
            }}
          >
            أليكس للمستلزمات الزراعية © {new Date().getFullYear()} جميع الحقوق محفوظة
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AppLayout; 