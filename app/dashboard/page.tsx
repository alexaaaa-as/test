'use client';

import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, List, Table, Alert, Typography } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  TeamOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import PageHeader from '../../components/common/PageHeader';
import { useStore } from '../../lib/store';
import { formatCurrency, isExpiringSoon } from '../../utils/helpers';

const { Title, Text } = Typography;

export default function Dashboard() {
  const { dashboardStats, products, updateDashboardStats } = useStore();
  
  useEffect(() => {
    updateDashboardStats();
  }, [updateDashboardStats]);
  
  if (!dashboardStats) {
    return (
      <AppLayout>
        <div>جاري تحميل البيانات...</div>
      </AppLayout>
    );
  }
  
  // Filter expiring products
  const expiringProducts = products.filter(product => 
    isExpiringSoon(product.expiryDate)
  ).slice(0, 5);
  
  // Top selling products columns
  const topProductsColumns = [
    {
      title: 'المنتج',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'الكمية المباعة',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
    {
      title: 'نسبة المبيعات',
      key: 'percentage',
      render: (_: any, record: { quantity: number; }) => (
        <Progress
          percent={Math.round((record.quantity / dashboardStats.topSellingProducts[0].quantity) * 100)}
          size="small"
          status="active"
        />
      ),
    },
  ];
  
  // Top representatives columns
  const topRepColumns = [
    {
      title: 'المندوب',
      dataIndex: 'representativeName',
      key: 'representativeName',
    },
    {
      title: 'المبيعات',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => formatCurrency(sales),
      align: 'center' as const,
    },
    {
      title: 'النسبة',
      key: 'percentage',
      render: (_: any, record: { sales: number; }) => (
        <Progress
          percent={Math.round((record.sales / dashboardStats.topRepresentatives[0].sales) * 100)}
          size="small"
          status="active"
        />
      ),
    },
  ];
  
  return (
    <AppLayout>
      <PageHeader 
        title="لوحة التحكم"
        extra={
          <Text type="secondary">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</Text>
        }
      />
      
      {/* Key Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="إجمالي المبيعات"
              value={dashboardStats.totalSales}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="ج.م"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="success">
                <RiseOutlined /> 12% منذ الشهر الماضي
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="قيمة المخزون"
              value={dashboardStats.inventoryValue}
              valueStyle={{ color: '#1677ff' }}
              prefix={<ShoppingOutlined />}
              suffix="ج.م"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {products.length} منتج في المخزون
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="المصروفات"
              value={dashboardStats.totalExpenses}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
              suffix="ج.م"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="danger">
                <RiseOutlined /> 5% منذ الشهر الماضي
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="العملاء النشطين"
              value={dashboardStats.activeCustomers}
              valueStyle={{ color: '#1677ff' }}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="success">
                <RiseOutlined /> 8% منذ الشهر الماضي
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Alerts Section */}
      {(dashboardStats.lowStockProducts > 0 || dashboardStats.expiringProducts > 0) && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Alert
              message="تنبيهات المخزون"
              description={
                <div>
                  {dashboardStats.lowStockProducts > 0 && (
                    <div>يوجد {dashboardStats.lowStockProducts} منتجات ذات مخزون منخفض</div>
                  )}
                  {dashboardStats.expiringProducts > 0 && (
                    <div>يوجد {dashboardStats.expiringProducts} منتجات ستنتهي صلاحيتها قريباً</div>
                  )}
                </div>
              }
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>
      )}
      
      {/* Charts and Tables */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="المبيعات الشهرية" variant="outlined">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardStats.monthlySalesChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#44803F" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="أعلى المنتجات مبيعاً" variant="outlined">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardStats.topSellingProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#44803F" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="أعلى المنتجات مبيعاً" variant="outlined">
            <Table
              dataSource={dashboardStats.topSellingProducts}
              columns={topProductsColumns}
              pagination={false}
              rowKey="productId"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="أفضل المندوبين" variant="outlined">
            <Table
              dataSource={dashboardStats.topRepresentatives}
              columns={topRepColumns}
              pagination={false}
              rowKey="representativeId"
            />
          </Card>
        </Col>
      </Row>
      
      {/* Expiring Products List */}
      {expiringProducts.length > 0 && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              title="منتجات تقترب من انتهاء الصلاحية"
              variant="outlined"
              extra={<a href="/dashboard/products">عرض الكل</a>}
            >
              <List
                dataSource={expiringProducts}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={`رقم اللوط: ${item.lotNumber} | تاريخ الانتهاء: ${item.expiryDate}`}
                    />
                    <div>
                      <WarningOutlined style={{ color: 'orange', marginLeft: 8 }} />
                      تبقى {Math.round((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}
    </AppLayout>
  );
} 