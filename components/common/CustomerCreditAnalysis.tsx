'use client';

import React from 'react';
import { Card, Progress, Statistic, Row, Col, Typography, Table, Tag, Space, Alert, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Customer, Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';

const { Text, Title } = Typography;

interface CustomerCreditAnalysisProps {
  customer: Customer;
  invoices: Invoice[];
}

const CustomerCreditAnalysis: React.FC<CustomerCreditAnalysisProps> = ({ customer, invoices }) => {
  // Filter invoices for this customer
  const customerInvoices = invoices.filter(invoice => invoice.customerId === customer.id);
  
  // Calculate total due amount
  const totalDueAmount = customerInvoices
    .filter(invoice => invoice.status !== 'CANCELLED')
    .reduce((total, invoice) => total + (invoice.totalAmount - invoice.paidAmount), 0);
  
  // Calculate credit usage percentage
  const creditUsagePercentage = Math.min(
    Math.round((totalDueAmount / customer.creditLimit) * 100),
    100
  );
  
  // Determine credit status
  const getCreditStatus = () => {
    if (creditUsagePercentage >= 90) {
      return { status: 'exception', text: 'تم تجاوز الحد', color: 'red' };
    } else if (creditUsagePercentage >= 75) {
      return { status: 'warning', text: 'اقتراب من الحد', color: 'orange' };
    } else if (creditUsagePercentage >= 50) {
      return { status: 'normal', text: 'استخدام متوسط', color: 'blue' };
    } else {
      return { status: 'success', text: 'استخدام منخفض', color: 'green' };
    }
  };
  
  const creditStatus = getCreditStatus();
  
  // Calculate payment history metrics
  const latePayments = customerInvoices.filter(
    invoice => 
      invoice.status === 'COMPLETED' && 
      new Date(invoice.date).getTime() + 30 * 24 * 60 * 60 * 1000 < new Date().getTime()
  ).length;
  
  const onTimePayments = customerInvoices.filter(
    invoice => 
      invoice.status === 'COMPLETED' && 
      new Date(invoice.date).getTime() + 30 * 24 * 60 * 60 * 1000 >= new Date().getTime()
  ).length;
  
  // Columns for recent invoices
  const columns = [
    {
      title: 'رقم الفاتورة',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
    },
    {
      title: 'التاريخ',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'المبلغ الإجمالي',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'المبلغ المدفوع',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'المبلغ المتبقي',
      key: 'remainingAmount',
      render: (_: any, record: Invoice) => formatCurrency(record.totalAmount - record.paidAmount),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        let text = 'قيد الانتظار';
        
        if (status === 'COMPLETED') {
          color = 'green';
          text = 'مكتملة';
        } else if (status === 'CANCELLED') {
          color = 'red';
          text = 'ملغاة';
        } else if (status === 'DRAFT') {
          color = 'gray';
          text = 'مسودة';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];
  
  return (
    <div>
      <Row gutter={16}>
        <Col span={24} md={8}>
          <Card>
            <Title level={4}>تحليل الائتمان</Title>
            <Progress
              type="dashboard"
              percent={creditUsagePercentage}
              status={creditStatus.status as any}
              format={percent => `${percent}%`}
              width={120}
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Tag color={creditStatus.color} style={{ padding: '4px 8px', fontSize: 14 }}>
                {creditStatus.text}
              </Tag>
            </div>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="حد الائتمان"
                  value={customer.creditLimit}
                  precision={0}
                  valueStyle={{ color: '#3f8600' }}
                  suffix="ج.م"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="المبلغ المستخدم"
                  value={totalDueAmount}
                  precision={0}
                  valueStyle={{ color: '#cf1322' }}
                  suffix="ج.م"
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Statistic
                  title="المتبقي"
                  value={customer.creditLimit - totalDueAmount}
                  precision={0}
                  valueStyle={{ color: totalDueAmount > customer.creditLimit ? '#cf1322' : '#3f8600' }}
                  suffix="ج.م"
                  prefix={totalDueAmount > customer.creditLimit ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="عدد الفواتير"
                  value={customerInvoices.length}
                />
              </Col>
            </Row>
          </Card>
          
          <Card style={{ marginTop: 16 }}>
            <Title level={4}>سجل المدفوعات</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="مدفوعات في الموعد"
                  value={onTimePayments}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="مدفوعات متأخرة"
                  value={latePayments}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Col>
            </Row>
            {latePayments > 0 && (
              <Alert
                message="تنبيه"
                description="يوجد مدفوعات متأخرة للعميل. تحقق من سجل المدفوعات."
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
            {creditUsagePercentage > 90 && (
              <Alert
                message="تحذير"
                description={`تم تجاوز سقف الائتمان بنسبة ${creditUsagePercentage}%. يرجى مراجعة الحساب.`}
                type="error"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </Card>
        </Col>
        
        <Col span={24} md={16}>
          <Card title="الفواتير المستحقة" style={{ marginBottom: 16 }}>
            <Table
              columns={columns}
              dataSource={customerInvoices.filter(
                invoice => invoice.status !== 'CANCELLED' && invoice.totalAmount > invoice.paidAmount
              )}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: 'لا توجد فواتير مستحقة' }}
            />
          </Card>
          
          <Card title="تحليل الائتمان">
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>توصيات الائتمان</Title>
              
              {creditUsagePercentage < 50 && (
                <Alert
                  message="يمكن زيادة سقف الائتمان"
                  description={`استخدام العميل للائتمان منخفض (${creditUsagePercentage}%) ويمكن النظر في زيادة سقف الائتمان.`}
                  type="success"
                  showIcon
                />
              )}
              
              {creditUsagePercentage >= 50 && creditUsagePercentage < 75 && (
                <Alert
                  message="سقف الائتمان مناسب"
                  description={`استخدام العميل للائتمان متوسط (${creditUsagePercentage}%) ويبدو أن سقف الائتمان الحالي مناسب.`}
                  type="info"
                  showIcon
                />
              )}
              
              {creditUsagePercentage >= 75 && creditUsagePercentage < 90 && (
                <Alert
                  message="تنبيه: اقتراب من سقف الائتمان"
                  description={`استخدام العميل للائتمان مرتفع (${creditUsagePercentage}%). ينصح بمراقبة المشتريات الجديدة.`}
                  type="warning"
                  showIcon
                />
              )}
              
              {creditUsagePercentage >= 90 && (
                <Alert
                  message="تحذير: تجاوز سقف الائتمان"
                  description={`استخدام العميل للائتمان مرتفع جداً (${creditUsagePercentage}%). يرجى تحصيل المستحقات قبل السماح بمشتريات جديدة.`}
                  type="error"
                  showIcon
                />
              )}
            </div>
            
            <div style={{ marginTop: 24 }}>
              <Space>
                <Button type="primary">
                  تعديل سقف الائتمان
                </Button>
                <Button>
                  طباعة تقرير الائتمان
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerCreditAnalysis; 