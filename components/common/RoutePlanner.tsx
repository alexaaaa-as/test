'use client';

import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Button, Typography, Tag, Space, Row, Col, Select, message, Progress } from 'antd';
import dynamic from 'next/dynamic';
import { UserOutlined, EnvironmentOutlined, SwapOutlined, CalculatorOutlined } from '@ant-design/icons';
import { Customer, Representative, VisitStop } from '../../types';
import { generateId } from '../../utils/helpers';
import type { DropResult } from 'react-beautiful-dnd';

const { Text, Title } = Typography;
const { Option } = Select;

// Dynamically import react-beautiful-dnd components with SSR disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);

const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);

const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

// Dynamically import RouteMap with SSR disabled
const RouteMap = dynamic(
  () => import('./RouteMap'),
  { ssr: false }
);

// Client-side only wrapper component
const ClientSideOnly = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return <div>Loading route planner...</div>;
  }
  
  return <>{children}</>;
};

interface RoutePlannerProps {
  customers: Customer[];
  representatives: Representative[];
  onSaveRoute?: (representativeId: string, route: VisitStop[]) => void;
}

const RoutePlanner: React.FC<RoutePlannerProps> = ({ 
  customers, 
  representatives,
  onSaveRoute
}) => {
  const [selectedRepId, setSelectedRepId] = useState<string | undefined>(
    representatives.length > 0 ? representatives[0].id : undefined
  );
  const [routeCustomers, setRouteCustomers] = useState<Array<Customer & { order: number }>>([]);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [optimizing, setOptimizing] = useState(false);

  const selectedRepresentative = representatives.find(rep => rep.id === selectedRepId);

  // Initialize available customers
  useEffect(() => {
    if (customers.length > 0) {
      const customersWithLocation = customers.filter(c => c.location);
      
      // Filter customers that are already in the route
      const availableCusts = customersWithLocation.filter(
        c => !routeCustomers.some(rc => rc.id === c.id)
      );
      
      setAvailableCustomers(availableCusts);
    }
  }, [customers, routeCustomers]);

  // On representative change, reset the route
  useEffect(() => {
    setRouteCustomers([]);
  }, [selectedRepId]);

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Moving within the same list
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'routeList') {
        const reordered = [...routeCustomers];
        const [removed] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, removed);
        
        // Update order numbers
        const updatedRoute = reordered.map((customer, index) => ({
          ...customer,
          order: index + 1
        }));
        
        setRouteCustomers(updatedRoute);
      }
    } else {
      // Moving between lists
      if (source.droppableId === 'availableList' && destination.droppableId === 'routeList') {
        // Add to route
        const customerToAdd = availableCustomers[source.index];
        setRouteCustomers([
          ...routeCustomers,
          { ...customerToAdd, order: routeCustomers.length + 1 }
        ]);
      } else if (source.droppableId === 'routeList' && destination.droppableId === 'availableList') {
        // Remove from route
        const updatedRoute = routeCustomers.filter((_, index) => index !== source.index);
        
        // Update order numbers
        const reorderedRoute = updatedRoute.map((customer, index) => ({
          ...customer,
          order: index + 1
        }));
        
        setRouteCustomers(reorderedRoute);
      }
    }
  };

  // Calculate nearest customer based on coordinates
  const findNearestCustomer = (fromLat: number, fromLng: number, customers: Customer[]): Customer | null => {
    if (customers.length === 0) return null;
    
    let nearestCustomer = customers[0];
    let minDistance = Number.MAX_VALUE;
    
    customers.forEach(customer => {
      if (customer.location) {
        const distance = calculateDistance(
          fromLat, 
          fromLng, 
          customer.location.lat, 
          customer.location.lng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestCustomer = customer;
        }
      }
    });
    
    return nearestCustomer;
  };
  
  // Haversine formula to calculate distance between two points on Earth
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };

  // Optimize route based on nearest neighbor algorithm
  const optimizeRoute = () => {
    if (!selectedRepresentative?.currentLocation) {
      message.error('لا يمكن تحديد موقع المندوب الحالي');
      return;
    }
    
    setOptimizing(true);
    
    // Start from representative's current location
    let currentLat = selectedRepresentative.currentLocation.lat;
    let currentLng = selectedRepresentative.currentLocation.lng;
    
    // Get all customers with locations
    const customersToOptimize = [...availableCustomers];
    const optimizedRoute: Array<Customer & { order: number }> = [];
    
    // Simple nearest neighbor algorithm
    let count = 1;
    while (customersToOptimize.length > 0) {
      const nearest = findNearestCustomer(currentLat, currentLng, customersToOptimize);
      if (nearest && nearest.location) {
        // Add to optimized route
        optimizedRoute.push({ ...nearest, order: count++ });
        
        // Update current position
        currentLat = nearest.location.lat;
        currentLng = nearest.location.lng;
        
        // Remove from available customers
        const index = customersToOptimize.findIndex(c => c.id === nearest.id);
        if (index !== -1) {
          customersToOptimize.splice(index, 1);
        }
      } else {
        break;
      }
    }
    
    // Delay to show the optimization progress
    setTimeout(() => {
      setRouteCustomers(optimizedRoute);
      setOptimizing(false);
      message.success('تم تحسين المسار بنجاح');
    }, 1000);
  };

  // Save the route
  const handleSaveRoute = () => {
    if (!selectedRepId || routeCustomers.length === 0) {
      message.error('يرجى تحديد المندوب وإضافة عملاء إلى المسار');
      return;
    }
    
    const route: VisitStop[] = routeCustomers.map(customer => ({
      id: generateId(),
      customerId: customer.id,
      order: customer.order,
      status: 'PENDING',
      visitDate: new Date().toISOString().split('T')[0]
    }));
    
    if (onSaveRoute) {
      onSaveRoute(selectedRepId, route);
      message.success('تم حفظ المسار بنجاح');
    }
  };

  return (
    <ClientSideOnly>
      <div>
        <Row gutter={16}>
          <Col span={24} md={8}>
            <Card title="إعدادات المسار" variant="outlined">
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>اختر المندوب:</label>
                <Select
                  style={{ width: '100%' }}
                  value={selectedRepId}
                  onChange={setSelectedRepId}
                  placeholder="اختر المندوب"
                >
                  {representatives.map(rep => (
                    <Option key={rep.id} value={rep.id}>
                      <Space>
                        <Avatar size="small" src={rep.photoUrl} icon={<UserOutlined />} />
                        {rep.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<CalculatorOutlined />} 
                  onClick={optimizeRoute}
                  disabled={!selectedRepId || availableCustomers.length === 0 || optimizing}
                  loading={optimizing}
                  block
                >
                  تحسين المسار تلقائيًا
                </Button>
                
                {optimizing && (
                  <Progress percent={Math.floor(Math.random() * 100)} status="active" />
                )}
              </div>
              
              <div style={{ marginTop: 16 }}>
                <Button 
                  type="default" 
                  onClick={handleSaveRoute}
                  disabled={!selectedRepId || routeCustomers.length === 0}
                  block
                >
                  حفظ المسار
                </Button>
              </div>
            </Card>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <Card 
                title={`مسار الزيارات (${routeCustomers.length})`} 
                style={{ marginTop: 16 }}
                extra={
                  <Tag color="blue">
                    يمكنك سحب وإفلات العملاء لترتيب المسار
                  </Tag>
                }
              >
                <Droppable droppableId="routeList">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ minHeight: 200 }}
                    >
                      {routeCustomers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                          لا يوجد عملاء في المسار
                        </div>
                      ) : (
                        <List
                          dataSource={routeCustomers}
                          renderItem={(customer, index) => (
                            <Draggable 
                              key={customer.id} 
                              draggableId={customer.id} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <List.Item style={{ padding: '8px 0' }}>
                                    <List.Item.Meta
                                      avatar={
                                        <div style={{ textAlign: 'center', width: 24 }}>
                                          <Tag color="orange">{customer.order}</Tag>
                                        </div>
                                      }
                                      title={customer.name}
                                      description={
                                        <Text type="secondary" ellipsis>
                                          {customer.address}
                                        </Text>
                                      }
                                    />
                                  </List.Item>
                                </div>
                              )}
                            </Draggable>
                          )}
                        />
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
              
              <Card 
                title={`العملاء المتاحين (${availableCustomers.length})`}
                variant="outlined"
                style={{ marginTop: 16 }}
              >
                <Droppable droppableId="availableList">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ minHeight: 200 }}
                    >
                      {availableCustomers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                          لا يوجد عملاء متاحين
                        </div>
                      ) : (
                        <List
                          dataSource={availableCustomers}
                          renderItem={(customer, index) => (
                            <Draggable 
                              key={customer.id} 
                              draggableId={`available-${customer.id}`} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <List.Item style={{ padding: '8px 0' }}>
                                    <List.Item.Meta
                                      avatar={<Avatar icon={<UserOutlined />} />}
                                      title={customer.name}
                                      description={
                                        <Text type="secondary" ellipsis>
                                          {customer.address}
                                        </Text>
                                      }
                                    />
                                  </List.Item>
                                </div>
                              )}
                            </Draggable>
                          )}
                        />
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </DragDropContext>
          </Col>
          
          <Col span={24} md={16}>
            <Card title="خريطة المسار" variant="outlined">
              <RouteMap
                representatives={selectedRepId ? 
                  representatives.filter(r => r.id === selectedRepId) : 
                  representatives
                }
                customers={customers}
                selectedRepresentative={selectedRepresentative}
                visitRoute={routeCustomers.map(c => ({ customerId: c.id, order: c.order }))}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </ClientSideOnly>
  );
};

export default dynamic(() => Promise.resolve(RoutePlanner), { ssr: false }); 