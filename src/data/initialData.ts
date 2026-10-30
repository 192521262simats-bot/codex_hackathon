import {
  Supplier,
  Warehouse,
  Product,
  InventoryItem,
  Carrier,
  Shipment,
  CustomerOrder,
  Disruption,
  RecoveryPlan,
  NotificationItem,
  AuditLog,
  UserProfile,
  StockStatus,
  CustomerTier,
  OrderPriority,
} from '../types';

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@rippleguard.ai',
    role: 'Logistics Manager',
    title: 'Director of Global Supply Chain Operations',
    department: 'Logistics Control Tower',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  },
  {
    id: 'user-2',
    name: 'Marcus Vance',
    email: 'marcus.vance@rippleguard.ai',
    role: 'Warehouse Operator',
    title: 'Lead Logistics & Fulfillment Supervisor',
    department: 'Warehouse Network Operations',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  },
  {
    id: 'user-3',
    name: 'David Chen',
    email: 'david.chen@rippleguard.ai',
    role: 'Procurement Approver',
    title: 'VP of Global Strategic Sourcing',
    department: 'Procurement & Vendor Alliances',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    supplierNumber: 'SUP-1001',
    name: 'Global Chipsets Corp',
    country: 'Taiwan',
    location: 'Hsinchu Science Park',
    productsSupplied: ['prod-1', 'prod-7', 'prod-18'],
    reliabilityScore: 78,
    avgDeliveryDays: 14,
    status: 'Disrupted',
    contactEmail: 'logistics@globalchipsets.tw',
    leadTimeVarianceDays: 4,
    qualityRating: 4.8,
  },
  {
    id: 'sup-2',
    supplierNumber: 'SUP-1002',
    name: 'Pacific Polymers Inc',
    country: 'United States',
    location: 'Portland, OR',
    productsSupplied: ['prod-6', 'prod-17', 'prod-20'],
    reliabilityScore: 94,
    avgDeliveryDays: 5,
    status: 'Active',
    contactEmail: 'orders@pacificpolymers.com',
    leadTimeVarianceDays: 1,
    qualityRating: 4.9,
  },
  {
    id: 'sup-3',
    supplierNumber: 'SUP-1003',
    name: 'Apex Microelectronics',
    country: 'South Korea',
    location: 'Suwon Industrial Zone',
    productsSupplied: ['prod-1', 'prod-5', 'prod-19'],
    reliabilityScore: 91,
    avgDeliveryDays: 11,
    status: 'Active',
    contactEmail: 'export@apexmicro.kr',
    leadTimeVarianceDays: 2,
    qualityRating: 4.7,
  },
  {
    id: 'sup-4',
    supplierNumber: 'SUP-1004',
    name: 'Nordic Precision Steel',
    country: 'Sweden',
    location: 'Gothenburg Hub',
    productsSupplied: ['prod-3', 'prod-8', 'prod-13'],
    reliabilityScore: 96,
    avgDeliveryDays: 9,
    status: 'Active',
    contactEmail: 'dispatch@nordicsteel.se',
    leadTimeVarianceDays: 1,
    qualityRating: 4.95,
  },
  {
    id: 'sup-5',
    supplierNumber: 'SUP-1005',
    name: 'Titan Power Systems',
    country: 'Japan',
    location: 'Yokohama Tech Cluster',
    productsSupplied: ['prod-4', 'prod-11', 'prod-12'],
    reliabilityScore: 82,
    avgDeliveryDays: 12,
    status: 'Active',
    contactEmail: 'support@titanpower.jp',
    leadTimeVarianceDays: 3,
    qualityRating: 4.85,
  },
  {
    id: 'sup-6',
    supplierNumber: 'SUP-1006',
    name: 'Shenzhen ElectroFab',
    country: 'China',
    location: 'Baoan District, Shenzhen',
    productsSupplied: ['prod-2', 'prod-7', 'prod-15'],
    reliabilityScore: 88,
    avgDeliveryDays: 10,
    status: 'Active',
    contactEmail: 'sales@szelectrofab.cn',
    leadTimeVarianceDays: 2,
    qualityRating: 4.6,
  },
  {
    id: 'sup-7',
    supplierNumber: 'SUP-1007',
    name: 'Rheinland Sensorik GmbH',
    country: 'Germany',
    location: 'Stuttgart Automation Valley',
    productsSupplied: ['prod-2', 'prod-9', 'prod-16'],
    reliabilityScore: 97,
    avgDeliveryDays: 6,
    status: 'Active',
    contactEmail: 'eu.orders@rheinlandsensorik.de',
    leadTimeVarianceDays: 1,
    qualityRating: 4.98,
  },
  {
    id: 'sup-8',
    supplierNumber: 'SUP-1008',
    name: 'Alliance Packaging Ltd',
    country: 'United States',
    location: 'Chicago, IL',
    productsSupplied: ['prod-6', 'prod-17'],
    reliabilityScore: 95,
    avgDeliveryDays: 3,
    status: 'Active',
    contactEmail: 'service@alliancepkg.com',
    leadTimeVarianceDays: 1,
    qualityRating: 4.75,
  },
  {
    id: 'sup-9',
    supplierNumber: 'SUP-1009',
    name: 'Kyoto Opto-Tech',
    country: 'Japan',
    location: 'Kyoto High-Tech Corridor',
    productsSupplied: ['prod-5', 'prod-15', 'prod-16'],
    reliabilityScore: 93,
    avgDeliveryDays: 8,
    status: 'Active',
    contactEmail: 'shipments@kyotoot.jp',
    leadTimeVarianceDays: 2,
    qualityRating: 4.9,
  },
  {
    id: 'sup-10',
    supplierNumber: 'SUP-1010',
    name: 'Horizon Energy Storage',
    country: 'United States',
    location: 'Austin, TX',
    productsSupplied: ['prod-4', 'prod-14', 'prod-20'],
    reliabilityScore: 89,
    avgDeliveryDays: 4,
    status: 'Active',
    contactEmail: 'b2b@horizonenergy.us',
    leadTimeVarianceDays: 1,
    qualityRating: 4.8,
  },
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'WH-NORTH',
    name: 'Chicago Central Logistics Hub',
    city: 'Chicago, IL',
    region: 'Midwest',
    capacityUnits: 45000,
    currentUtilizationPercent: 88,
    manager: 'Sarah Jenkins',
  },
  {
    id: 'wh-2',
    code: 'WH-WEST',
    name: 'Reno Pacific Gateway Center',
    city: 'Reno, NV',
    region: 'West Coast',
    capacityUnits: 60000,
    currentUtilizationPercent: 62,
    manager: 'Craig Peterson',
  },
  {
    id: 'wh-3',
    code: 'WH-SOUTH',
    name: 'Dallas Cross-Dock Terminal',
    city: 'Dallas, TX',
    region: 'South',
    capacityUnits: 50000,
    currentUtilizationPercent: 74,
    manager: 'Amanda Silva',
  },
  {
    id: 'wh-4',
    code: 'WH-EAST',
    name: 'Newark Deepwater Depot',
    city: 'Newark, NJ',
    region: 'Northeast',
    capacityUnits: 40000,
    currentUtilizationPercent: 81,
    manager: 'Robert O’Connor',
  },
  {
    id: 'wh-5',
    code: 'WH-CENTRAL',
    name: 'Kansas City Heartland Facility',
    city: 'Kansas City, MO',
    region: 'Central',
    capacityUnits: 35000,
    currentUtilizationPercent: 69,
    manager: 'Todd Miller',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-1', sku: 'MCU-9400', name: 'Industrial Microcontroller Unit', category: 'Semiconductors', unitPrice: 145.0, primarySupplierId: 'sup-1', criticalComponent: true, minLeadTimeDays: 14 },
  { id: 'prod-2', sku: 'SNS-4200', name: 'Multi-Axis Vibration Sensor Array', category: 'Sensors', unitPrice: 89.5, primarySupplierId: 'sup-7', criticalComponent: true, minLeadTimeDays: 7 },
  { id: 'prod-3', sku: 'FST-8100', name: 'High-Tensile Aerospace Fasteners', category: 'Hardware', unitPrice: 18.2, primarySupplierId: 'sup-4', criticalComponent: false, minLeadTimeDays: 5 },
  { id: 'prod-4', sku: 'BAT-6500', name: 'Lithium-Ion 48V Power Module', category: 'Power & Storage', unitPrice: 520.0, primarySupplierId: 'sup-5', criticalComponent: true, minLeadTimeDays: 12 },
  { id: 'prod-5', sku: 'OPT-3300', name: 'Fiber-Optic Optical Transceiver', category: 'Networking', unitPrice: 210.0, primarySupplierId: 'sup-9', criticalComponent: true, minLeadTimeDays: 8 },
  { id: 'prod-6', sku: 'HSG-1100', name: 'Polycarbonate Sealed Housing', category: 'Enclosures', unitPrice: 42.0, primarySupplierId: 'sup-2', criticalComponent: false, minLeadTimeDays: 4 },
  { id: 'prod-7', sku: 'FPG-7800', name: 'High-Density Embedded FPGA Board', category: 'Semiconductors', unitPrice: 380.0, primarySupplierId: 'sup-1', criticalComponent: true, minLeadTimeDays: 15 },
  { id: 'prod-8', sku: 'BRG-5500', name: 'Ceramic Precision Ball Bearing', category: 'Mechanical', unitPrice: 65.0, primarySupplierId: 'sup-4', criticalComponent: false, minLeadTimeDays: 6 },
  { id: 'prod-9', sku: 'ACT-2900', name: 'Servo Electro-Hydraulic Actuator', category: 'Motion Control', unitPrice: 310.0, primarySupplierId: 'sup-7', criticalComponent: true, minLeadTimeDays: 9 },
  { id: 'prod-10', sku: 'THM-1050', name: 'Industrial Thermal Paste (300ml)', category: 'Consumables', unitPrice: 24.0, primarySupplierId: 'sup-2', criticalComponent: false, minLeadTimeDays: 3 },
  { id: 'prod-11', sku: 'RLY-6200', name: 'Solid-State Heavy Smart Relay', category: 'Electrical', unitPrice: 75.0, primarySupplierId: 'sup-5', criticalComponent: false, minLeadTimeDays: 7 },
  { id: 'prod-12', sku: 'MOT-8800', name: 'High-Torque Brushless DC Motor', category: 'Motion Control', unitPrice: 285.0, primarySupplierId: 'sup-5', criticalComponent: true, minLeadTimeDays: 11 },
  { id: 'prod-13', sku: 'BUS-4400', name: 'Pure Oxygen-Free Copper Busbar', category: 'Raw Metals', unitPrice: 55.0, primarySupplierId: 'sup-4', criticalComponent: false, minLeadTimeDays: 5 },
  { id: 'prod-14', sku: 'BRK-9100', name: 'Thermal-Magnetic Circuit Breaker', category: 'Electrical', unitPrice: 115.0, primarySupplierId: 'sup-10', criticalComponent: true, minLeadTimeDays: 6 },
  { id: 'prod-15', sku: 'DSP-3600', name: 'Rugged Touch HMI Display Panel', category: 'Displays', unitPrice: 440.0, primarySupplierId: 'sup-6', criticalComponent: true, minLeadTimeDays: 10 },
  { id: 'prod-16', sku: 'ANT-7200', name: 'Wideband Industrial RF Antenna', category: 'Telecommunications', unitPrice: 62.0, primarySupplierId: 'sup-9', criticalComponent: false, minLeadTimeDays: 7 },
  { id: 'prod-17', sku: 'GSK-1900', name: 'Viton Fluoropolymer Gasket Seal', category: 'Enclosures', unitPrice: 14.5, primarySupplierId: 'sup-8', criticalComponent: false, minLeadTimeDays: 4 },
  { id: 'prod-18', sku: 'CAP-5100', name: 'High-Voltage Ceramic Capacitor', category: 'Passive Components', unitPrice: 8.5, primarySupplierId: 'sup-1', criticalComponent: false, minLeadTimeDays: 10 },
  { id: 'prod-19', sku: 'GTW-8300', name: 'Modbus Ethernet Edge Gateway', category: 'Networking', unitPrice: 495.0, primarySupplierId: 'sup-3', criticalComponent: true, minLeadTimeDays: 9 },
  { id: 'prod-20', sku: 'REG-2200', name: 'Precision Linear Voltage Regulator', category: 'Semiconductors', unitPrice: 32.0, primarySupplierId: 'sup-10', criticalComponent: false, minLeadTimeDays: 5 },
];

export const INITIAL_CARRIERS: Carrier[] = [
  { id: 'car-1', name: 'Apex Intermodal Express', code: 'AIE', transportMode: 'Intermodal', onTimeRating: 92, status: 'Active', contact: 'ops@apexintermodal.com' },
  { id: 'car-2', name: 'SwiftLine Air Cargo', code: 'SAC', transportMode: 'Air', onTimeRating: 98, status: 'Active', contact: 'dispatch@swiftlinecargo.com' },
  { id: 'car-3', name: 'Global Haulage Logistics', code: 'GHL', transportMode: 'Ground', onTimeRating: 84, status: 'Congested', contact: 'fleet@globalhaul.com' },
  { id: 'car-4', name: 'Horizon Maritime Line', code: 'HML', transportMode: 'Ocean', onTimeRating: 79, status: 'Congested', contact: 'dockside@horizonmarine.com' },
  { id: 'car-5', name: 'Vanguard Dedicated Freight', code: 'VDF', transportMode: 'Ground', onTimeRating: 96, status: 'Active', contact: 'priority@vanguardfreight.com' },
];

// Helper to calculate stock status
export const computeStockStatus = (available: number, reorder: number): StockStatus => {
  if (available <= 0) return 'Out of Stock';
  if (available < reorder) return 'Low Stock';
  if (available > reorder * 2.5) return 'Excess';
  return 'Optimal';
};

// Generate realistic inventory for all 20 products across 5 warehouses
export const INITIAL_INVENTORY: InventoryItem[] = [
  // Scenario A & B specific critical states:
  // WH-North has a deficit for Lithium Module (prod-4) (Scenario B)
  { id: 'inv-1', productId: 'prod-4', warehouseId: 'wh-1', availableQty: 25, reservedQty: 300, requiredQty: 325, reorderLevel: 200, stockStatus: 'Low Stock', lastUpdated: '2026-10-28 09:30' },
  // WH-West has EXCESS stock of prod-4! (Scenario B resolution)
  { id: 'inv-2', productId: 'prod-4', warehouseId: 'wh-2', availableQty: 1450, reservedQty: 150, requiredQty: 200, reorderLevel: 300, stockStatus: 'Excess', lastUpdated: '2026-10-28 10:15' },
  // WH-North has deficit for MCU-9400 (prod-1) delayed by Global Chipsets (Scenario A)
  { id: 'inv-3', productId: 'prod-1', warehouseId: 'wh-1', availableQty: 10, reservedQty: 450, requiredQty: 480, reorderLevel: 250, stockStatus: 'Low Stock', lastUpdated: '2026-10-29 08:00' },
  { id: 'inv-4', productId: 'prod-1', warehouseId: 'wh-2', availableQty: 680, reservedQty: 200, requiredQty: 220, reorderLevel: 250, stockStatus: 'Optimal', lastUpdated: '2026-10-29 08:30' },
  { id: 'inv-5', productId: 'prod-7', warehouseId: 'wh-1', availableQty: 15, reservedQty: 180, requiredQty: 210, reorderLevel: 150, stockStatus: 'Low Stock', lastUpdated: '2026-10-29 07:45' },
  { id: 'inv-6', productId: 'prod-7', warehouseId: 'wh-3', availableQty: 340, reservedQty: 90, requiredQty: 110, reorderLevel: 150, stockStatus: 'Optimal', lastUpdated: '2026-10-28 16:20' },
  { id: 'inv-7', productId: 'prod-2', warehouseId: 'wh-1', availableQty: 850, reservedQty: 300, requiredQty: 350, reorderLevel: 400, stockStatus: 'Optimal', lastUpdated: '2026-10-29 11:00' },
  { id: 'inv-8', productId: 'prod-2', warehouseId: 'wh-4', availableQty: 620, reservedQty: 250, requiredQty: 280, reorderLevel: 300, stockStatus: 'Optimal', lastUpdated: '2026-10-29 10:15' },
  { id: 'inv-9', productId: 'prod-3', warehouseId: 'wh-1', availableQty: 5400, reservedQty: 1200, requiredQty: 1500, reorderLevel: 2000, stockStatus: 'Optimal', lastUpdated: '2026-10-28 14:00' },
  { id: 'inv-10', productId: 'prod-3', warehouseId: 'wh-5', availableQty: 4200, reservedQty: 800, requiredQty: 1000, reorderLevel: 1500, stockStatus: 'Optimal', lastUpdated: '2026-10-28 15:30' },
  { id: 'inv-11', productId: 'prod-5', warehouseId: 'wh-2', availableQty: 410, reservedQty: 120, requiredQty: 140, reorderLevel: 180, stockStatus: 'Optimal', lastUpdated: '2026-10-29 06:45' },
  { id: 'inv-12', productId: 'prod-5', warehouseId: 'wh-4', availableQty: 390, reservedQty: 110, requiredQty: 130, reorderLevel: 180, stockStatus: 'Optimal', lastUpdated: '2026-10-29 09:10' },
  { id: 'inv-13', productId: 'prod-6', warehouseId: 'wh-1', availableQty: 1800, reservedQty: 400, requiredQty: 450, reorderLevel: 600, stockStatus: 'Optimal', lastUpdated: '2026-10-28 12:00' },
  { id: 'inv-14', productId: 'prod-6', warehouseId: 'wh-3', availableQty: 1950, reservedQty: 500, requiredQty: 550, reorderLevel: 600, stockStatus: 'Optimal', lastUpdated: '2026-10-28 12:45' },
  { id: 'inv-15', productId: 'prod-8', warehouseId: 'wh-1', availableQty: 1200, reservedQty: 300, requiredQty: 350, reorderLevel: 500, stockStatus: 'Optimal', lastUpdated: '2026-10-29 11:30' },
  { id: 'inv-16', productId: 'prod-9', warehouseId: 'wh-3', availableQty: 290, reservedQty: 80, requiredQty: 100, reorderLevel: 120, stockStatus: 'Optimal', lastUpdated: '2026-10-29 09:20' },
  { id: 'inv-17', productId: 'prod-10', warehouseId: 'wh-1', availableQty: 2800, reservedQty: 600, requiredQty: 700, reorderLevel: 1000, stockStatus: 'Optimal', lastUpdated: '2026-10-28 17:00' },
  { id: 'inv-18', productId: 'prod-11', warehouseId: 'wh-4', availableQty: 740, reservedQty: 200, requiredQty: 240, reorderLevel: 300, stockStatus: 'Optimal', lastUpdated: '2026-10-28 18:00' },
  { id: 'inv-19', productId: 'prod-12', warehouseId: 'wh-2', availableQty: 310, reservedQty: 110, requiredQty: 130, reorderLevel: 150, stockStatus: 'Optimal', lastUpdated: '2026-10-29 12:15' },
  { id: 'inv-20', productId: 'prod-13', warehouseId: 'wh-5', availableQty: 1650, reservedQty: 400, requiredQty: 480, reorderLevel: 600, stockStatus: 'Optimal', lastUpdated: '2026-10-29 13:00' },
  { id: 'inv-21', productId: 'prod-14', warehouseId: 'wh-3', availableQty: 480, reservedQty: 150, requiredQty: 170, reorderLevel: 200, stockStatus: 'Optimal', lastUpdated: '2026-10-28 16:50' },
  { id: 'inv-22', productId: 'prod-15', warehouseId: 'wh-4', availableQty: 210, reservedQty: 90, requiredQty: 105, reorderLevel: 100, stockStatus: 'Optimal', lastUpdated: '2026-10-29 07:30' },
  { id: 'inv-23', productId: 'prod-16', warehouseId: 'wh-2', availableQty: 890, reservedQty: 220, requiredQty: 250, reorderLevel: 350, stockStatus: 'Optimal', lastUpdated: '2026-10-29 08:45' },
  { id: 'inv-24', productId: 'prod-17', warehouseId: 'wh-1', availableQty: 3200, reservedQty: 700, requiredQty: 800, reorderLevel: 1000, stockStatus: 'Optimal', lastUpdated: '2026-10-28 11:15' },
  { id: 'inv-25', productId: 'prod-18', warehouseId: 'wh-1', availableQty: 12000, reservedQty: 2800, requiredQty: 3200, reorderLevel: 4000, stockStatus: 'Optimal', lastUpdated: '2026-10-28 10:00' },
  { id: 'inv-26', productId: 'prod-19', warehouseId: 'wh-3', availableQty: 195, reservedQty: 60, requiredQty: 75, reorderLevel: 90, stockStatus: 'Optimal', lastUpdated: '2026-10-29 10:45' },
  { id: 'inv-27', productId: 'prod-20', warehouseId: 'wh-5', availableQty: 4800, reservedQty: 950, requiredQty: 1100, reorderLevel: 1500, stockStatus: 'Optimal', lastUpdated: '2026-10-28 14:40' },
  { id: 'inv-28', productId: 'prod-4', warehouseId: 'wh-3', availableQty: 80, reservedQty: 60, requiredQty: 70, reorderLevel: 100, stockStatus: 'Low Stock', lastUpdated: '2026-10-29 09:00' },
  { id: 'inv-29', productId: 'prod-1', warehouseId: 'wh-4', availableQty: 140, reservedQty: 120, requiredQty: 135, reorderLevel: 150, stockStatus: 'Low Stock', lastUpdated: '2026-10-29 09:15' },
  { id: 'inv-30', productId: 'prod-7', warehouseId: 'wh-2', availableQty: 450, reservedQty: 100, requiredQty: 120, reorderLevel: 180, stockStatus: 'Optimal', lastUpdated: '2026-10-29 08:50' },
];

// 50 Customer Orders
const customerNames = [
  'Tesla Gigafactory Texas',
  'Lockheed Martin Space Systems',
  'Siemens Healthineers MRI Lab',
  'Honeywell Aerospace Division',
  'Medtronic Surgical Robotics',
  'General Electric Power Systems',
  'Schneider Electric Infrastructure',
  'Caterpillar Autonomous Mining',
  'Boston Dynamics Fleet Ops',
  'Raytheon Intelligence & Space',
  'Apple Hardware Engineering',
  'General Motors Orion Plant',
  'Boeing Commercial Airplanes',
  'Northrop Grumman Mission Systems',
  'ABB Industrial Robotics',
  'John Deere Precision Ag',
  'Intel Foundry Services',
  'Stellantis North America',
  'Philips Healthcare Solutions',
  'Rockwell Automation Systems',
];

const customerTiers: CustomerTier[] = [
  'Critical Healthcare',
  'Aerospace OEM',
  'Tier 1 Enterprise',
  'Standard',
];

// Pre-compute 50 realistic customer orders
export const INITIAL_ORDERS: CustomerOrder[] = Array.from({ length: 50 }, (_, i) => {
  const orderIndex = i + 1;
  const orderNumber = `ORD-2026-${(1000 + orderIndex).toString()}`;
  const customerName = customerNames[i % customerNames.length];
  const customerTier = customerTiers[i % customerTiers.length];
  
  // Assign product deliberately: first 10 orders connect to disrupted prod-1 & prod-4 (Scenario A & B)
  let productId: string;
  let targetWarehouseId = 'wh-1';
  let priority: OrderPriority = 'Medium';

  if (orderIndex === 1) {
    productId = 'prod-1'; // MCU-9400
    targetWarehouseId = 'wh-1'; // Chicago
    priority = 'High';
  } else if (orderIndex === 2) {
    productId = 'prod-1';
    targetWarehouseId = 'wh-1';
    priority = 'High';
  } else if (orderIndex === 3) {
    productId = 'prod-7'; // FPGA Board
    targetWarehouseId = 'wh-1';
    priority = 'High';
  } else if (orderIndex === 4) {
    productId = 'prod-4'; // Lithium Power Module (Scenario B)
    targetWarehouseId = 'wh-1';
    priority = 'High';
  } else if (orderIndex === 5) {
    productId = 'prod-4';
    targetWarehouseId = 'wh-1';
    priority = 'High';
  } else if (orderIndex <= 10) {
    productId = orderIndex % 2 === 0 ? 'prod-1' : 'prod-4';
    targetWarehouseId = orderIndex % 2 === 0 ? 'wh-1' : 'wh-4';
    priority = orderIndex <= 8 ? 'High' : 'Medium';
  } else {
    const prodNum = (orderIndex % 20) + 1;
    productId = `prod-${prodNum}`;
    targetWarehouseId = `wh-${((orderIndex % 5) + 1)}`;
    priority = orderIndex % 5 === 0 ? 'High' : orderIndex % 2 === 0 ? 'Medium' : 'Low';
  }

  const prod = INITIAL_PRODUCTS.find((p) => p.id === productId) || INITIAL_PRODUCTS[0];
  const quantity = 25 + ((orderIndex * 7) % 180);
  const totalAmount = Math.round(quantity * prod.unitPrice);

  // Delivery deadline relative to late October / early November 2026
  const dayOffset = (orderIndex % 14) + 1;
  const deadlineDate = new Date(2026, 9, 29 + dayOffset);
  const deliveryDeadline = deadlineDate.toISOString().split('T')[0];
  const orderDate = new Date(2026, 9, 15 + (orderIndex % 10)).toISOString().split('T')[0];

  // Specific risk configuration for Scenario A & B
  let delayScore = 0;
  let inventoryScore = 15;
  let supplierRiskScore = 10;
  let customerPriorityScore = priority === 'High' ? 100 : priority === 'Medium' ? 60 : 25;
  let riskReason = 'Nominal fulfillment parameters. On track.';
  let status: CustomerOrder['status'] = 'Pending';

  if (orderIndex <= 5) {
    // Affected by Scenario A (prod-1 / prod-7) or Scenario B (prod-4)
    if (productId === 'prod-1' || productId === 'prod-7') {
      delayScore = 85; // 3+ day port congestion delay
      inventoryScore = 80; // Low stock in Chicago
      supplierRiskScore = 75; // Global Chipsets Corp disrupted
      riskReason = 'Port congestion at Global Chipsets Corp causing 3-day buffer depletion at Chicago Hub.';
      status = 'At Risk';
    } else if (productId === 'prod-4') {
      delayScore = 70;
      inventoryScore = 95; // Extreme shortage at WH-North Chicago
      supplierRiskScore = 55;
      riskReason = 'Warehouse stock deficit at Chicago Central Hub (25 units available vs 325 required).';
      status = 'At Risk';
    }
  } else if (orderIndex % 7 === 0) {
    delayScore = 45;
    inventoryScore = 50;
    supplierRiskScore = 40;
    riskReason = 'Carrier transit congestion approaching delivery deadline.';
    status = 'At Risk';
  } else if (orderIndex % 3 === 0) {
    status = 'Shipped';
  }

  // Calculate official formula:
  // Risk Score = (0.35 × Delay Score) + (0.30 × Inventory Score) + (0.20 × Supplier Risk Score) + (0.15 × Customer Priority Score)
  const riskScore = Math.min(
    100,
    Math.round(
      0.35 * delayScore +
      0.30 * inventoryScore +
      0.20 * supplierRiskScore +
      0.15 * customerPriorityScore
    )
  );

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (riskScore >= 61) riskLevel = 'High';
  else if (riskScore >= 31) riskLevel = 'Medium';

  return {
    id: `ord-${orderIndex}`,
    orderNumber,
    customerName,
    customerTier,
    productId,
    quantity,
    unitPrice: prod.unitPrice,
    totalAmount,
    orderDate,
    deliveryDeadline,
    status,
    priority,
    riskScore,
    riskLevel,
    delayScore,
    inventoryScore,
    supplierRiskScore,
    customerPriorityScore,
    riskReason,
    targetWarehouseId,
    linkedShipmentId: `shp-${orderIndex}`,
  };
});

// 50 Shipments
export const INITIAL_SHIPMENTS: Shipment[] = Array.from({ length: 50 }, (_, i) => {
  const shipmentIndex = i + 1;
  const shipmentNumber = `SHP-2026-${(3000 + shipmentIndex).toString()}`;
  const order = INITIAL_ORDERS[i];
  const prod = INITIAL_PRODUCTS.find((p) => p.id === order.productId) || INITIAL_PRODUCTS[0];
  const supplierId = prod.primarySupplierId;
  const supplier = INITIAL_SUPPLIERS.find((s) => s.id === supplierId) || INITIAL_SUPPLIERS[0];
  const carrierId = INITIAL_CARRIERS[shipmentIndex % INITIAL_CARRIERS.length].id;
  const destinationWarehouseId = order.targetWarehouseId;
  const destWarehouse = INITIAL_WAREHOUSES.find((w) => w.id === destinationWarehouseId) || INITIAL_WAREHOUSES[0];

  let status: Shipment['status'] = 'In Transit';
  let delayDays = 0;
  let isOverdue = false;
  let lastCheckpoint = 'En route via Interstate Corridor';

  if (order.status === 'At Risk') {
    if (supplier.status === 'Disrupted') {
      status = 'Delayed';
      delayDays = 3;
      isOverdue = true;
      lastCheckpoint = 'Held at Port of Kaohsiung Container Berth 4';
    } else {
      status = 'Delayed';
      delayDays = 2;
      isOverdue = true;
      lastCheckpoint = 'Customs Inspection Hold, Terminal 2';
    }
  } else if (shipmentIndex % 6 === 0) {
    status = 'Delivered';
    lastCheckpoint = `Delivered to Dock 4, ${destWarehouse.name}`;
  } else if (shipmentIndex % 5 === 0) {
    status = 'Dispatched';
    lastCheckpoint = `Departed origin facility: ${supplier.location}`;
  } else if (shipmentIndex % 4 === 0) {
    status = 'Processing';
    lastCheckpoint = 'Palletizing & Export Documentation';
  }

  const expDate = new Date(2026, 9, 28 + (shipmentIndex % 10));
  const expectedDelivery = expDate.toISOString().split('T')[0];
  const actualDelivery = status === 'Delivered' ? new Date(2026, 9, 27).toISOString().split('T')[0] : undefined;

  return {
    id: `shp-${shipmentIndex}`,
    shipmentNumber,
    orderId: order.id,
    productId: order.productId,
    supplierId,
    carrierId,
    originLocation: `${supplier.name}, ${supplier.location}`,
    destinationWarehouseId,
    destinationLocation: `${destWarehouse.name}, ${destWarehouse.city}`,
    expectedDelivery,
    actualDelivery,
    status,
    delayDays,
    trackingNumber: `TRK-889-${(50000 + shipmentIndex * 13).toString()}`,
    lastCheckpoint,
    isOverdue,
  };
});

// Pre-built Disruptions (Scenario A and Scenario B)
export const INITIAL_DISRUPTIONS: Disruption[] = [
  {
    id: 'dis-1',
    disruptionNumber: 'DIS-2026-081',
    type: 'Supplier Delay',
    targetType: 'supplier',
    targetId: 'sup-1',
    targetName: 'Global Chipsets Corp (Taiwan)',
    productId: 'prod-1',
    delayDays: 3,
    affectedQuantity: 650,
    severity: 'Critical',
    description: 'Major berth congestion and typhoon aftermath at Port of Kaohsiung holding up outbound semiconductor containers by 3+ days.',
    reportedAt: '2026-10-28 07:15',
    status: 'Active',
    affectedProductIds: ['prod-1', 'prod-7', 'prod-18'],
    affectedWarehouseIds: ['wh-1', 'wh-4'],
    affectedShipmentIds: ['shp-1', 'shp-2', 'shp-3'],
    affectedOrderIds: ['ord-1', 'ord-2', 'ord-3'],
    mitigationPlanId: 'plan-1',
  },
  {
    id: 'dis-2',
    disruptionNumber: 'DIS-2026-082',
    type: 'Inventory Shortage',
    targetType: 'warehouse',
    targetId: 'wh-1',
    targetName: 'Chicago Central Logistics Hub',
    productId: 'prod-4',
    delayDays: 4,
    affectedQuantity: 300,
    severity: 'Major',
    description: 'Chicago Hub experienced sudden spike in surgical robotics and high-capacity battery draw. Available inventory fell to 25 units vs 325 required.',
    reportedAt: '2026-10-29 08:45',
    status: 'Active',
    affectedProductIds: ['prod-4'],
    affectedWarehouseIds: ['wh-1'],
    affectedShipmentIds: ['shp-4', 'shp-5'],
    affectedOrderIds: ['ord-4', 'ord-5'],
    mitigationPlanId: 'plan-2',
  },
];

// Pre-built Recovery Plans
export const INITIAL_RECOVERY_PLANS: RecoveryPlan[] = [
  {
    id: 'plan-1',
    planNumber: 'REC-PLAN-401',
    disruptionId: 'dis-1',
    recoveryType: 'Alternative Supplier',
    recommendedAction: 'Procure 450 units of MCU-9400 from Apex Microelectronics (South Korea) with expedited air freight.',
    reason: 'Global Chipsets Corp facing 3-day port hold. Apex Microelectronics has verified stock of 700 units at 91% reliability score, bridging the delivery gap before customer penalties.',
    affectedOrderIds: ['ord-1', 'ord-2', 'ord-3'],
    requiredQty: 450,
    availableQty: 700,
    estimatedCost: 8200,
    expectedRecoveryDays: 2,
    expectedRiskReductionPercent: 68,
    feasibility: 'High',
    requestedBy: 'Elena Rostova (Logistics Manager)',
    requestedAt: '2026-10-29 09:15',
    status: 'Pending',
    details: {
      alternativeSupplierId: 'sup-3',
      expeditedCarrierId: 'car-2',
    },
  },
  {
    id: 'plan-2',
    planNumber: 'REC-PLAN-402',
    disruptionId: 'dis-2',
    recoveryType: 'Inventory Redistribution',
    recommendedAction: 'Transfer 300 units of Lithium-Ion 48V Power Modules from WH-West (Reno) to WH-North (Chicago Hub) via Vanguard Express.',
    reason: 'WH-West currently has 1,450 available units (excess stock above reorder buffer of 300). Transferring 300 units immediately cures Chicago Hub deficit with zero new manufacturing lead time.',
    affectedOrderIds: ['ord-4', 'ord-5'],
    requiredQty: 300,
    availableQty: 1450,
    estimatedCost: 3450,
    expectedRecoveryDays: 1,
    expectedRiskReductionPercent: 82,
    feasibility: 'High',
    requestedBy: 'Elena Rostova (Logistics Manager)',
    requestedAt: '2026-10-29 10:30',
    status: 'Approved',
    approvedBy: 'David Chen (Procurement Approver)',
    approvedAt: '2026-10-29 11:15',
    details: {
      sourceWarehouseId: 'wh-2',
      targetWarehouseId: 'wh-1',
      expeditedCarrierId: 'car-5',
    },
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'disruption',
    title: 'Critical Supplier Disruption Detected',
    message: 'Global Chipsets Corp (SUP-1001) reported 3-day container delay at Port of Kaohsiung. 3 customer orders at high delivery risk.',
    severity: 'critical',
    timestamp: '15 minutes ago',
    read: false,
    linkToTab: 'disruptions',
  },
  {
    id: 'notif-2',
    type: 'shortage',
    title: 'Severe Stock Deficit at Chicago Hub',
    message: 'Lithium-Ion Power Module (prod-4) in WH-North fell below safety stock (25 avail vs 325 reserved).',
    severity: 'warning',
    timestamp: '42 minutes ago',
    read: false,
    linkToTab: 'inventory',
  },
  {
    id: 'notif-3',
    type: 'approval',
    title: 'Recovery Plan Approved by David Chen',
    message: 'Plan REC-PLAN-402 (Inventory Redistribution Reno → Chicago) approved. Ready for execution dispatch.',
    severity: 'info',
    timestamp: '1 hour ago',
    read: false,
    linkToTab: 'approvals',
  },
  {
    id: 'notif-4',
    type: 'risk',
    title: 'High-Risk Order Alert: Tesla Gigafactory',
    message: 'Order ORD-2026-1001 risk score elevated to 78/100 due to delayed microcontroller shipment.',
    severity: 'critical',
    timestamp: '2 hours ago',
    read: true,
    linkToTab: 'risk',
  },
  {
    id: 'notif-5',
    type: 'executed',
    title: 'Previous Batch Recovery Completed',
    message: 'Stock transfer REC-PLAN-399 completed successfully. 12 orders returned to nominal on-time delivery.',
    severity: 'success',
    timestamp: 'Yesterday at 17:40',
    read: true,
    linkToTab: 'approvals',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2026-10-29 11:15:22',
    action: 'Plan Approved',
    user: 'David Chen',
    role: 'Procurement Approver',
    details: 'Authorized Plan REC-PLAN-402: Transfer 300 units Lithium Power Modules (WH-West → WH-North) with estimated cost $3,450.',
    entityType: 'Plan',
    entityId: 'plan-2',
  },
  {
    id: 'audit-2',
    timestamp: '2026-10-29 10:30:11',
    action: 'Plan Generated',
    user: 'Elena Rostova',
    role: 'Logistics Manager',
    details: 'Generated AI Recovery Plan REC-PLAN-402 for Chicago Hub inventory shortage.',
    entityType: 'Plan',
    entityId: 'plan-2',
  },
  {
    id: 'audit-3',
    timestamp: '2026-10-29 09:15:00',
    action: 'Plan Generated',
    user: 'Elena Rostova',
    role: 'Logistics Manager',
    details: 'Created Plan REC-PLAN-401 for Global Chipsets Corp delay.',
    entityType: 'Plan',
    entityId: 'plan-1',
  },
  {
    id: 'audit-4',
    timestamp: '2026-10-29 08:45:19',
    action: 'Disruption Logged',
    user: 'Marcus Vance',
    role: 'Warehouse Operator',
    details: 'Logged warehouse stock shortage DIS-2026-082 at Chicago Central Hub.',
    entityType: 'Disruption',
    entityId: 'dis-2',
  },
  {
    id: 'audit-5',
    timestamp: '2026-10-28 07:15:44',
    action: 'Disruption Logged',
    user: 'System Sensor Feed',
    role: 'Automated Monitor',
    details: 'Automated port telemetry detected 3-day Kaohsiung container dwell time (DIS-2026-081).',
    entityType: 'Disruption',
    entityId: 'dis-1',
  },
];
