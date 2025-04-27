'use client';

import React, { useState } from 'react';
import { Button, Form, Input, Typography, Card, message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useStore } from './lib/store';
import Image from 'next/image';

const { Title, Text } = Typography;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useStore();

  const onFinish = (values: { username: string; password: string }) => {
    setLoading(true);
    
    setTimeout(() => {
      // For demo purposes, we're using a simple hardcoded check
      if (values.username === 'admin' && values.password === 'admin') {
        login(values.username, values.password);
        message.success('تم تسجيل الدخول بنجاح');
        router.push('/dashboard');
      } else {
        message.error('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(135deg, #f8f9fa, #eaf0ea)',
      position: 'relative',
      direction: 'rtl'
    }}>
      <header style={{ 
        display: 'flex', 
        padding: '20px 50px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: 24, color: '#44803F' }}>
          أليكس للمستلزمات الزراعية
        </div>
        <div>
          <Button type="primary" icon={<LoginOutlined />}>
            تسجيل الدخول
          </Button>
        </div>
      </header>
      
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 50,
          maxWidth: 1200,
          width: '100%',
          marginBottom: 50,
        }}>
          <div style={{ flex: 1 }}>
            <Title level={1} style={{ marginBottom: 20, color: '#44803F' }}>
              نظام إدارة متكامل للشركات الزراعية
            </Title>
            <Text style={{ fontSize: 18, display: 'block', marginBottom: 30 }}>
              منصة متكاملة لإدارة المخزون، المندوبين، العملاء، والفواتير في شركة أليكس للمستلزمات الزراعية
            </Text>
            <div style={{ marginBottom: 30 }}>
              <div style={{ display: 'flex', marginBottom: 10 }}>
                <div style={{ width: 24, color: '#44803F', marginLeft: 10 }}>✓</div>
                <div>إدارة كاملة للمنتجات والمخزون مع توليد وطباعة الباركود</div>
              </div>
              <div style={{ display: 'flex', marginBottom: 10 }}>
                <div style={{ width: 24, color: '#44803F', marginLeft: 10 }}>✓</div>
                <div>تتبع مواقع المندوبين وتنظيم خط سير الزيارات</div>
              </div>
              <div style={{ display: 'flex', marginBottom: 10 }}>
                <div style={{ width: 24, color: '#44803F', marginLeft: 10 }}>✓</div>
                <div>إدارة العملاء وتحليل حركتهم الشرائية</div>
              </div>
              <div style={{ display: 'flex', marginBottom: 10 }}>
                <div style={{ width: 24, color: '#44803F', marginLeft: 10 }}>✓</div>
                <div>نظام فواتير متكامل وسهل الاستخدام</div>
              </div>
            </div>
          </div>
          
          <Card style={{ width: 350, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Title level={3}>تسجيل الدخول</Title>
              <Text type="secondary">أدخل بيانات الدخول للوصول إلى لوحة التحكم</Text>
            </div>
            
            <Form
              name="login_form"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'يرجى إدخال اسم المستخدم' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="اسم المستخدم" 
                  size="large" 
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'يرجى إدخال كلمة المرور' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="كلمة المرور" 
                  size="large" 
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block 
                  loading={loading}
                >
                  تسجيل الدخول
                </Button>
              </Form.Item>
              
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <Text type="secondary">للتجربة: اسم المستخدم وكلمة المرور هي "admin"</Text>
              </div>
            </Form>
          </Card>
        </div>
      </main>
      
      <footer style={{ 
        textAlign: 'center', 
        padding: '20px 0',
        borderTop: '1px solid #eaeaea',
        background: '#f9f9f9'
      }}>
        <Text type="secondary">أليكس للمستلزمات الزراعية © {new Date().getFullYear()} - جميع الحقوق محفوظة</Text>
      </footer>
    </div>
  );
} 