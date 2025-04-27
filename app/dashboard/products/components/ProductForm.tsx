import React, { useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Modal } from 'antd';
import type { Product } from '../../../../types';
import dayjs from 'dayjs';

const { Option } = Select;

interface ProductFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (product: Product) => void;
  product: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({
  visible,
  onCancel,
  onSave,
  product,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && product) {
      form.setFieldsValue({
        ...product,
        expiryDate: product.expiryDate ? dayjs(product.expiryDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [visible, product, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : '',
      };
      
      onSave({
        ...formattedValues,
        id: product?.id || '', // This will be replaced in the parent component if it's a new product
      } as Product);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const productCategories = [
    'أسمدة',
    'مبيدات',
    'بذور',
    'أدوات',
    'معدات',
    'مستلزمات زراعية',
    'أخرى',
  ];

  // Use a simpler approach for the InputNumber formatters to avoid type issues
  const formatPrice = (value: number | string | undefined) => (value ? `${value} ج.م` : '');

  return (
    <Modal
      title={product ? 'تعديل منتج' : 'إضافة منتج جديد'}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={product ? 'تحديث' : 'إضافة'}
      cancelText="إلغاء"
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          quantity: 0,
          wholesalePrice: 0,
          sellingPrice: 0,
        }}
      >
        <Form.Item
          name="name"
          label="اسم المنتج"
          rules={[{ required: true, message: 'يرجى إدخال اسم المنتج' }]}
        >
          <Input placeholder="اسم المنتج" />
        </Form.Item>
        
        <Form.Item
          name="category"
          label="الفئة"
          rules={[{ required: true, message: 'يرجى اختيار فئة المنتج' }]}
        >
          <Select placeholder="اختر فئة المنتج">
            {productCategories.map(category => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="quantity"
            label="الكمية"
            rules={[{ required: true, message: 'يرجى إدخال الكمية' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="wholesalePrice"
            label="سعر الجملة"
            rules={[{ required: true, message: 'يرجى إدخال سعر الجملة' }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              step={0.5}
              formatter={formatPrice}
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="sellingPrice"
            label="سعر البيع"
            rules={[{ required: true, message: 'يرجى إدخال سعر البيع' }]}
            style={{ flex: 1 }}
          >
            <InputNumber
              min={0}
              step={0.5}
              formatter={formatPrice}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="lotNumber"
            label="رقم اللوط"
            rules={[{ required: true, message: 'يرجى إدخال رقم اللوط' }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="رقم اللوط" />
          </Form.Item>
          
          <Form.Item
            name="expiryDate"
            label="تاريخ الصلاحية"
            rules={[{ required: true, message: 'يرجى إدخال تاريخ الصلاحية' }]}
            style={{ flex: 1 }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="تاريخ الصلاحية" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default ProductForm; 