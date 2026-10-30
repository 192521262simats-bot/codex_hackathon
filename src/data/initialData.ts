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
  VehicleDriverTelemetry,
  RouteCheckpoint,
} from '../types';

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'user-1',
    name: 'K. Senthil Kumar',
    email: 'senthil.kumar@rippleguard.in',
    role: 'Logistics Manager',
    title: 'Director of Tamil Nadu Supply Chain Operations',
    department: 'Tamil Nadu Logistics Control Tower (Chennai)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  },
  {
    id: 'user-2',
    name: 'R. Muruganathan',
    email: 'muruganathan.r@rippleguard.in',
    role: 'Warehouse Operator',
    title: 'Lead Hub Supervisor (Chennai Oragadam Hub)',
    department: 'Warehouse Network Operations (Tamil Nadu)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  },
  {
    id: 'user-3',
    name: 'Ananya Raman',
    email: 'ananya.raman@rippleguard.in',
    role: 'Procurement Approver',
    title: 'VP of Strategic Sourcing & Logistics',
    department: 'Procurement & Vendor Alliances (Coimbatore)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    supplierNumber: 'SUP-1001',
    name: 'SIPCOT High-Tech Semiconductors',
    country: 'Tamil Nadu, India',
    location: 'Sriperumbudur Industrial Park, Kanchipuram',
    productsSupplied: ['prod-1', 'prod-7', 'prod-18'],
    reliabilityScore: 78,
    avgDeliveryDays: 3,
    status: 'Disrupted',
    contactEmail: 'logistics@sipcot-semicon.tn.gov.in',
    leadTimeVarianceDays: 3,
    qualityRating: 4.8,
  },
  {
    id: 'sup-2',
    supplierNumber: 'SUP-1002',
    name: 'Tamil Nadu Polymers & Resins Ltd',
    country: 'Tamil Nadu, India',
    location: 'Manali Industrial Zone, Chennai',
    productsSupplied: ['prod-6', 'prod-17', 'prod-20'],
    reliabilityScore: 94,
    avgDeliveryDays: 2,
    status: 'Active',
    contactEmail: 'orders@tnpolymers.co.in',
    leadTimeVarianceDays: 1,
    qualityRating: 4.9,
  },
  {
    id: 'sup-3',
    supplierNumber: 'SUP-1003',
    name: 'Kovai Precision Microelectronics',
    country: 'Tamil Nadu, India',
    location: 'Peelamedu Tech Park, Coimbatore',
    productsSupplied: ['prod-1', 'prod-5', 'prod-19'],
    reliabilityScore: 92,
    avgDeliveryDays: 2,
    status: 'Active',
    contactEmail: 'export@kovaiprecision.in',
    leadTimeVarianceDays: 1,
    qualityRating: 4.7,
  },
  {
    id: 'sup-4',
    supplierNumber: 'SUP-1004',
    name: 'Salem Steel & Alloy Works',
    country: 'Tamil Nadu, India',
    location: 'Salem Steel Plant Zone, Salem',
    productsSupplied: ['prod-3', 'prod-8', 'prod-13'],
    reliabilityScore: 96,
    avgDeliveryDays: 2,
    status: 'Active',
    contactEmail: 'dispatch@salemsteelworks.com',
    leadTimeVarianceDays: 1,
    qualityRating: 4.95,
  },
  {
    id: 'sup-5',
    supplierNumber: 'SUP-1005',
    name: 'Titan Power Systems India',
    country: 'Tamil Nadu, India',
    location: 'Hosur SIPCOT Phase-2, Krishnagiri',
    productsSupplied: ['prod-4', 'prod-11', 'prod-12'],
    reliabilityScore: 82,
    avgDeliveryDays: 2,
    status: 'Active',
    contactEmail: 'support@titanpower.co.in',
    leadTimeVarianceDays: 2,
    qualityRating: 4.85,
  },
  {
    id: 'sup-6',
    supplierNumber: 'SUP-1006',
    name: 'Guindy Electro-Mechanical Components',
    country: 'Tamil Nadu, India',
    location: 'Guindy Industrial Estate, Chennai',
    productsSupplied: ['prod-2', 'prod-7', 'prod-15'],
    reliabilityScore: 89,
    avgDeliveryDays: 1,
    status: 'Active',
    contactEmail: 'sales@guindyelectro.in',
    leadTimeVarianceDays: 1,
    qualityRating: 4.6,
  },
  {
    id: 'sup-7',
    supplierNumber: 'SUP-1007',
    name: 'Tiruchirappalli Heavy Instrumentation',
    country: 'Tamil Nadu, India',
    location: 'BHEL Ancillary Hub, Thuvakudi, Trichy',
    productsSupplied: ['prod-2', 'prod-9', 'prod-16'],
    reliabilityScore: 97,
    avgDeliveryDays: 2,
    status: 'Active',
    contactEmail: 'orders@trichyheavy.in',
    leadTimeVarianceDays: 1,
    qualityRating: 4.98,
  },
  {
    id: 'sup-8',
    supplierNumber: 'SUP-1008',
    name: 'Sivakasi Industrial Packaging Corp',
    country: 'Tamil Nadu, India',
    location: 'Sivakasi Packaging Corridor, Virudhunagar',
    productsSupplied: ['prod-6', 'prod-17'],
    reliabilityScore: 95,
    avgDeliveryDays: 2,
    status: 'Active',
    contactEmail: 'service@sivakasipackaging.in',
    leadTimeVarianceDays: 1,
    qualityRating: 4.75,
  },
  {
    id: 'sup-9',
    supplierNumber: 'SUP-1009',
    name: 'Erode Opto-Sensors & Telematics',
    country: 'Tamil Nadu, India',
    location: 'Perundurai SIPCOT, Erode',
    productsSupplied: ['prod-5', 'prod-15', 'prod-16'],
    reliabilityScore: 93,
    avgDeliveryDays: 2,
    status: 'Active',
    contactEmail: 'shipments@erodeopto.co.in',
    leadTimeVarianceDays: 1,
    qualityRating: 4.9,
  },
  {
    id: 'sup-10',
    supplierNumber: 'SUP-1010',
    name: 'Ranipet Power Storage & Cells',
    country: 'Tamil Nadu, India',
    location: 'Ranipet SIPCOT Industrial Complex, Ranipet',
    productsSupplied: ['prod-4', 'prod-14', 'prod-20'],
    reliabilityScore: 90,
    avgDeliveryDays: 2,
    status: 'Active',
    contactEmail: 'b2b@ranipetpower.in',
    leadTimeVarianceDays: 1,
    qualityRating: 4.8,
  },
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'WH-TN-CHN',
    name: 'Chennai Oragadam Auto & Electronics Hub',
    city: 'Chennai (Oragadam), Tamil Nadu',
    region: 'North Tamil Nadu',
    capacityUnits: 55000,
    currentUtilizationPercent: 88,
    manager: 'R. Muruganathan',
  },
  {
    id: 'wh-2',
    code: 'WH-TN-CBE',
    name: 'Coimbatore Peelamedu Logistics & Textile Park',
    city: 'Coimbatore (Peelamedu), Tamil Nadu',
    region: 'West Tamil Nadu',
    capacityUnits: 65000,
    currentUtilizationPercent: 62,
    manager: 'K. Balakrishnan',
  },
  {
    id: 'wh-3',
    code: 'WH-TN-MDU',
    name: 'Madurai Kappalur Multimodal Cargo Terminal',
    city: 'Madurai (Kappalur), Tamil Nadu',
    region: 'South Tamil Nadu',
    capacityUnits: 50000,
    currentUtilizationPercent: 74,
    manager: 'M. Sivakumar',
  },
  {
    id: 'wh-4',
    code: 'WH-TN-HSR',
    name: 'Hosur SIPCOT Industrial Logistics Depot',
    city: 'Hosur (SIPCOT Phase-1), Tamil Nadu',
    region: 'Northwest Tamil Nadu',
    capacityUnits: 45000,
    currentUtilizationPercent: 81,
    manager: 'P. Anandavalli',
  },
  {
    id: 'wh-5',
    code: 'WH-TN-TCR',
    name: 'Tuticorin VOC Port Inland Container Station',
    city: 'Thoothukudi (Harbour Estate), Tamil Nadu',
    region: 'Coastal South Tamil Nadu',
    capacityUnits: 40000,
    currentUtilizationPercent: 69,
    manager: 'J. Antony Raj',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-1', sku: 'MCU-9400', name: 'Automotive Microcontroller Unit (32-Bit)', category: 'Semiconductors', unitPrice: 1450.0, primarySupplierId: 'sup-1', criticalComponent: true, minLeadTimeDays: 3 },
  { id: 'prod-2', sku: 'SNS-4200', name: 'Multi-Axis Vibration Sensor Array', category: 'Sensors', unitPrice: 890.0, primarySupplierId: 'sup-7', criticalComponent: true, minLeadTimeDays: 2 },
  { id: 'prod-3', sku: 'FST-8100', name: 'High-Tensile Aerospace Fasteners (Grade 8)', category: 'Hardware', unitPrice: 180.0, primarySupplierId: 'sup-4', criticalComponent: false, minLeadTimeDays: 2 },
  { id: 'prod-4', sku: 'BAT-6500', name: 'EV Lithium-Ion 48V Power Module', category: 'Power & Storage', unitPrice: 5200.0, primarySupplierId: 'sup-5', criticalComponent: true, minLeadTimeDays: 3 },
  { id: 'prod-5', sku: 'OPT-3300', name: 'Fiber-Optic Optical Transceiver (10G)', category: 'Networking', unitPrice: 2100.0, primarySupplierId: 'sup-9', criticalComponent: true, minLeadTimeDays: 2 },
  { id: 'prod-6', sku: 'HSG-1100', name: 'IP67 Polycarbonate Sealed Housing', category: 'Enclosures', unitPrice: 420.0, primarySupplierId: 'sup-2', criticalComponent: false, minLeadTimeDays: 2 },
  { id: 'prod-7', sku: 'FPG-7800', name: 'Embedded Automotive FPGA Board', category: 'Semiconductors', unitPrice: 3800.0, primarySupplierId: 'sup-1', criticalComponent: true, minLeadTimeDays: 4 },
  { id: 'prod-8', sku: 'BRG-5500', name: 'Ceramic Precision Wheel Hub Bearing', category: 'Mechanical', unitPrice: 650.0, primarySupplierId: 'sup-4', criticalComponent: false, minLeadTimeDays: 2 },
  { id: 'prod-9', sku: 'ACT-2900', name: 'Electro-Hydraulic Servo Actuator', category: 'Motion Control', unitPrice: 3100.0, primarySupplierId: 'sup-7', criticalComponent: true, minLeadTimeDays: 3 },
  { id: 'prod-10', sku: 'THM-1050', name: 'Industrial Thermal Conductive Paste', category: 'Consumables', unitPrice: 240.0, primarySupplierId: 'sup-2', criticalComponent: false, minLeadTimeDays: 1 },
  { id: 'prod-11', sku: 'RLY-6200', name: 'Heavy-Duty Smart Solid-State Relay', category: 'Electrical', unitPrice: 750.0, primarySupplierId: 'sup-5', criticalComponent: false, minLeadTimeDays: 2 },
  { id: 'prod-12', sku: 'MOT-8800', name: 'Brushless DC High-Torque Drive Motor', category: 'Motion Control', unitPrice: 2850.0, primarySupplierId: 'sup-5', criticalComponent: true, minLeadTimeDays: 3 },
  { id: 'prod-13', sku: 'BUS-4400', name: 'Pure Oxygen-Free Copper Busbar (200A)', category: 'Raw Metals', unitPrice: 550.0, primarySupplierId: 'sup-4', criticalComponent: false, minLeadTimeDays: 2 },
  { id: 'prod-14', sku: 'BRK-9100', name: 'Thermal-Magnetic DC Circuit Breaker', category: 'Electrical', unitPrice: 1150.0, primarySupplierId: 'sup-10', criticalComponent: true, minLeadTimeDays: 2 },
  { id: 'prod-15', sku: 'DSP-3600', name: 'Rugged Touch HMI Operator Screen', category: 'Displays', unitPrice: 4400.0, primarySupplierId: 'sup-6', criticalComponent: true, minLeadTimeDays: 3 },
  { id: 'prod-16', sku: 'ANT-7200', name: 'Wideband NavIC / GPS Telematic Antenna', category: 'Telecommunications', unitPrice: 620.0, primarySupplierId: 'sup-9', criticalComponent: false, minLeadTimeDays: 2 },
  { id: 'prod-17', sku: 'GSK-1900', name: 'Fluoropolymer Engine Gasket Seal', category: 'Enclosures', unitPrice: 145.0, primarySupplierId: 'sup-8', criticalComponent: false, minLeadTimeDays: 1 },
  { id: 'prod-18', sku: 'CAP-5100', name: 'High-Voltage Multi-Layer Capacitor', category: 'Passive Components', unitPrice: 85.0, primarySupplierId: 'sup-1', criticalComponent: false, minLeadTimeDays: 2 },
  { id: 'prod-19', sku: 'GTW-8300', name: 'CAN-Bus Telematics IoT Gateway', category: 'Networking', unitPrice: 4950.0, primarySupplierId: 'sup-3', criticalComponent: true, minLeadTimeDays: 2 },
  { id: 'prod-20', sku: 'REG-2200', name: 'Linear Voltage Regulator (Automotive Grade)', category: 'Semiconductors', unitPrice: 320.0, primarySupplierId: 'sup-10', criticalComponent: false, minLeadTimeDays: 2 },
];

export const INITIAL_CARRIERS: Carrier[] = [
  { id: 'car-1', name: 'Chola Express Logistics', code: 'CEL', transportMode: 'Ground', onTimeRating: 94, status: 'Active', contact: 'ops@cholaexpress.in' },
  { id: 'car-2', name: 'Pandian Freight Lines', code: 'PFL', transportMode: 'Ground', onTimeRating: 91, status: 'Active', contact: 'fleet@pandianfreight.com' },
  { id: 'car-3', name: 'TVS Supply Chain Solutions', code: 'TVS', transportMode: 'Intermodal', onTimeRating: 97, status: 'Active', contact: 'support@tvsscs.com' },
  { id: 'car-4', name: 'Tuticorin Marine & Port Cargo', code: 'TMP', transportMode: 'Ocean', onTimeRating: 84, status: 'Congested', contact: 'vocberth@tuticorinport.gov.in' },
  { id: 'car-5', name: 'ABT Parcel Cargo', code: 'ABT', transportMode: 'Ground', onTimeRating: 96, status: 'Active', contact: 'express@abtparcel.com' },
];

export const computeStockStatus = (available: number, reorder: number): StockStatus => {
  if (available <= 0) return 'Out of Stock';
  if (available < reorder) return 'Low Stock';
  if (available > reorder * 2.5) return 'Excess';
  return 'Optimal';
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', productId: 'prod-4', warehouseId: 'wh-1', availableQty: 25, reservedQty: 300, requiredQty: 325, reorderLevel: 200, stockStatus: 'Low Stock', lastUpdated: '2026-10-28 09:30' },
  { id: 'inv-2', productId: 'prod-4', warehouseId: 'wh-2', availableQty: 1450, reservedQty: 150, requiredQty: 200, reorderLevel: 300, stockStatus: 'Excess', lastUpdated: '2026-10-28 10:15' },
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

// Major Tamil Nadu Enterprise Clients & OEMs
const tamilNaduCustomerNames = [
  'Ashok Leyland Ennore Commercial Fleet (Chennai)',
  'Hyundai Motor India Sriperumbudur Assembly',
  'TVS Motor Company Hosur Plant',
  'Saint-Gobain Glass India (Sriperumbudur)',
  'Royal Enfield Vallam Vadagal Facility (Kanchipuram)',
  'Caterpillar India Tiruvallur Facility',
  'Murugappa TI Clean Mobility (Ambattur)',
  'Apollo Tyres Oragadam Plant (Chennai)',
  'Lucas TVS Padi Complex (Chennai)',
  'Brakes India Sholinghur Hub (Ranipet)',
  'Foxconn India Sriperumbudur Assembly',
  'Tata Electronics Hosur Complex',
  'LMW Textile Machinery Division (Coimbatore)',
  'Sundram Fasteners Padi Complex',
  'Bharat Heavy Electricals (BHEL Trichy)',
  'Renault Nissan Automotive Oragadam Plant',
  'Amara Raja Battery Industrial Unit',
  'MRF Tyres Arakkonam Complex',
  'Roots Industries Group (Coimbatore)',
  'Hatsun Agro Product (Kanchipuram)',
];

const customerTiers: CustomerTier[] = [
  'Critical Healthcare',
  'Aerospace OEM',
  'Tier 1 Enterprise',
  'Standard',
];

export const INITIAL_ORDERS: CustomerOrder[] = Array.from({ length: 50 }, (_, i) => {
  const orderIndex = i + 1;
  const orderNumber = `ORD-TN-2026-${(1000 + orderIndex).toString()}`;
  const customerName = tamilNaduCustomerNames[i % tamilNaduCustomerNames.length];
  const customerTier = customerTiers[i % customerTiers.length];

  let productId: string;
  let targetWarehouseId = 'wh-1';
  let priority: OrderPriority = 'Medium';

  if (orderIndex === 1) {
    productId = 'prod-1'; // MCU-9400
    targetWarehouseId = 'wh-1'; // Chennai Oragadam
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
    productId = 'prod-4'; // EV Battery Module
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

  const dayOffset = (orderIndex % 14) + 1;
  const deadlineDate = new Date(2026, 9, 29 + dayOffset);
  const deliveryDeadline = deadlineDate.toISOString().split('T')[0];
  const orderDate = new Date(2026, 9, 15 + (orderIndex % 10)).toISOString().split('T')[0];

  let delayScore = 0;
  let inventoryScore = 15;
  let supplierRiskScore = 10;
  let customerPriorityScore = priority === 'High' ? 100 : priority === 'Medium' ? 60 : 25;
  let riskReason = 'Nominal fulfillment parameters across Tamil Nadu corridor. On track.';
  let status: CustomerOrder['status'] = 'Pending';

  if (orderIndex <= 5) {
    if (productId === 'prod-1' || productId === 'prod-7') {
      delayScore = 85;
      inventoryScore = 80;
      supplierRiskScore = 75;
      riskReason = 'NH 48 Walajapet Highway waterlogging holding up SIPCOT Sriperumbudur semiconductor convoy to Chennai Oragadam Hub.';
      status = 'At Risk';
    } else if (productId === 'prod-4') {
      delayScore = 70;
      inventoryScore = 95;
      supplierRiskScore = 55;
      riskReason = 'Severe warehouse stock deficit at Chennai Oragadam Auto Hub (25 units available vs 325 reserved).';
      status = 'At Risk';
    }
  } else if (orderIndex % 7 === 0) {
    delayScore = 45;
    inventoryScore = 50;
    supplierRiskScore = 40;
    riskReason = 'NH 44 Thoppur Ghats highway congestion slowing carrier trailer arrival.';
    status = 'At Risk';
  } else if (orderIndex % 3 === 0) {
    status = 'Shipped';
  }

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

// Tamil Nadu Vehicle Fleet & Driver Telematics Factory
const tnVehicleModels = [
  'Ashok Leyland 2820-6x2 Heavy Hauler',
  'Tata Signa 4825.TK 16-Wheeler Carrier',
  'BharatBenz 3528C Heavy Transit Rig',
  'Mahindra Blazo X 42 Multi-Axle Carrier',
  'Eicher Pro 6035 Multimodal Express Rig',
];

const tnDrivers = [
  { name: 'K. Senthil Kumar', license: 'TN-02-2016-0038192', phone: '+91 98401 23456', blood: 'O+', exp: 11 },
  { name: 'R. Murugan', license: 'TN-38-2014-0091823', phone: '+91 94432 87610', blood: 'B+', exp: 14 },
  { name: 'M. Karthikeyan', license: 'TN-59-2017-0044510', phone: '+91 98940 55123', blood: 'A+', exp: 9 },
  { name: 'S. Anbarasan', license: 'TN-70-2018-0012904', phone: '+91 97890 12345', blood: 'AB+', exp: 8 },
  { name: 'P. Saravanan', license: 'TN-45-2015-0078129', phone: '+91 99441 67890', blood: 'O+', exp: 12 },
  { name: 'G. Velmurugan', license: 'TN-69-2013-0051287', phone: '+91 94421 98765', blood: 'B+', exp: 15 },
  { name: 'V. Manikandan', license: 'TN-22-2019-0023419', phone: '+91 98412 34567', blood: 'A-', exp: 7 },
  { name: 'T. Dhanasekaran', license: 'TN-30-2016-0089123', phone: '+91 97500 45678', blood: 'O-', exp: 10 },
];

export const INITIAL_SHIPMENTS: Shipment[] = Array.from({ length: 50 }, (_, i) => {
  const shipmentIndex = i + 1;
  const shipmentNumber = `SHP-TN-2026-${(3000 + shipmentIndex).toString()}`;
  const order = INITIAL_ORDERS[i];
  const prod = INITIAL_PRODUCTS.find((p) => p.id === order.productId) || INITIAL_PRODUCTS[0];
  const supplierId = prod.primarySupplierId;
  const supplier = INITIAL_SUPPLIERS.find((s) => s.id === supplierId) || INITIAL_SUPPLIERS[0];
  const carrierId = INITIAL_CARRIERS[shipmentIndex % INITIAL_CARRIERS.length].id;
  const carrier = INITIAL_CARRIERS.find((c) => c.id === carrierId) || INITIAL_CARRIERS[0];
  const destinationWarehouseId = order.targetWarehouseId;
  const destWarehouse = INITIAL_WAREHOUSES.find((w) => w.id === destinationWarehouseId) || INITIAL_WAREHOUSES[0];

  let status: Shipment['status'] = 'In Transit';
  let delayDays = 0;
  let isOverdue = false;
  let lastCheckpoint = 'En route via NH 48 / NH 544 Tamil Nadu Expressway';

  const driver = tnDrivers[shipmentIndex % tnDrivers.length];
  const vehicleModel = tnVehicleModels[shipmentIndex % tnVehicleModels.length];
  const rtoCodes = ['04', '38', '59', '70', '69', '45', '22', '30'];
  const rtoCode = rtoCodes[shipmentIndex % rtoCodes.length];
  const vehicleReg = `TN-${rtoCode}-${String.fromCharCode(65 + (shipmentIndex % 26))}${String.fromCharCode(66 + (shipmentIndex % 25))}-${(1000 + (shipmentIndex * 137) % 8999)}`;

  let progressPercent = 35 + ((shipmentIndex * 17) % 55);
  let speedKmph = 58;
  let currentLocationName = 'NH 48 Walajapet Toll Plaza, Ranipet District';
  let currentLat = 12.9238;
  let currentLng = 79.3241;

  if (order.status === 'At Risk') {
    if (supplier.status === 'Disrupted') {
      status = 'Delayed';
      delayDays = 3;
      isOverdue = true;
      lastCheckpoint = 'Walajapet Highway Inundation Blockade, NH 48 (Ranipet)';
      progressPercent = 42;
      speedKmph = 0;
      currentLocationName = 'NH 48 Km 114 Walajapet Bypass (Waterlogging / Traffic Bottleneck)';
      currentLat = 12.9351;
      currentLng = 79.3512;
    } else {
      status = 'Delayed';
      delayDays = 2;
      isOverdue = true;
      lastCheckpoint = 'NH 44 Thoppur Toll Plaza Hold, Dharmapuri';
      progressPercent = 55;
      speedKmph = 18;
      currentLocationName = 'NH 44 Thoppur Ghat Checkpoint, Dharmapuri';
      currentLat = 12.0167;
      currentLng = 78.1167;
    }
  } else if (shipmentIndex % 6 === 0) {
    status = 'Delivered';
    lastCheckpoint = `Unloaded & Inwarded at Dock 3, ${destWarehouse.name}`;
    progressPercent = 100;
    speedKmph = 0;
    currentLocationName = `${destWarehouse.name}, ${destWarehouse.city}`;
  } else if (shipmentIndex % 5 === 0) {
    status = 'Dispatched';
    lastCheckpoint = `Departed dispatch yard: ${supplier.name}, ${supplier.location}`;
    progressPercent = 15;
    speedKmph = 45;
    currentLocationName = `SIPCOT Industrial Expressway Entrance, Sriperumbudur`;
  } else if (shipmentIndex % 4 === 0) {
    status = 'Processing';
    lastCheckpoint = 'Cargo Palletizing & E-Way Bill Verification';
    progressPercent = 5;
    speedKmph = 0;
    currentLocationName = `Consignor Loading Dock: ${supplier.name}`;
  }

  const expDate = new Date(2026, 9, 28 + (shipmentIndex % 10));
  const expectedDelivery = expDate.toISOString().split('T')[0];
  const actualDelivery = status === 'Delivered' ? new Date(2026, 9, 27).toISOString().split('T')[0] : undefined;

  // Realistic Route Checkpoints across Tamil Nadu Highway Corridor
  const checkpoints: RouteCheckpoint[] = [
    {
      id: `chk-1-${shipmentIndex}`,
      name: 'Origin Dispatch Bay',
      location: supplier.location,
      highway: 'State Highway / SIPCOT Access',
      plannedTime: '06:00 AM',
      actualTime: '06:15 AM',
      status: 'completed',
      tollPlazaOrDepot: 'Supplier Logistics Yard',
      distanceKm: 0,
    },
    {
      id: `chk-2-${shipmentIndex}`,
      name: 'Sriperumbudur Toll Plaza',
      location: 'Sriperumbudur Outer, NH 48',
      highway: 'NH 48 (Chennai - Bengaluru Corridor)',
      plannedTime: '07:45 AM',
      actualTime: '07:50 AM',
      status: 'completed',
      tollPlazaOrDepot: 'NHAI FASTag Toll Plaza 1',
      distanceKm: 38,
    },
    {
      id: `chk-3-${shipmentIndex}`,
      name: 'Walajapet Toll Plaza',
      location: 'Ranipet District, NH 48',
      highway: 'NH 48 Express Highway',
      plannedTime: '09:30 AM',
      actualTime: status === 'Delayed' ? '12:45 PM (Held)' : '09:40 AM',
      status: status === 'Delayed' ? 'in_progress' : progressPercent >= 45 ? 'completed' : 'upcoming',
      tollPlazaOrDepot: 'NHAI FASTag Toll Plaza 2',
      distanceKm: 104,
    },
    {
      id: `chk-4-${shipmentIndex}`,
      name: 'Krishnagiri / Salem Junction Toll',
      location: 'Krishnagiri Interchange, NH 44',
      highway: 'NH 44 North-South Corridor',
      plannedTime: '01:30 PM',
      actualTime: progressPercent >= 70 ? '01:45 PM' : undefined,
      status: progressPercent >= 70 ? 'completed' : progressPercent >= 50 ? 'in_progress' : 'upcoming',
      tollPlazaOrDepot: 'Krishnagiri Transit Station',
      distanceKm: 245,
    },
    {
      id: `chk-5-${shipmentIndex}`,
      name: 'Destination Intake Hub',
      location: destWarehouse.city,
      highway: 'Inland Logistics Link',
      plannedTime: '06:00 PM',
      actualTime: status === 'Delivered' ? '05:30 PM' : undefined,
      status: status === 'Delivered' ? 'completed' : 'upcoming',
      tollPlazaOrDepot: `${destWarehouse.name} Dock`,
      distanceKm: 420,
    },
  ];

  const telemetry: VehicleDriverTelemetry = {
    vehicleNumber: vehicleReg,
    vehicleType: vehicleModel,
    vehicleModelYear: 2023,
    transporterName: carrier.name,
    gpsDeviceId: `GPS-TN-${7000 + shipmentIndex}`,
    speedKmph: status === 'Delivered' ? 0 : speedKmph,
    fuelPercent: 82 - ((shipmentIndex * 7) % 35),
    engineTempCelsius: 82 + (shipmentIndex % 6),
    batteryVoltage: 24.3,
    odometerKm: 124500 + shipmentIndex * 312,
    gpsStatus: 'Active NavIC/GPS',
    lastPingTime: '2 mins ago (Live AIS 140 Telematics)',
    driverName: driver.name,
    driverLicense: driver.license,
    driverPhone: driver.phone,
    driverExperienceYears: driver.exp,
    driverBloodGroup: driver.blood,
    dutyHoursToday: 4.2,
    safetyScore: 97 - (shipmentIndex % 5),
    originHub: `${supplier.name} (${supplier.location.split(',')[0]})`,
    destinationHub: `${destWarehouse.name} (${destWarehouse.city.split(',')[0]})`,
    highwayCorridor: 'NH 48 & NH 544 Golden Quadrilateral Tamil Nadu Spur',
    totalDistanceKm: 420,
    coveredDistanceKm: Math.round(420 * (progressPercent / 100)),
    progressPercent,
    currentLat,
    currentLng,
    currentLocationName,
    checkpoints,
    disruptionAlert: status === 'Delayed' ? {
      active: true,
      location: 'NH 48 Walajapet Highway Section (Ranipet)',
      issue: 'Waterlogging & Tanker breakdown causing heavy freight stall (+3.5h delay)',
      delayHours: 3.5,
      suggestedDetour: 'Divert via SH-116 Arcot-Cheyyar-Polur corridor to rejoin NH 44 at Tiruvannamalai.',
    } : undefined,
  };

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
    trackingNumber: `TRK-TN-${(50000 + shipmentIndex * 19).toString()}`,
    lastCheckpoint,
    isOverdue,
    telemetry,
  };
});

export const INITIAL_DISRUPTIONS: Disruption[] = [
  {
    id: 'dis-1',
    disruptionNumber: 'DIS-TN-2026-081',
    type: 'Supplier Delay',
    targetType: 'supplier',
    targetId: 'sup-1',
    targetName: 'SIPCOT High-Tech Semiconductors (Sriperumbudur)',
    productId: 'prod-1',
    delayDays: 3,
    affectedQuantity: 650,
    severity: 'Critical',
    description: 'NH 48 Walajapet-Kanchipuram highway corridor inundation and chemical tanker overturn blocking outbound multi-axle freight trailers carrying automotive microcontrollers to Coimbatore and Madurai.',
    reportedAt: '2026-10-28 07:15',
    status: 'Active',
    affectedProductIds: ['prod-1', 'prod-7', 'prod-18'],
    affectedWarehouseIds: ['wh-1', 'wh-2'],
    affectedShipmentIds: ['shp-1', 'shp-2', 'shp-3'],
    affectedOrderIds: ['ord-1', 'ord-2', 'ord-3'],
    mitigationPlanId: 'plan-1',
  },
  {
    id: 'dis-2',
    disruptionNumber: 'DIS-TN-2026-082',
    type: 'Inventory Shortage',
    targetType: 'warehouse',
    targetId: 'wh-1',
    targetName: 'Chennai Oragadam Auto & Electronics Hub',
    productId: 'prod-4',
    delayDays: 4,
    affectedQuantity: 300,
    severity: 'Major',
    description: 'Chennai Oragadam Auto Hub experienced surge demand from Hyundai Motor & Royal Enfield EV assembly lines. Available inventory fell to 25 units vs 325 required.',
    reportedAt: '2026-10-29 08:45',
    status: 'Active',
    affectedProductIds: ['prod-4'],
    affectedWarehouseIds: ['wh-1'],
    affectedShipmentIds: ['shp-4', 'shp-5'],
    affectedOrderIds: ['ord-4', 'ord-5'],
    mitigationPlanId: 'plan-2',
  },
];

export const INITIAL_RECOVERY_PLANS: RecoveryPlan[] = [
  {
    id: 'plan-1',
    planNumber: 'REC-TN-401',
    disruptionId: 'dis-1',
    recoveryType: 'Alternative Supplier',
    recommendedAction: 'Procure 450 units of MCU-9400 from Kovai Precision Microelectronics (Coimbatore) with expedited transport via Pandian Freight Lines.',
    reason: 'SIPCOT Sriperumbudur facing 3-day NH 48 highway blockage. Kovai Precision Microelectronics has verified stock of 700 units at 92% reliability score, bridging delivery before assembly downtime penalties.',
    affectedOrderIds: ['ord-1', 'ord-2', 'ord-3'],
    requiredQty: 450,
    availableQty: 700,
    estimatedCost: 185000, // INR ₹1,85,000
    expectedRecoveryDays: 1,
    expectedRiskReductionPercent: 78,
    feasibility: 'High',
    requestedBy: 'K. Senthil Kumar (Logistics Manager)',
    requestedAt: '2026-10-29 09:15',
    status: 'Pending',
    details: {
      alternativeSupplierId: 'sup-3',
      expeditedCarrierId: 'car-2',
    },
  },
  {
    id: 'plan-2',
    planNumber: 'REC-TN-402',
    disruptionId: 'dis-2',
    recoveryType: 'Inventory Redistribution',
    recommendedAction: 'Inter-warehouse transfer of 300 units of EV Lithium-Ion 48V Power Modules from Coimbatore Peelamedu Hub (wh-2) to Chennai Oragadam Hub (wh-1) via ABT Parcel Cargo Express.',
    reason: 'Coimbatore Peelamedu Hub has 1,450 units excess stock above its 300-unit safety buffer. Transfer via NH 544 & NH 48 overnight haul cures Chennai Hub deficit with zero new supplier manufacturing lead time.',
    affectedOrderIds: ['ord-4', 'ord-5'],
    requiredQty: 300,
    availableQty: 1450,
    estimatedCost: 85000, // INR ₹85,000
    expectedRecoveryDays: 1,
    expectedRiskReductionPercent: 86,
    feasibility: 'High',
    requestedBy: 'K. Senthil Kumar (Logistics Manager)',
    requestedAt: '2026-10-29 10:30',
    status: 'Approved',
    approvedBy: 'Ananya Raman (VP Procurement)',
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
    title: 'Critical Corridor Disruption: NH 48 Ranipet Segment',
    message: 'SIPCOT High-Tech Semiconductors (Sriperumbudur) outbound freight halted at Walajapet bypass. 3 OEM orders at high delivery risk.',
    severity: 'critical',
    timestamp: '15 minutes ago',
    read: false,
    linkToTab: 'disruptions',
  },
  {
    id: 'notif-2',
    type: 'shortage',
    title: 'Severe EV Battery Deficit at Chennai Oragadam Hub',
    message: 'EV Lithium-Ion Power Module (prod-4) in WH-TN-CHN fell below buffer (25 avail vs 325 reserved for Ashok Leyland / Hyundai).',
    severity: 'warning',
    timestamp: '42 minutes ago',
    read: false,
    linkToTab: 'inventory',
  },
  {
    id: 'notif-3',
    type: 'approval',
    title: 'Recovery Plan Approved by Ananya Raman',
    message: 'Plan REC-TN-402 (Coimbatore → Chennai Oragadam transfer via ABT Parcel Cargo) authorized. Ready for gate dispatch.',
    severity: 'info',
    timestamp: '1 hour ago',
    read: false,
    linkToTab: 'approvals',
  },
  {
    id: 'notif-4',
    type: 'risk',
    title: 'High-Risk Order Alert: Ashok Leyland Ennore Fleet',
    message: 'Order ORD-TN-2026-1001 delivery risk elevated to 78/100 due to delayed NH 48 microcontroller trailer.',
    severity: 'critical',
    timestamp: '2 hours ago',
    read: true,
    linkToTab: 'risk',
  },
  {
    id: 'notif-5',
    type: 'executed',
    title: 'Madurai Kappalur Hub Transfer Executed',
    message: 'Stock transfer REC-TN-399 completed. 14 Tamil Nadu customer orders restored to nominal delivery schedule.',
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
    user: 'Ananya Raman',
    role: 'Procurement Approver',
    details: 'Authorized Plan REC-TN-402: Transfer 300 units EV Lithium Power Modules (Coimbatore Hub → Chennai Oragadam Hub) via ABT Parcel Cargo.',
    entityType: 'Plan',
    entityId: 'plan-2',
  },
  {
    id: 'audit-2',
    timestamp: '2026-10-29 10:30:11',
    action: 'Plan Generated',
    user: 'K. Senthil Kumar',
    role: 'Logistics Manager',
    details: 'Generated AI Recovery Plan REC-TN-402 for Chennai Oragadam inventory deficit.',
    entityType: 'Plan',
    entityId: 'plan-2',
  },
  {
    id: 'audit-3',
    timestamp: '2026-10-29 09:15:00',
    action: 'Plan Generated',
    user: 'K. Senthil Kumar',
    role: 'Logistics Manager',
    details: 'Created Plan REC-TN-401 for SIPCOT Sriperumbudur NH 48 highway bottleneck.',
    entityType: 'Plan',
    entityId: 'plan-1',
  },
  {
    id: 'audit-4',
    timestamp: '2026-10-29 08:45:19',
    action: 'Disruption Logged',
    user: 'R. Muruganathan',
    role: 'Warehouse Operator',
    details: 'Logged warehouse stock shortage DIS-TN-2026-082 at Chennai Oragadam Hub.',
    entityType: 'Disruption',
    entityId: 'dis-2',
  },
  {
    id: 'audit-5',
    timestamp: '2026-10-28 07:15:44',
    action: 'Disruption Logged',
    user: 'AIS-140 GPS Sensor Feed',
    role: 'Automated Monitor',
    details: 'Automated highway telematics detected 3.5h standstill on NH 48 Walajapet corridor (DIS-TN-2026-081).',
    entityType: 'Disruption',
    entityId: 'dis-1',
  },
];
