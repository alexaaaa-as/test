'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Avatar, Space, Tag, Card, Tabs, Modal, Form, Input, Upload, message } from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  InboxOutlined
} from '@ant-design/icons';
import AppLayout from '../../../components/layout/AppLayout';
import PageHeader from '../../../components/common/PageHeader';
import RouteMap from '../../../components/common/RouteMap';
import RoutePlanner from '../../../components/common/RoutePlanner';
import { useStore } from '../../../lib/store';
import type { Representative, VisitStop } from '../../../types';
import { formatDate, generateId } from '../../../utils/helpers';

export default function RepresentativesPage() {
  const { 
    representatives, 
    setRepresentatives, 
    addRepresentative, 
    updateRepresentative, 
    deleteRepresentative,
    customers 
  } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRepresentative, setEditingRepresentative] = useState<Representative | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string>('1');
  const [selectedRepresentative, setSelectedRepresentative] = useState<Representative | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For demo, we'll create some mock data if there are no representatives
    if (representatives.length === 0) {
      const mockRepresentatives: Representative[] = [
        {
          id: generateId(),
          name: 'أحمد محمود',
          phone: '01012345678',
          email: 'ahmed@example.com',
          address: 'القاهرة، مصر',
          joinDate: '2022-01-15',
          active: true,
          photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
          currentLocation: { lat: 30.0444, lng: 31.2357, timestamp: new Date().toISOString() },
        },
        {
          id: generateId(),
          name: 'محمد علي',
          phone: '01098765432',
          email: 'mohamed@example.com',
          address: 'الإسكندرية، مصر',
          joinDate: '2022-03-10',
          active: true,
          photoUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
          currentLocation: { lat: 31.2001, lng: 29.9187, timestamp: new Date().toISOString() },
        },
        {
          id: generateId(),
          name: 'خالد إبراهيم',
          phone: '01023456789',
          email: 'khaled@example.com',
          address: 'الجيزة، مصر',
          joinDate: '2022-06-05',
          active: true,
          photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
          currentLocation: { lat: 30.0131, lng: 31.2089, timestamp: new Date().toISOString() },
        },
      ];

      setRepresentatives(mockRepresentatives);
    }
  }, [representatives.length, setRepresentatives]);

  const showModal = (representative?: Representative) => {
    setEditingRepresentative(representative || null);
    if (representative) {
      form.setFieldsValue(representative);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRepresentative(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRepresentative) {
        // Update existing representative
        updateRepresentative({
          ...editingRepresentative,
          ...values,
        });
        message.success('تم تحديث بيانات المندوب بنجاح');
      } else {
        // Add new representative
        addRepresentative({
          ...values,
          id: generateId(),
          joinDate: new Date().toISOString().split('T')[0],
          active: true,
          // Mock location for demo
          currentLocation: {
            lat: 30.0444 + (Math.random() * 2 - 1),
            lng: 31.2357 + (Math.random() * 2 - 1),
            timestamp: new Date().toISOString(),
          },
        });
        message.success('تم إضافة المندوب بنجاح');
      }
      setIsModalVisible(false);
      setEditingRepresentative(null);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'تأكيد الحذف',
      content: 'هل أنت متأكد من حذف هذا المندوب؟',
      okText: 'نعم',
      okType: 'danger',
      cancelText: 'إلغاء',
      onOk: () => {
        deleteRepresentative(id);
        message.success('تم حذف المندوب بنجاح');
      },
    });
  };

  const handleRepClick = (rep: Representative) => {
    setSelectedRepresentative(rep);
    setActiveTabKey('2'); // Switch to map tab
  };

  const handleSaveRoute = (representativeId: string, route: VisitStop[]) => {
    updateRepresentative({
      ...representatives.find(r => r.id === representativeId)!,
      visitRoute: route,
    });
    message.success('تم حفظ خط السير بنجاح');
  };

  const columns = [
    {
      title: 'المندوب',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: Representative) => (
        <Space>
          <Avatar 
            src={record.photoUrl} 
            icon={<UserOutlined />}
          />
          {record.name}
          {record.active ? (
            <Tag color="green">نشط</Tag>
          ) : (
            <Tag color="red">غير نشط</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'رقم الهاتف',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'تاريخ الانضمام',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'الموقع الحالي',
      key: 'location',
      render: (_: any, record: Representative) => (
        <Button 
          type="link"
          icon={<EnvironmentOutlined />}
          onClick={() => handleRepClick(record)}
        >
          عرض الموقع
        </Button>
      ),
    },
    {
      title: 'إجراءات',
      key: 'actions',
      render: (_: any, record: Representative) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)} 
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

  // Define the tabs items
  const tabItems = [
    {
      key: '1',
      label: 'قائمة المندوبين',
      children: (
        <Table
          columns={columns}
          dataSource={representatives}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered={false}
        />
      )
    },
    {
      key: '2',
      label: 'خريطة المندوبين',
      children: (
        <Card variant="outlined">
          <RouteMap
            representatives={representatives}
            customers={customers}
            selectedRepresentative={selectedRepresentative || undefined}
          />
        </Card>
      )
    },
    {
      key: '3',
      label: 'تخطيط المسارات',
      children: (
        <Card variant="outlined">
          {representatives.length > 0 && (
            <RoutePlanner
              representatives={representatives}
              customers={customers}
              onSaveRoute={handleSaveRoute}
            />
          )}
        </Card>
      )
    }
  ];

  return (
    <AppLayout>
      <PageHeader
        title="إدارة المندوبين"
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => showModal()}
          >
            إضافة مندوب
          </Button>
        }
      />

      <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} items={tabItems} />

      <Modal
        title={editingRepresentative ? "تعديل بيانات المندوب" : "إضافة مندوب جديد"}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        okText={editingRepresentative ? "تحديث" : "إضافة"}
        cancelText="إلغاء"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="اسم المندوب"
            rules={[{ required: true, message: 'يرجى إدخال اسم المندوب' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="اسم المندوب" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="رقم الهاتف"
            rules={[{ required: true, message: 'يرجى إدخال رقم الهاتف' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="رقم الهاتف" />
          </Form.Item>
          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[
              { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
              { type: 'email', message: 'البريد الإلكتروني غير صحيح' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="البريد الإلكتروني" />
          </Form.Item>
          <Form.Item
            name="address"
            label="العنوان"
            rules={[{ required: true, message: 'يرجى إدخال العنوان' }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="العنوان" />
          </Form.Item>
          <Form.Item
            name="photoUrl"
            label="صورة المندوب"
          >
            <Input placeholder="رابط الصورة" />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
} 