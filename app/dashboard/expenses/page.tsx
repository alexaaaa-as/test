'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Card, 
  Row,
  Col,
  Statistic,
  Typography,
  Upload,
  message,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  InboxOutlined,
  TeamOutlined,
  CalendarOutlined,
  CarOutlined,
  UserOutlined,
  UploadOutlined,
  DollarOutlined,
  FileTextOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import AppLayout from '../../../components/layout/AppLayout';
import PageHeader from '../../../components/common/PageHeader';
import { useStore } from '../../../lib/store';
import type { Expense, Representative } from '../../../types';
import { formatCurrency, formatDate, generateId } from '../../../utils/helpers';
import dayjs, { Dayjs } from 'dayjs';
import type { MenuProps } from 'antd';
import type { Key } from 'react';
import { ColumnType, FilterValue } from 'antd/es/table/interface';
import { List } from 'antd';
import { Avatar } from 'antd';
import { TableProps } from 'antd';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

// Definimos categorías de gastos
const expenseCategories = [
  { value: 'ALL', label: 'جميع الفئات' },
  { value: 'VEHICLE', label: 'مصروفات سيارة' },
  { value: 'PERSONAL', label: 'مصروفات شخصية' },
  { value: 'OTHER', label: 'أخرى' }
];

export default function ExpensesPage() {
  const { expenses, setExpenses, addExpense, updateExpense, deleteExpense, representatives } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRepresentative, setSelectedRepresentative] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [filterDates, setFilterDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [filterApplied, setFilterApplied] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For demo, we'll create some mock data if there are no expenses
    if (expenses.length === 0 && representatives.length > 0) {
      const mockExpenses: Expense[] = [
        {
          id: generateId(),
          representativeId: representatives[0].id,
          date: '2023-11-20',
          amount: 250,
          category: 'VEHICLE',
          description: 'وقود سيارة',
          approved: true,
        },
        {
          id: generateId(),
          representativeId: representatives[0].id,
          date: '2023-11-18',
          amount: 150,
          category: 'PERSONAL',
          description: 'غداء مع عميل',
          approved: true,
        },
        {
          id: generateId(),
          representativeId: representatives[1].id,
          date: '2023-11-19',
          amount: 350,
          category: 'VEHICLE',
          description: 'صيانة دورية للسيارة',
          approved: true,
        },
        {
          id: generateId(),
          representativeId: representatives[2].id,
          date: '2023-11-15',
          amount: 100,
          category: 'OTHER',
          description: 'مستلزمات مكتبية',
          approved: false,
        },
      ];

      setExpenses(mockExpenses);
    }
  }, [expenses.length, representatives, setExpenses]);

  const showModal = (expense?: Expense) => {
    setEditingExpense(expense || null);
    if (expense) {
      form.setFieldsValue({
        ...expense,
        date: dayjs(expense.date),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        date: dayjs(),
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingExpense(null);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingExpense) {
        // Update existing expense
        updateExpense({
          ...editingExpense,
          ...values,
          date: values.date.format('YYYY-MM-DD'),
        });
        message.success('تم تحديث المصروف بنجاح');
      } else {
        // Add new expense
        addExpense({
          ...values,
          id: generateId(),
          date: values.date.format('YYYY-MM-DD'),
          approved: false,
        });
        message.success('تم إضافة المصروف بنجاح');
      }
      setIsModalVisible(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذا المصروف؟',
      okText: 'نعم',
      okType: 'danger',
      cancelText: 'إلغاء',
      onOk: () => {
        deleteExpense(id);
        message.success('تم حذف المصروف بنجاح');
      },
    });
  };

  const handleApprove = (expense: Expense) => {
    updateExpense({
      ...expense,
      approved: !expense.approved,
    });
    message.success(`تم ${expense.approved ? 'إلغاء اعتماد' : 'اعتماد'} المصروف بنجاح`);
  };

  // Date range filter handler
  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      setFilterDates(dates);
      setDateRange([start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]);
      setFilterApplied(true);
    } else {
      setFilterDates(null);
      setDateRange(null);
      setFilterApplied(selectedCategory !== 'ALL' || selectedRepresentative !== 'ALL');
    }
  };

  // Category filter handler
  const handleCategoryFilter = (value: string) => {
    setSelectedCategory(value || 'ALL');
    setFilterApplied(!!value || !!dateRange || selectedRepresentative !== 'ALL');
  };

  // Representative filter handler
  const handleRepresentativeFilter = (value: string) => {
    setSelectedRepresentative(value || 'ALL');
    setFilterApplied(!!value || !!dateRange || selectedCategory !== 'ALL');
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedRepresentative('ALL');
    setDateRange(null);
    setFilterDates(null);
    setFilterApplied(false);
  };

  // Filter expenses based on category, representative, and date range
  const filteredExpenses = expenses.filter(expense => {
    let matchesCategory = true;
    let matchesRepresentative = true;
    let matchesDateRange = true;

    if (selectedCategory !== 'ALL') {
      matchesCategory = expense.category === selectedCategory;
    }

    if (selectedRepresentative !== 'ALL') {
      matchesRepresentative = expense.representativeId === selectedRepresentative;
    }

    if (dateRange && dateRange.length === 2) {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      matchesDateRange = expenseDate >= startDate && expenseDate <= endDate;
    }

    return matchesCategory && matchesRepresentative && matchesDateRange;
  });

  // Calculate statistics
  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  const vehicleExpenses = filteredExpenses
    .filter(expense => expense.category === 'VEHICLE')
    .reduce((total, expense) => total + expense.amount, 0);
  const personalExpenses = filteredExpenses
    .filter(expense => expense.category === 'PERSONAL')
    .reduce((total, expense) => total + expense.amount, 0);
  const otherExpenses = filteredExpenses
    .filter(expense => expense.category === 'OTHER')
    .reduce((total, expense) => total + expense.amount, 0);
  const pendingExpenses = filteredExpenses
    .filter(expense => !expense.approved)
    .reduce((total, expense) => total + expense.amount, 0);

  // Prepare representative expenses data for the second tab
  const representativeExpenses = representatives.map(rep => {
    const repExpenses = filteredExpenses.filter(expense => expense.representativeId === rep.id);
    const total = repExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      id: rep.id,
      name: rep.name,
      photoUrl: rep.photoUrl,
      total,
      count: repExpenses.length,
      expenses: repExpenses
    };
  }).sort((a, b) => b.total - a.total);

  const columns: ColumnType<Expense>[] = [
    {
      title: 'المندوب',
      key: 'representative',
      render: (_, record: Expense) => {
        const rep = representatives.find(r => r.id === record.representativeId);
        return rep?.name || 'غير محدد';
      },
      filters: representatives.map(rep => ({ text: rep.name, value: rep.id })),
     
    },
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
      sorter: (a: Expense, b: Expense) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'القيمة',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: Expense, b: Expense) => a.amount - b.amount,
    },
    {
      title: 'النوع',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        let color = '';
        let text = '';
        let icon = null;
        
        switch (category) {
          case 'VEHICLE':
            color = 'blue';
            text = 'سيارة';
            icon = <CarOutlined />;
            break;
          case 'PERSONAL':
            color = 'green';
            text = 'شخصي';
            icon = <UserOutlined />;
            break;
          case 'OTHER':
            color = 'orange';
            text = 'أخرى';
            icon = <InboxOutlined />;
            break;
          default:
            color = 'default';
            text = category;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
      filters: [
        { text: 'سيارة', value: 'VEHICLE' },
        { text: 'شخصي', value: 'PERSONAL' },
        { text: 'أخرى', value: 'OTHER' },
      ],
     
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'الحالة',
      key: 'status',
      render: (_: any, record: Expense) => (
        <Tag color={record.approved ? 'success' : 'warning'}>
          {record.approved ? 'معتمد' : 'قيد الاعتماد'}
        </Tag>
      ),
      filters: [
        { text: 'معتمد', value: true },
        { text: 'قيد الاعتماد', value: false },
      ],
      onFilter: (value: boolean | Key, record: Expense) => {
        if (typeof value === 'boolean') {
          return record.approved === value;
        }
        return false;
      },
    },
    {
      title: 'إجراءات',
      key: 'actions',
      render: (_: any, record: Expense) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)} 
          />
          <Button
            type="text"
            icon={record.approved ? <DeleteOutlined /> : <FileTextOutlined />}
            onClick={() => handleApprove(record)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  // Define tab items
  const tabItems = [
    {
      key: '1',
      label: 'جميع المصروفات',
      children: (
        <Table 
          columns={columns} 
          dataSource={filteredExpenses} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          summary={pageData => {
            let totalAmount = 0;
            pageData.forEach(({ amount }) => {
              totalAmount += amount;
            });

            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    <Typography.Text strong>إجمالي المصروفات:</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Typography.Text type="danger" strong>{totalAmount.toFixed(2)} ج.م</Typography.Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}></Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      )
    },
    {
      key: '2',
      label: 'مصروفات المندوبين',
      children: (
        <Row gutter={16}>
          {representativeExpenses.map(rep => (
            <Col span={8} key={rep.id}>
              <Card
                title={
                  <Space>
                    <Avatar src={rep.photoUrl} icon={<UserOutlined />} />
                    {rep.name}
                  </Space>
                }
                variant="outlined"
                extra={<Tag color="red">{rep.total.toFixed(2)} ج.م</Tag>}
                style={{ marginBottom: 16 }}
              >
                <List
                  size="small"
                  dataSource={rep.expenses}
                  renderItem={(item: Expense) => (
                    <List.Item>
                      <Typography.Text>{item.description}</Typography.Text>
                      <Typography.Text type="secondary">{formatDate(item.date)}</Typography.Text>
                      <Typography.Text type="danger">{item.amount.toFixed(2)} ج.م</Typography.Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )
    }
  ];

  return (
    <AppLayout>
      <PageHeader
        title="إدارة المصروفات"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              إضافة مصروف
            </Button>
          </Space>
        }
      />

      <Card
        style={{ marginBottom: 16 }}
        variant="outlined"
      >
        <Space size="large">
          <RangePicker 
            onChange={handleDateChange} 
            placeholder={['تاريخ البداية', 'تاريخ النهاية']}
          />
          <Select
            style={{ width: 200 }}
            placeholder="نوع المصروف"
            onChange={handleCategoryFilter}
            allowClear
          >
            {expenseCategories.map(category => (
              <Option key={category.value} value={category.value}>{category.label}</Option>
            ))}
          </Select>
          {filterApplied && (
            <Button icon={<CloseCircleOutlined />} onClick={clearAllFilters}>
              مسح التصفية
            </Button>
          )}
        </Space>
      </Card>

      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} items={tabItems} />

      <Modal
        title={editingExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        okText={editingExpense ? 'تحديث' : 'إضافة'}
        cancelText="إلغاء"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ date: dayjs() }}
        >
          <Form.Item
            name="representativeId"
            label="المندوب"
            rules={[{ required: true, message: 'يرجى اختيار المندوب' }]}
          >
            <Select placeholder="اختر المندوب">
              {representatives.map(rep => (
                <Option key={rep.id} value={rep.id}>{rep.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="التاريخ"
                rules={[{ required: true, message: 'يرجى تحديد التاريخ' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="القيمة"
                rules={[{ required: true, message: 'يرجى إدخال قيمة المصروف' }]}
              >
                <InputNumber
                  min={0}
                  step={1}
                  style={{ width: '100%' }}
                  formatter={value => `${value} ج.م`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="category"
            label="نوع المصروف"
            rules={[{ required: true, message: 'يرجى اختيار نوع المصروف' }]}
          >
            <Select placeholder="اختر نوع المصروف">
              <Option value="VEHICLE">
                <Space>
                  <CarOutlined />
                  مصروفات سيارة
                </Space>
              </Option>
              <Option value="PERSONAL">
                <Space>
                  <UserOutlined />
                  مصروفات شخصية
                </Space>
              </Option>
              <Option value="OTHER">
                <Space>
                  <InboxOutlined />
                  أخرى
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="الوصف"
            rules={[{ required: true, message: 'يرجى إدخال وصف المصروف' }]}
          >
            <TextArea rows={4} placeholder="وصف تفصيلي للمصروف" />
          </Form.Item>

          <Form.Item
            name="attachmentUrl"
            label="إرفاق مستند (إيصال / فاتورة)"
          >
            <Upload
              name="file"
              action="/api/upload" // This would be a real endpoint in a production app
              listType="picture"
              maxCount={1}
              accept=".jpg,.jpeg,.png,.pdf"
              beforeUpload={() => {
                // In a real app, you would implement actual file upload
                message.success('تم إرفاق المستند بنجاح');
                return false; // Prevent actual upload in this demo
              }}
            >
              <Button icon={<UploadOutlined />}>اختر ملفاً</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
} 