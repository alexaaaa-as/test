'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  InputNumber, 
  Drawer, 
  Descriptions, 
  Divider, 
  Row, 
  Col, 
  Input,
  Typography,
  Card,
  message
} from 'antd';
import { 
  PlusOutlined, 
  FileTextOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PrinterOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import AppLayout from '../../../components/layout/AppLayout';
import PageHeader from '../../../components/common/PageHeader';
import { useStore } from '../../../lib/store';
import type { Invoice, InvoiceItem, Customer, Product, Representative } from '../../../types';
import { formatCurrency, formatDate, generateId, calculateInvoiceTotal } from '../../../utils/helpers';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function InvoicesPage() {
  const { 
    invoices, 
    setInvoices, 
    addInvoice, 
    updateInvoice, 
    deleteInvoice, 
    customers, 
    representatives, 
    products 
  } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [form] = Form.useForm();
  const [invoiceForm] = Form.useForm();

  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For demo, we'll create some mock data if there are no invoices
    if (invoices.length === 0 && customers.length > 0 && representatives.length > 0) {
      const mockInvoices: Invoice[] = [
        {
          id: generateId(),
          invoiceNumber: 'INV-001',
          customerId: customers[0].id,
          representativeId: representatives[0].id,
          date: '2023-11-20',
          items: [
            {
              id: generateId(),
              productId: products[0].id,
              quantity: 5,
              unitPrice: products[0].sellingPrice,
              total: 5 * products[0].sellingPrice,
            },
            {
              id: generateId(),
              productId: products[1].id,
              quantity: 3,
              unitPrice: products[1].sellingPrice,
              total: 3 * products[1].sellingPrice,
            },
          ],
          status: 'COMPLETED',
          totalAmount: 5 * products[0].sellingPrice + 3 * products[1].sellingPrice,
          paidAmount: 5 * products[0].sellingPrice + 3 * products[1].sellingPrice,
          notes: 'توريد منتجات زراعية',
          total: 5 * products[0].sellingPrice + 3 * products[1].sellingPrice,
          paid: true
        },
        {
          id: generateId(),
          invoiceNumber: 'INV-002',
          customerId: customers[1].id,
          representativeId: representatives[1].id,
          date: '2023-11-15',
          items: [
            {
              id: generateId(),
              productId: products[2].id,
              quantity: 10,
              unitPrice: products[2].sellingPrice,
              total: 10 * products[2].sellingPrice,
            },
          ],
          status: 'COMPLETED',
          totalAmount: 10 * products[2].sellingPrice,
          paidAmount: 10 * products[2].sellingPrice,
          total: 10 * products[2].sellingPrice,
          paid: true,
          notes: 'توريد منتجات زراعية',
        },
      ];

      // Calculate totals
      mockInvoices.forEach(invoice => {
        invoice.totalAmount = invoice.items.reduce((sum, item) => sum + item.total, 0);
        invoice.paidAmount = invoice.totalAmount; // For simplicity, all are fully paid
      });

      setInvoices(mockInvoices);
    }
  }, [invoices.length, customers, representatives, products, setInvoices]);

  const showModal = () => {
    form.resetFields();
    setInvoiceItems([]);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDrawerVisible(true);
  };

  const handleInvoiceItemAdd = () => {
    const newItem: InvoiceItem = {
      id: generateId(),
      productId: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const handleInvoiceItemRemove = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const handleInvoiceItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If product or quantity changed, update unitPrice and total
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.unitPrice = product.sellingPrice;
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
        } else if (field === 'quantity') {
          updatedItem.total = value * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setInvoiceItems(updatedItems);
  };

  const handleInvoiceSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (invoiceItems.length === 0) {
        message.error('يجب إضافة منتج واحد على الأقل للفاتورة');
        return;
      }
      
      const newInvoice: Invoice = {
        id: generateId(),
        invoiceNumber: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        customerId: values.customerId,
        representativeId: values.representativeId,
        date: values.date.format('YYYY-MM-DD'),
        items: invoiceItems,
        status: 'COMPLETED',
        totalAmount: invoiceItems.reduce((sum, item) => sum + item.total, 0),
        paidAmount: values.paidAmount || invoiceItems.reduce((sum, item) => sum + item.total, 0),
        notes: values.notes,
        total: invoiceItems.reduce((sum, item) => sum + item.total, 0),
        paid: values.paidAmount === invoiceItems.reduce((sum, item) => sum + item.total, 0)
      };
      
      addInvoice(newInvoice);
      message.success('تم إنشاء الفاتورة بنجاح');
      setIsModalVisible(false);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذه الفاتورة؟',
      okText: 'نعم',
      okType: 'danger',
      cancelText: 'إلغاء',
      onOk: () => {
        deleteInvoice(id);
        message.success('تم حذف الفاتورة بنجاح');
      },
    });
  };

  const handlePrint = (invoice: Invoice) => {
    // Open print window with invoice details
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      const customer = customers.find(c => c.id === invoice.customerId);
      const representative = representatives.find(r => r.id === invoice.representativeId);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>فاتورة ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: 'Arial', sans-serif; direction: rtl; }
              .invoice-header { text-align: center; margin-bottom: 20px; }
              .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
              .invoice-table th { background-color: #f2f2f2; }
              .invoice-footer { text-align: left; margin-top: 40px; }
              .total-row { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="invoice-header">
              <h1>شركة أليكس للمستلزمات الزراعية</h1>
              <h2>فاتورة ${invoice.invoiceNumber}</h2>
            </div>
            
            <div class="invoice-details">
              <div>
                <p><strong>العميل:</strong> ${customer?.name || 'غير محدد'}</p>
                <p><strong>العنوان:</strong> ${customer?.address || 'غير محدد'}</p>
                <p><strong>الهاتف:</strong> ${customer?.phone || 'غير محدد'}</p>
              </div>
              <div>
                <p><strong>التاريخ:</strong> ${formatDate(invoice.date)}</p>
                <p><strong>المندوب:</strong> ${representative?.name || 'غير محدد'}</p>
                <p><strong>رقم الفاتورة:</strong> ${invoice.invoiceNumber}</p>
              </div>
            </div>
            
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${product?.name || 'غير محدد'}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.unitPrice)}</td>
                      <td>${formatCurrency(item.total)}</td>
                    </tr>
                  `;
                }).join('')}
                <tr class="total-row">
                  <td colspan="4">الإجمالي</td>
                  <td>${formatCurrency(invoice.totalAmount)}</td>
                </tr>
                <tr>
                  <td colspan="4">المدفوع</td>
                  <td>${formatCurrency(invoice.paidAmount)}</td>
                </tr>
                <tr>
                  <td colspan="4">المتبقي</td>
                  <td>${formatCurrency(invoice.totalAmount - invoice.paidAmount)}</td>
                </tr>
              </tbody>
            </table>
            
            ${invoice.notes ? `<p><strong>ملاحظات:</strong> ${invoice.notes}</p>` : ''}
            
            <div class="invoice-footer">
              <p>شكراً لتعاملكم معنا</p>
              <p>شركة أليكس للمستلزمات الزراعية</p>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const columns = [
    {
      title: 'رقم الفاتورة',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string, record: Invoice) => (
        <a onClick={() => showInvoiceDetails(record)}>{text}</a>
      ),
    },
    {
      title: 'العميل',
      key: 'customer',
      render: (_: any, record: Invoice) => {
        const customer = customers.find(c => c.id === record.customerId);
        return customer?.name || 'غير محدد';
      },
    },
    {
      title: 'المندوب',
      key: 'representative',
      render: (_: any, record: Invoice) => {
        const representative = representatives.find(r => r.id === record.representativeId);
        return representative?.name || 'غير محدد';
      },
    },
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
      sorter: (a: Invoice, b: Invoice) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'الإجمالي',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: Invoice, b: Invoice) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'الحالة',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        let color = '';
        let text = '';
        switch (status) {
          case 'DRAFT':
            color = 'default';
            text = 'مسودة';
            break;
          case 'PENDING':
            color = 'processing';
            text = 'قيد التنفيذ';
            break;
          case 'COMPLETED':
            color = 'success';
            text = 'مكتملة';
            break;
          case 'CANCELLED':
            color = 'error';
            text = 'ملغية';
            break;
          default:
            color = 'default';
            text = status;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'إجراءات',
      key: 'actions',
      render: (_: any, record: Invoice) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<PrinterOutlined />} 
            onClick={() => handlePrint(record)} 
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

  return (
    <AppLayout>
      <PageHeader
        title="إدارة الفواتير"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            إنشاء فاتورة
          </Button>
        }
      />

      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />

      {/* Create Invoice Modal */}
      <Modal
        title="إنشاء فاتورة جديدة"
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleInvoiceSave}
        okText="حفظ الفاتورة"
        cancelText="إلغاء"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ date: dayjs() }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="العميل"
                rules={[{ required: true, message: 'يرجى اختيار العميل' }]}
              >
                <Select 
                  placeholder="اختر العميل" 
                  suffixIcon={<UserOutlined />}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).includes(input)
                  }
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>{customer.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="representativeId"
                label="المندوب"
                rules={[{ required: true, message: 'يرجى اختيار المندوب' }]}
              >
                <Select 
                  placeholder="اختر المندوب" 
                  suffixIcon={<TeamOutlined />}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).includes(input)
                  }
                >
                  {representatives.map(rep => (
                    <Option key={rep.id} value={rep.id}>{rep.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="تاريخ الفاتورة"
                rules={[{ required: true, message: 'يرجى تحديد تاريخ الفاتورة' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paidAmount"
                label="المبلغ المدفوع"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value} ج.م`}
                  placeholder="اترك فارغاً للدفع الكامل"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="right">المنتجات</Divider>
          
          {invoiceItems.map((item, index) => (
            <Card 
              key={item.id} 
              style={{ marginBottom: 16 }}
              title={`المنتج ${index + 1}`}
              extra={
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleInvoiceItemRemove(item.id)}
                />
              }
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="المنتج"
                    required
                  >
                    <Select 
                      placeholder="اختر المنتج" 
                      value={item.productId || undefined}
                      onChange={(value) => handleInvoiceItemChange(item.id, 'productId', value)}
                      suffixIcon={<ShoppingOutlined />}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children as unknown as string).includes(input)
                      }
                    >
                      {products.map(product => (
                        <Option key={product.id} value={product.id}>{product.name} - {formatCurrency(product.sellingPrice)}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="الكمية"
                    required
                  >
                    <InputNumber
                      min={1}
                      value={item.quantity}
                      onChange={(value) => handleInvoiceItemChange(item.id, 'quantity', value)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="الإجمالي">
                    <Input
                      readOnly
                      value={formatCurrency(item.total)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
          
          <Button 
            type="dashed" 
            onClick={handleInvoiceItemAdd} 
            style={{ width: '100%', marginBottom: 16 }}
            icon={<PlusOutlined />}
          >
            إضافة منتج
          </Button>
          
          <div style={{ textAlign: 'left', marginBottom: 16 }}>
            <Title level={5}>
              إجمالي الفاتورة: {formatCurrency(invoiceItems.reduce((sum, item) => sum + item.total, 0))}
            </Title>
          </div>
          
          <Form.Item
            name="notes"
            label="ملاحظات"
          >
            <TextArea rows={4} placeholder="أي ملاحظات إضافية على الفاتورة" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Invoice Details Drawer */}
      <Drawer
        title={`تفاصيل الفاتورة ${selectedInvoice?.invoiceNumber}`}
        placement="left"
        closable={true}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={700}
        extra={
          <Space>
            <Button onClick={() => selectedInvoice && handlePrint(selectedInvoice)} icon={<PrinterOutlined />}>
              طباعة
            </Button>
          </Space>
        }
      >
        {selectedInvoice && (
          <>
            <Descriptions title="بيانات الفاتورة" bordered column={2}>
              <Descriptions.Item label="رقم الفاتورة">{selectedInvoice.invoiceNumber}</Descriptions.Item>
              <Descriptions.Item label="التاريخ">{formatDate(selectedInvoice.date)}</Descriptions.Item>
              
              <Descriptions.Item label="العميل">
                {customers.find(c => c.id === selectedInvoice.customerId)?.name || 'غير محدد'}
              </Descriptions.Item>
              <Descriptions.Item label="المندوب">
                {representatives.find(r => r.id === selectedInvoice.representativeId)?.name || 'غير محدد'}
              </Descriptions.Item>
              
              <Descriptions.Item label="إجمالي الفاتورة" span={2}>
                {formatCurrency(selectedInvoice.totalAmount)}
              </Descriptions.Item>
              
              <Descriptions.Item label="المدفوع" span={1}>
                {formatCurrency(selectedInvoice.paidAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="المتبقي" span={1}>
                {formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}
              </Descriptions.Item>
              
              <Descriptions.Item label="الحالة" span={2}>
                <Tag color={selectedInvoice.status === 'COMPLETED' ? 'green' : 'blue'}>
                  {selectedInvoice.status === 'COMPLETED' ? 'مكتملة' : 'قيد التنفيذ'}
                </Tag>
              </Descriptions.Item>
              
              {selectedInvoice.notes && (
                <Descriptions.Item label="ملاحظات" span={2}>
                  {selectedInvoice.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            <Divider orientation="right">تفاصيل المنتجات</Divider>
            
            <Table
              dataSource={selectedInvoice.items}
              rowKey="id"
              pagination={false}
              bordered
              columns={[
                {
                  title: '#',
                  key: 'index',
                  render: (_, __, index) => index + 1,
                  width: 50,
                },
                {
                  title: 'المنتج',
                  key: 'product',
                  render: (_, record) => {
                    const product = products.find(p => p.id === record.productId);
                    return product?.name || 'غير محدد';
                  },
                },
                {
                  title: 'الكمية',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'سعر الوحدة',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  render: (price: number) => formatCurrency(price),
                },
                {
                  title: 'الإجمالي',
                  dataIndex: 'total',
                  key: 'total',
                  render: (total: number) => formatCurrency(total),
                },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4} align="right">
                    <strong>المجموع الكلي:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{formatCurrency(selectedInvoice.totalAmount)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </>
        )}
      </Drawer>
    </AppLayout>
  );
} 