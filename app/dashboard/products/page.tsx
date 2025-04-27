'use client';

import React, { useState, useEffect } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarcodeOutlined, SearchOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Table, Button, Input, Modal, message, Tag, Space, Tooltip, Popconfirm, Badge } from 'antd';
import { useStore } from '../../../lib/store';
import AppLayout from '../../../components/layout/AppLayout';
import PageHeader from '../../../components/common/PageHeader';
import ProductForm from './components/ProductForm';
import type { Product } from '../../../types';
import { formatCurrency, formatDate, isExpiringSoon, isExpired } from '../../../utils/helpers';
import { generateId, generateBarcode } from '../../../utils/helpers';
import { QRCodeSVG } from 'qrcode.react';

const { confirm } = Modal;
const { Search } = Input;

export default function ProductsPage() {
  const { products, setProducts, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isBarcodeModalVisible, setIsBarcodeModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For demo, we'll create some mock data if there are no products
    if (products.length === 0) {
      const mockProducts: Product[] = [
        {
          id: generateId(),
          name: 'سماد NPK',
          quantity: 75,
          wholesalePrice: 150,
          sellingPrice: 200,
          lotNumber: 'LOT123456',
          expiryDate: '2025-12-31',
          barcode: generateBarcode({ name: 'سماد NPK' }),
          category: 'أسمدة',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          name: 'مبيد حشري',
          quantity: 30,
          wholesalePrice: 85,
          sellingPrice: 120,
          lotNumber: 'LOT789012',
          expiryDate: '2025-06-15',
          barcode: generateBarcode({ name: 'مبيد حشري' }),
          category: 'مبيدات',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          name: 'بذور طماطم',
          quantity: 50,
          wholesalePrice: 60,
          sellingPrice: 90,
          lotNumber: 'LOT345678',
          expiryDate: '2025-08-20',
          barcode: generateBarcode({ name: 'بذور طماطم' }),
          category: 'بذور',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          name: 'أداة حفر',
          quantity: 15,
          wholesalePrice: 35,
          sellingPrice: 50,
          lotNumber: 'LOT901234',
          expiryDate: '2027-10-05',
          barcode: generateBarcode({ name: 'أداة حفر' }),
          category: 'أدوات',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          name: 'بذور خيار',
          quantity: 8,
          wholesalePrice: 40,
          sellingPrice: 60,
          lotNumber: 'LOT567890',
          expiryDate: '2024-05-10',
          barcode: generateBarcode({ name: 'بذور خيار' }),
          category: 'بذور',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setProducts(mockProducts);
    }
  }, [products.length, setProducts]);

  useEffect(() => {
    if (searchText) {
      const filtered = products.filter(
        product => 
          product.name.includes(searchText) || 
          product.category?.includes(searchText) ||
          product.lotNumber.includes(searchText)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchText, products]);

  const showModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  const handleSave = (product: Product) => {
    if (editingProduct) {
      // Update existing product
      updateProduct({
        ...product,
        updatedAt: new Date().toISOString(),
      });
      message.success('تم تحديث المنتج بنجاح');
    } else {
      // Add new product
      addProduct({
        ...product,
        id: generateId(),
        barcode: generateBarcode(product),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      message.success('تم إضافة المنتج بنجاح');
    }
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    message.success('تم حذف المنتج بنجاح');
  };

  const showDeleteConfirm = (product: Product) => {
    confirm({
      title: 'هل أنت متأكد من حذف هذا المنتج؟',
      icon: <ExclamationCircleFilled />,
      content: `سيتم حذف "${product.name}" نهائياً من النظام.`,
      okText: 'نعم',
      okType: 'danger',
      cancelText: 'إلغاء',
      onOk() {
        handleDelete(product.id);
      },
    });
  };

  const showBarcodeModal = (product: Product) => {
    setSelectedProduct(product);
    setIsBarcodeModalVisible(true);
  };

  const columns = [
    {
      title: 'اسم المنتج',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <Space>
          {text}
          {isExpired(record.expiryDate) ? (
            <Badge status="error" />
          ) : isExpiringSoon(record.expiryDate) ? (
            <Badge status="warning" />
          ) : null}
        </Space>
      ),
    },
    {
      title: 'الفئة',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category || 'غير مصنف'}</Tag>
      ),
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a: Product, b: Product) => a.quantity - b.quantity,
    },
    {
      title: 'سعر البيع',
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      render: (price: number) => formatCurrency(price),
      sorter: (a: Product, b: Product) => a.sellingPrice - b.sellingPrice,
    },
    {
      title: 'رقم اللوط',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
    },
    {
      title: 'تاريخ الصلاحية',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => formatDate(date),
      sorter: (a: Product, b: Product) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
    },
    {
      title: 'إجراءات',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Tooltip title="تعديل">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)} 
            />
          </Tooltip>
          <Tooltip title="طباعة الباركود">
            <Button 
              type="text" 
              icon={<BarcodeOutlined />} 
              onClick={() => showBarcodeModal(record)} 
            />
          </Tooltip>
          <Tooltip title="حذف">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => showDeleteConfirm(record)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const printBarcode = () => {
    if (!selectedProduct) return;
    
    const printWindow = window.open('', '', 'height=500,width=500');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>باركود المنتج - ${selectedProduct.name}</title>
            <style>
              body { font-family: 'Arial', sans-serif; text-align: center; }
              .barcode-container { margin: 20px; }
              .product-info { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <div class="product-info">
                <h2>${selectedProduct.name}</h2>
                <p>رقم اللوط: ${selectedProduct.lotNumber}</p>
                <p>تاريخ الصلاحية: ${formatDate(selectedProduct.expiryDate)}</p>
              </div>
              <div>
                <img src="data:image/svg+xml;utf8,${encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                    <rect width="200" height="200" fill="white" />
                    <text x="100" y="20" text-anchor="middle">${selectedProduct.barcode}</text>
                    <text x="100" y="190" text-anchor="middle">${selectedProduct.name}</text>
                  </svg>
                `)}" />
              </div>
              <p>${selectedProduct.barcode}</p>
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

  return (
    <AppLayout>
      <PageHeader
        title="إدارة المنتجات"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            إضافة منتج
          </Button>
        }
      />
      
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="ابحث عن منتج..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={value => setSearchText(value)}
          style={{ maxWidth: 400 }}
        />
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />

      <ProductForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onSave={handleSave}
        product={editingProduct}
      />

      <Modal
        title="باركود المنتج"
        open={isBarcodeModalVisible}
        onCancel={() => setIsBarcodeModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsBarcodeModalVisible(false)}>
            إغلاق
          </Button>,
          <Button key="print" type="primary" onClick={printBarcode}>
            طباعة
          </Button>,
        ]}
      >
        {selectedProduct && (
          <div style={{ textAlign: 'center' }}>
            <h3>{selectedProduct.name}</h3>
            <p>رقم اللوط: {selectedProduct.lotNumber}</p>
            <QRCodeSVG value={selectedProduct.barcode} size={200} />
            <p style={{ marginTop: 16 }}>{selectedProduct.barcode}</p>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
} 