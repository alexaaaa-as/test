'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Customer, Representative } from '../../types';
import { Card, Avatar, Tag, Typography, Button } from 'antd';
import { UserOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

// Dynamically import map components with SSR disabled to avoid window not defined errors
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

// Component to adjust the map view
const MapUpdater = dynamic(
  () => {
    return Promise.resolve(({ center }: { center: [number, number] }) => {
      // This is a client-side only component
      if (typeof window === 'undefined') return null;
      
      const { useMap } = require('react-leaflet');
      const map = useMap();
      
      useEffect(() => {
        if (map) {
          map.setView(center, map.getZoom());
        }
      }, [center, map]);
      
      return null;
    });
  },
  { ssr: false }
);

interface RouteMapProps {
  representatives: Representative[];
  customers: Customer[];
  selectedRepresentative?: Representative;
  visitRoute?: { customerId: string; order: number }[];
  onCustomerClick?: (customer: Customer) => void;
}

// Create a client-side only wrapper component
const ClientSideOnlyRouteMap = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return <div style={{ height: '500px', width: '100%', background: '#f0f2f5', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading map...</div>;
  }
  
  return <>{children}</>;
};

const RouteMap: React.FC<RouteMapProps> = ({
  representatives,
  customers,
  selectedRepresentative,
  visitRoute = [],
  onCustomerClick,
}) => {
  const [center, setCenter] = useState<[number, number]>([30.0444, 31.2357]); // Cairo as default
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set isClient to true once the component mounts
    setIsClient(true);
    
    // Fix icon paths for Leaflet in the browser
    if (typeof window !== 'undefined') {
      // This is necessary for the default Leaflet marker icons
      delete (Icon.Default.prototype as any)._getIconUrl;
      Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    }
  }, []);

  useEffect(() => {
    if (selectedRepresentative?.currentLocation) {
      setCenter([
        selectedRepresentative.currentLocation.lat,
        selectedRepresentative.currentLocation.lng,
      ]);
    }
  }, [selectedRepresentative]);

  // Find customers for the route with their coordinates
  const routeCustomers = visitRoute
    .map(stop => {
      const customer = customers.find(c => c.id === stop.customerId);
      return { ...customer, order: stop.order };
    })
    .filter(customer => customer && customer.location) as (Customer & { order: number })[];

  // Sort by order
  routeCustomers.sort((a, b) => a.order - b.order);

  // Create route coordinates for the polyline
  const routeCoordinates: [number, number][] = routeCustomers
    .map(customer => [customer.location!.lat, customer.location!.lng] as [number, number]);

  // Add representative location to the beginning if available
  if (selectedRepresentative?.currentLocation) {
    routeCoordinates.unshift([
      selectedRepresentative.currentLocation.lat,
      selectedRepresentative.currentLocation.lng,
    ]);
  }

  // Custom icons
  const representativeIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

  const customerIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1478/1478906.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const routeCustomerIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  // Return early if not on client side
  if (!isClient) {
    return <div style={{ height: '500px', width: '100%', background: '#f0f2f5', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading map...</div>;
  }

  return (
    <ClientSideOnlyRouteMap>
      <div style={{ height: '500px', width: '100%', position: 'relative' }}>
        <MapContainer
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          center={center}
          zoom={10}
          scrollWheelZoom={true}
          maxZoom={18}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={18}
          />

          <MapUpdater center={center} />

          {/* Representatives markers */}
          {representatives.map(rep => (
            <Marker
              key={rep.id}
              position={[
                rep.currentLocation?.lat || 30.0444,
                rep.currentLocation?.lng || 31.2357,
              ]}
              icon={representativeIcon}
            >
              <Popup>
                <Card size="small" style={{ width: 200, border: 'none', padding: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={rep.photoUrl} icon={<UserOutlined />} />
                    <div style={{ marginRight: 8 }}>
                      <div><strong>{rep.name}</strong></div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {rep.phone}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Popup>
            </Marker>
          ))}

          {/* Customers markers */}
          {customers
            .filter(customer => customer.location)
            .filter(customer => !routeCustomers.some(rc => rc.id === customer.id))
            .map(customer => (
              <Marker
                key={customer.id}
                position={[customer.location!.lat, customer.location!.lng]}
                icon={customerIcon}
                eventHandlers={{
                  click: () => onCustomerClick && onCustomerClick(customer),
                }}
              >
                <Popup>
                  <Card size="small" style={{ width: 200, border: 'none', padding: 0 }}>
                    <Title level={5}>{customer.name}</Title>
                    <Text style={{ display: 'block' }}>{customer.phone}</Text>
                    <Text type="secondary" style={{ display: 'block' }}>{customer.address}</Text>
                    <Text style={{ display: 'block' }}>
                      حد الائتمان: <Tag color="blue">{customer.creditLimit} ج.م</Tag>
                    </Text>
                  </Card>
                </Popup>
              </Marker>
            ))}

          {/* Route customers markers with order numbers */}
          {routeCustomers.map(customer => (
            <Marker
              key={customer.id}
              position={[customer.location!.lat, customer.location!.lng]}
              icon={routeCustomerIcon}
              eventHandlers={{
                click: () => onCustomerClick && onCustomerClick(customer),
              }}
            >
              <Popup>
                <Card size="small" style={{ width: 200, border: 'none', padding: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Title level={5}>{customer.name}</Title>
                    <Tag color="orange">#{customer.order}</Tag>
                  </div>
                  <Text style={{ display: 'block' }}>{customer.phone}</Text>
                  <Text type="secondary" style={{ display: 'block' }}>{customer.address}</Text>
                  <Text style={{ display: 'block' }}>
                    حد الائتمان: <Tag color="blue">{customer.creditLimit} ج.م</Tag>
                  </Text>
                </Card>
              </Popup>
            </Marker>
          ))}

          {/* Route polyline */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              color="blue"
              weight={3}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>
    </ClientSideOnlyRouteMap>
  );
};

export default dynamic(() => Promise.resolve(RouteMap), { ssr: false }); 