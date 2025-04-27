'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Tabs, Card, Statistic, List, Avatar, Typography, message, Row, Col, Descriptions, Empty } from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  CreditCardOutlined,
  UserOutlined,
  ShoppingOutlined,
  RiseOutlined,
  TeamOutlined,
  MailOutlined,
  HomeOutlined,
  DollarOutlined,
  FileTextOutlined,
  SearchOutlined
} from '@ant-design/icons';
import AppLayout from '../../../components/layout/AppLayout';
import PageHeader from '../../../components/common/PageHeader';
import CustomerCreditAnalysis from '../../../components/common/CustomerCreditAnalysis';
import { useStore } from '../../../lib/store';
import type { Customer, CustomerPurchaseHistory, Representative, Invoice } from '../../../types';
import { formatCurrency, formatDate, generateId } from '../../../utils/helpers';
import RouteMap from '../../../components/common/RouteMap';
import dynamic from 'next/dynamic';
import type { ColumnType } from 'antd/es/table';
import type { TableProps } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';

// Dynamically import chart components with SSR disabled
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });

const { Option } = Select;
const { Title, Text } = Typography;

interface CustomerDetailsProps {
  customer: Customer;
}

const CustomerInvoices: React.FC<CustomerDetailsProps> = ({ customer }) => {
  const { invoices } = useStore();
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const filtered = invoices.filter(invoice => invoice.customerId === customer.id);
    setCustomerInvoices(filtered);
  }, [customer.id, invoices]);

  const columns: ColumnType<Invoice>[] = [
    {
      title: 'رقم الفاتورة',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'القيمة',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => formatCurrency(total),
    },
    {
      title: 'حالة الدفع',
      dataIndex: 'paid',
      key: 'paid',
      render: (paid: boolean) => (
        <Tag color={paid ? 'success' : 'error'}>
          {paid ? 'مدفوعة' : 'غير مدفوعة'}
        </Tag>
      ),
    },
  ];

  const calculateBalance = () => {
    let total = 0;
    let paid = 0;

    customerInvoices.forEach(invoice => {
      total += invoice.total;
      if (invoice.paid) {
        paid += invoice.total;
      }
    });

    return total - paid;
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card variant="outlined">
            <Statistic
              title="إجمالي الفواتير"
              value={customerInvoices.reduce((sum, inv) => sum + inv.total, 0)}
              precision={2}
              suffix="ج.م"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="outlined">
            <Statistic
              title="الرصيد المستحق"
              value={calculateBalance()}
              precision={2}
              suffix="ج.م"
              valueStyle={{ color: calculateBalance() > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="outlined">
            <Statistic
              title="عدد الفواتير"
              value={customerInvoices.length}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={customerInvoices}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

const CustomerPurchases: React.FC<CustomerDetailsProps> = ({ customer }) => {
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [monthlyData, setMonthlyData] = useState<number[]>([]);

  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For demo, we'll generate some random data based on the customer ID
    const seed = parseInt(customer.id.substring(0, 8), 16);
    const random = (min: number, max: number) => Math.floor(seed % 100 / 100 * (max - min + 1)) + min;

    const total = random(5000, 50000);
    setTotalPurchases(total);

    // Generate monthly data
    const months = [];
    for (let i = 0; i < 6; i++) {
      months.push(random(total / 12 * 0.5, total / 12 * 1.5));
    }
    setMonthlyData(months);
  }, [customer.id]);

  const chartData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [
      {
        label: 'المشتريات الشهرية',
        data: monthlyData,
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'مشتريات العميل في آخر 6 أشهر',
      },
    },
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card variant="outlined">
            <Statistic
              title="إجمالي المشتريات"
              value={totalPurchases}
              precision={2}
              suffix="ج.م"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="outlined">
            <Statistic
              title="متوسط المشتريات الشهرية"
              value={totalPurchases / 6}
              precision={2}
              suffix="ج.م"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="outlined">
            <Statistic
              title="أعلى قيمة شهرية"
              value={Math.max(...monthlyData)}
              precision={2}
              suffix="ج.م"
            />
          </Card>
        </Col>
      </Row>

      <Card variant="outlined" style={{ marginBottom: 16 }}>
        <Line data={chartData} options={chartOptions} />
      </Card>

      <Card variant="outlined">
        <h3>توزيع المشتريات حسب الفئة</h3>
        <Row>
          <Col span={12}>
            <Pie
              data={{
                labels: ['منتجات غذائية', 'منتجات منزلية', 'إلكترونيات', 'ملابس'],
                datasets: [
                  {
                    data: [40, 20, 15, 25],
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.5)',
                      'rgba(54, 162, 235, 0.5)',
                      'rgba(255, 206, 86, 0.5)',
                      'rgba(75, 192, 192, 0.5)',
                    ],
                    borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </Col>
          <Col span={12}>
            <ul>
              <li>منتجات غذائية: 40%</li>
              <li>منتجات منزلية: 20%</li>
              <li>إلكترونيات: 15%</li>
              <li>ملابس: 25%</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer }) => {
  return (
    <Card variant="outlined" style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col span={4}>
          <Avatar
            size={100}
            icon={<UserOutlined />}
            src={customer.photoUrl}
          />
        </Col>
        <Col span={20}>
          <Descriptions title="معلومات العميل" layout="vertical" column={3}>
            <Descriptions.Item label="الاسم">{customer.name}</Descriptions.Item>
            <Descriptions.Item label="رقم الهاتف">{customer.phone}</Descriptions.Item>
            {customer.email && (
              <Descriptions.Item label="البريد الإلكتروني">{customer.email}</Descriptions.Item>
            )}
            <Descriptions.Item label="العنوان">{customer.address}</Descriptions.Item>
            <Descriptions.Item label="المدينة">{customer.city}</Descriptions.Item>
            <Descriptions.Item label="تاريخ التسجيل">{customer.registrationDate?.toString()}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default function CustomersPage() {
  const { customers, setCustomers, addCustomer, updateCustomer, deleteCustomer, representatives, invoices } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  // Mock data for customer details
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [customerPurchasesByMonth, setCustomerPurchasesByMonth] = useState<any[]>([]);

  // Register Chart.js on client side
  
  // Calculate customer's balance function
  const calculateBalance = (customerId: string): number => {
    const customerInvs = invoices.filter(inv => inv.customerId === customerId);
    const total = customerInvs.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paid = customerInvs.reduce((sum, inv) => sum + inv.paidAmount, 0);
    return total - paid;
  };

  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For demo, we'll create some mock data if there are no customers
    if (customers.length === 0) {
      const mockCustomers: Customer[] = [
        {
          id: generateId(),
          name: 'شركة الأمل للمنتجات الزراعية',
          phone: '0223456789',
          address: 'شارع النصر، القاهرة',
          businessType: 'بيع وشراء',
          creditLimit: 50000,
          representativeId: representatives[0]?.id,
          createdAt: '2022-01-10',
          updatedAt: '2023-11-15',
          notes: 'عميل ممتاز، دائم الشراء',
          location: { lat: 30.0565, lng: 31.2271, timestamp: new Date().toISOString() },
          photoUrl: undefined,
          city: undefined,
          registrationDate: function (registrationDate: any): import("react").ReactNode {
            throw new Error('Function not implemented.');
          },
          email: undefined
        },
        {
          id: generateId(),
          name: 'مزرعة الخير',
          phone: '0198765432',
          address: 'طريق الإسكندرية الصحراوي، كم 50',
          businessType: 'إنتاج زراعي',
          creditLimit: 25000,
          representativeId: representatives[1]?.id,
          createdAt: '2022-02-20',
          updatedAt: '2023-10-05',
          location: { lat: 31.1920, lng: 29.9046, timestamp: new Date().toISOString() },
          photoUrl: undefined,
          city: undefined,
          registrationDate: function (registrationDate: any): import("react").ReactNode {
            throw new Error('Function not implemented.');
          },
          email: undefined
        },
        {
          id: generateId(),
          name: 'محلات الفلاح',
          phone: '0233445566',
          address: 'شارع الهرم، الجيزة',
          businessType: 'بيع تجزئة',
          creditLimit: 10000,
          representativeId: representatives[2]?.id,
          createdAt: '2022-03-15',
          updatedAt: '2023-09-20',
          notes: 'تم رفع سقف الائتمان مؤخراً',
          location: { lat: 29.9866, lng: 31.2118, timestamp: new Date().toISOString() },
          photoUrl: undefined,
          city: undefined,
          registrationDate: function (registrationDate: any): import("react").ReactNode {
            throw new Error('Function not implemented.');
          },
          email: undefined
        },
        {
          id: generateId(),
          name: 'مخازن البركة',
          phone: '0233456789',
          address: 'المنطقة الصناعية، 6 أكتوبر',
          businessType: 'توريدات',
          creditLimit: 75000,
          representativeId: representatives[0]?.id,
          createdAt: '2022-04-05',
          updatedAt: '2023-11-10',
          location: { lat: 29.9626, lng: 30.9176, timestamp: new Date().toISOString() },
          photoUrl: undefined,
          city: undefined,
          registrationDate: function (registrationDate: any): import("react").ReactNode {
            throw new Error('Function not implemented.');
          },
          email: undefined
        },
        {
          id: generateId(),
          name: 'شركة النيل للإنتاج الزراعي',
          phone: '0224567890',
          address: 'شارع المعادي، القاهرة',
          businessType: 'بيع وشراء',
          creditLimit: 35000,
          representativeId: representatives[1]?.id,
          createdAt: '2022-05-12',
          updatedAt: '2023-10-20',
          location: { lat: 29.9559, lng: 31.2497, timestamp: new Date().toISOString() },
          photoUrl: undefined,
          city: undefined,
          registrationDate: function (registrationDate: any): import("react").ReactNode {
            throw new Error('Function not implemented.');
          },
          email: undefined
        },
      ];

      setCustomers(mockCustomers);
    }
  }, [customers.length, representatives, setCustomers]);

  // Set customer invoices and purchase data when selected customer changes
  useEffect(() => {
    if (selectedCustomer) {
      const mockInvs = generateMockInvoices(selectedCustomer.id);
      const invoices: Invoice[] = mockInvs.map(inv => ({
        ...inv,
        total: inv.totalAmount,
        paid: inv.paidAmount
      }));
      setCustomerInvoices(invoices);

      const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
      setTotalPurchases(total);
      // Generate mock monthly data
      setCustomerPurchasesByMonth([
        { month: 'يناير', count: 3, total: 12500 },
        { month: 'فبراير', count: 2, total: 8200 },
        { month: 'مارس', count: 4, total: 15300 },
        { month: 'أبريل', count: 1, total: 5000 },
        { month: 'مايو', count: 3, total: 9800 },
      ]);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (customers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customers[0]);
    }

    const filtered = searchText ?
      customers.filter(c =>
        c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.phone.includes(searchText) ||
        (c.email && c.email.toLowerCase().includes(searchText.toLowerCase()))
      ) :
      customers;

    setFilteredCustomers(filtered);
  }, [customers, searchText, selectedCustomer]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const showModal = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    if (customer) {
      form.setFieldsValue(customer);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingCustomer) {
        // Update existing customer
        updateCustomer({
          ...editingCustomer,
          ...values,
          updatedAt: new Date().toISOString().split('T')[0],
        });
        message.success('تم تحديث بيانات العميل بنجاح');
      } else {
        // Add new customer
        addCustomer({
          ...values,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          // Mock location for new customers
          location: {
            lat: 30.0444 + (Math.random() * 2 - 1),
            lng: 31.2357 + (Math.random() * 2 - 1),
            timestamp: new Date().toISOString(),
          },
        });
        message.success('تم إضافة العميل بنجاح');
      }
      setIsModalVisible(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذا العميل؟',
      okText: 'نعم',
      okType: 'danger',
      cancelText: 'إلغاء',
      onOk: () => {
        deleteCustomer(id);
        message.success('تم حذف العميل بنجاح');
      },
    });
  };

  const showCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsVisible(true);
  };

  const columns = [
    {
      title: 'العميل',
      key: 'name',
      render: (_: any, record: Customer) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.photoUrl} />
          <Text strong>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: 'رقم الهاتف',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'العنوان',
      key: 'address',
      render: (_: any, record: Customer) => (
        <span>{record.city} - {record.address}</span>
      ),
    },
    {
      title: 'إجراءات',
      key: 'actions',
      render: (_: any, record: Customer) => (
        <Button type="link" onClick={() => handleCustomerSelect(record)}>
          عرض التفاصيل
        </Button>
      ),
    },
  ];

  // Mock purchase history for customer details
  const getMockPurchaseHistory = (customerId: string): CustomerPurchaseHistory => {
    return {
      customerId,
      totalPurchases: Math.floor(Math.random() * 50000) + 10000,
      lastPurchaseDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0],
      frequencyScore: Math.floor(Math.random() * 10) + 1,
      preferredProducts: [
        { productId: '1', count: Math.floor(Math.random() * 30) + 5 },
        { productId: '2', count: Math.floor(Math.random() * 20) + 5 },
        { productId: '3', count: Math.floor(Math.random() * 15) + 5 },
      ],
    };
  };

  // Mock recent purchase items for customer details
  const mockRecentPurchases = [
    { id: generateId(), date: '2023-11-10', total: 2500, items: 5, status: 'COMPLETED' },
    { id: generateId(), date: '2023-10-25', total: 3800, items: 8, status: 'COMPLETED' },
    { id: generateId(), date: '2023-10-05', total: 1200, items: 3, status: 'COMPLETED' },
    { id: generateId(), date: '2023-09-20', total: 5000, items: 12, status: 'COMPLETED' },
    { id: generateId(), date: '2023-09-10', total: 1800, items: 4, status: 'COMPLETED' },
  ];

  // Generate mock invoices for credit analysis if none exist
  const generateMockInvoices = (customerId: string) => {
    // We'll use the mockRecentPurchases data to create proper invoice objects
    return mockRecentPurchases.map(purchase => ({
      id: purchase.id,
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
      customerId,
      representativeId: representatives[Math.floor(Math.random() * representatives.length)]?.id || '',
      date: purchase.date,
      items: [],
      status: purchase.status as 'COMPLETED',
      totalAmount: purchase.total,
      paidAmount: purchase.status === 'COMPLETED' ? purchase.total : 0,
    }));
  };

  // Define tab items for customer details modal
  const customerDetailsTabItems = [
    {
      key: '1',
      label: 'البيانات الأساسية',
      children: selectedCustomer && (
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <p>
                <UserOutlined /> <strong>الاسم:</strong> {selectedCustomer.name}
              </p>
              <p>
                <PhoneOutlined /> <strong>الهاتف:</strong> {selectedCustomer.phone}
              </p>
              {selectedCustomer.email && (
                <p>
                  <MailOutlined /> <strong>البريد الإلكتروني:</strong> {selectedCustomer.email}
                </p>
              )}
            </Col>
            <Col span={12}>
              <p>
                <HomeOutlined /> <strong>العنوان:</strong> {selectedCustomer.address}
              </p>
              <p>
                <CreditCardOutlined /> <strong>حد الائتمان:</strong> {selectedCustomer.creditLimit} ج.م
              </p>
              <p>
                <ShopOutlined /> <strong>نوع العميل:</strong> {selectedCustomer.businessType === 'بيع وشراء' ? 'تجزئة' : selectedCustomer.businessType === 'إنتاج زراعي' ? 'جملة' : selectedCustomer.businessType}
              </p>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: '2',
      label: 'تحليل الائتمان',
      children: selectedCustomer && (
        <Card>
          <Statistic title="الرصيد الحالي" value={calculateBalance(selectedCustomer.id)} prefix={<DollarOutlined />} suffix="ج.م" />
        </Card>
      )
    },
    {
      key: '3',
      label: 'تحليل المشتريات',
      children: selectedCustomer && (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="عدد الفواتير"
                  value={customerInvoices.length}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="إجمالي المشتريات"
                  value={totalPurchases}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="ج.م"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="متوسط الفاتورة"
                  value={customerInvoices.length > 0 ? totalPurchases / customerInvoices.length : 0}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="ج.م"
                />
              </Card>
            </Col>
          </Row>
          <div style={{ marginTop: 16 }}>
            <Table
              dataSource={customerPurchasesByMonth}
              columns={[
                {
                  title: 'الشهر',
                  dataIndex: 'month',
                  key: 'month',
                },
                {
                  title: 'عدد الفواتير',
                  dataIndex: 'count',
                  key: 'count',
                },
                {
                  title: 'إجمالي المشتريات',
                  dataIndex: 'total',
                  key: 'total',
                  render: (value) => `${value.toFixed(2)} ج.م`,
                },
              ]}
              pagination={false}
              size="small"
            />
          </div>
        </>
      )
    },
    {
      key: '4',
      label: 'الفواتير',
      children: selectedCustomer && (
        <Table
          dataSource={customerInvoices}
          columns={[
            {
              title: 'رقم الفاتورة',
              dataIndex: 'invoiceNumber',
              key: 'invoiceNumber',
            },
            {
              title: 'التاريخ',
              dataIndex: 'date',
              key: 'date',
              render: (date) => formatDate(date),
            },
            {
              title: 'المبلغ',
              dataIndex: 'totalAmount',
              key: 'total',
              render: (value) => `${value.toFixed(2)} ج.م`,
            },
            {
              title: 'الحالة',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Tag color={status === 'PAID' ? 'green' : status === 'PARTIAL' ? 'orange' : 'red'}>
                  {status === 'PAID' ? 'مدفوعة' : status === 'PARTIAL' ? 'مدفوعة جزئياً' : 'غير مدفوعة'}
                </Tag>
              ),
            },
          ]}
          pagination={{ pageSize: 5 }}
          size="small"
        />
      )
    },
    {
      key: '5',
      label: 'الموقع',
      children: selectedCustomer && selectedCustomer.location && (
        <div style={{ height: 400 }}>
          <RouteMap
            representatives={[]}
            customers={[selectedCustomer]}
            selectedRepresentative={undefined}
          />
        </div>
      )
    }
  ];

  return (
    <AppLayout>
      <PageHeader
        title="إدارة العملاء"
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => showModal()}
          >
            إضافة عميل
          </Button>
        }
      />

      <Row gutter={16}>
        <Col span={8}>
          <Card variant="outlined" style={{ marginBottom: 16 }}>
            <Input
              placeholder="بحث عن عميل..."
              prefix={<SearchOutlined />}
              onChange={e => handleSearch(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={columns}
              dataSource={filteredCustomers}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
              onRow={(record) => ({
                onClick: () => handleCustomerSelect(record),
                style: { cursor: 'pointer' }
              })}
            />
          </Card>
        </Col>

        <Col span={16}>
          {selectedCustomer ? (
            <>
              <CustomerDetails customer={selectedCustomer} />

              <Card variant="outlined">
                <Tabs defaultActiveKey="1">
                  <TabPane tab="الفواتير" key="1">
                    <CustomerInvoices customer={selectedCustomer} />
                  </TabPane>
                  <TabPane tab="المشتريات" key="2">
                    <CustomerPurchases customer={selectedCustomer} />
                  </TabPane>
                </Tabs>
              </Card>
            </>
          ) : (
            <Card>
              <Empty description="اختر عميلاً لعرض التفاصيل" />
            </Card>
          )}
        </Col>
      </Row>

      {/* Customer Form Modal */}
      <Modal
        title={editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        okText={editingCustomer ? 'تحديث' : 'إضافة'}
        cancelText="إلغاء"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="اسم العميل"
            rules={[{ required: true, message: 'يرجى إدخال اسم العميل' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="اسم العميل" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="phone"
              label="رقم الهاتف"
              rules={[{ required: true, message: 'يرجى إدخال رقم الهاتف' }]}
              style={{ flex: 1 }}
            >
              <Input prefix={<PhoneOutlined />} placeholder="رقم الهاتف" />
            </Form.Item>

            <Form.Item
              name="businessType"
              label="نوع النشاط"
              rules={[{ required: true, message: 'يرجى اختيار نوع النشاط' }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="اختر نوع النشاط" prefix={<ShopOutlined />}>
                <Option value="بيع وشراء">بيع وشراء</Option>
                <Option value="إنتاج زراعي">إنتاج زراعي</Option>
                <Option value="بيع تجزئة">بيع تجزئة</Option>
                <Option value="توريدات">توريدات</Option>
                <Option value="أخرى">أخرى</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="العنوان"
            rules={[{ required: true, message: 'يرجى إدخال العنوان' }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="العنوان" />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="creditLimit"
              label="سقف الائتمان"
              rules={[{ required: true, message: 'يرجى إدخال سقف الائتمان' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                step={1000}
                style={{ width: '100%' }}
                prefix={<CreditCardOutlined />}
                formatter={value => `${value} ج.م`}
              />
            </Form.Item>

            <Form.Item
              name="representativeId"
              label="المندوب المسؤول"
              style={{ flex: 1 }}
            >
              <Select placeholder="اختر المندوب">
                {representatives.map(rep => (
                  <Option key={rep.id} value={rep.id}>{rep.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label="ملاحظات"
          >
            <Input.TextArea rows={4} placeholder="أي ملاحظات إضافية عن العميل" />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
} 