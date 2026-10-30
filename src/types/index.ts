/**
 * Core Domain Models for RippleGuard AI
 * "One Disruption. All Orders Protected."
 */

export type UserRole = 'Logistics Manager' | 'Warehouse Operator' | 'Procurement Approver';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatar: string;
}

export type DisruptionSeverity = 'Critical' | 'Major' | 'Moderate';
export type DisruptionType =
  | 'Supplier Delay'
  | 'Inventory Shortage'
  | 'Carrier Disruption'
  | 'Port Congestion'
  | 'Quality Hold';

export type DisruptionStatus = 'Active' | 'Mitigated' | 'Resolved';

export interface Disruption {
  id: string;
  disruptionNumber: string;
  type: DisruptionType;
  targetType: 'supplier' | 'warehouse' | 'carrier';
  targetId: string;
  targetName: string;
  productId?: string;
  delayDays: number;
  affectedQuantity: number;
  severity: DisruptionSeverity;
  description: string;
  reportedAt: string;
  status: DisruptionStatus;
  affectedProductIds: string[];
  affectedWarehouseIds: string[];
  affectedShipmentIds: string[];
  affectedOrderIds: string[];
  mitigationPlanId?: string;
}

export type SupplierStatus = 'Active' | 'Disrupted' | 'Under Review';

export interface Supplier {
  id: string;
  supplierNumber: string;
  name: string;
  country: string;
  location: string;
  productsSupplied: string[]; // product IDs
  reliabilityScore: number; // 0 - 100
  avgDeliveryDays: number;
  status: SupplierStatus;
  contactEmail: string;
  leadTimeVarianceDays: number;
  qualityRating: number; // e.g. 4.8 / 5
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  city: string;
  region: string;
  capacityUnits: number;
  currentUtilizationPercent: number;
  manager: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  primarySupplierId: string;
  criticalComponent: boolean;
  minLeadTimeDays: number;
}

export type StockStatus = 'Optimal' | 'Low Stock' | 'Out of Stock' | 'Excess';

export interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  availableQty: number;
  reservedQty: number;
  requiredQty: number;
  reorderLevel: number;
  stockStatus: StockStatus;
  lastUpdated: string;
}

export type CarrierTransportMode = 'Air' | 'Ground' | 'Intermodal' | 'Ocean';

export interface Carrier {
  id: string;
  name: string;
  code: string;
  transportMode: CarrierTransportMode;
  onTimeRating: number; // 0 - 100%
  status: 'Active' | 'Congested' | 'Suspended';
  contact: string;
}

export type ShipmentStatus =
  | 'Processing'
  | 'Dispatched'
  | 'In Transit'
  | 'Delayed'
  | 'Delivered'
  | 'Cancelled';

export interface RouteCheckpoint {
  id: string;
  name: string;
  location: string;
  highway?: string;
  plannedTime: string;
  actualTime?: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'pending';
  tollPlazaOrDepot: string;
  distanceKm?: number;
  lat?: number;
  lng?: number;
}

export interface VehicleDriverTelemetry {
  vehicleNumber: string; // e.g. "TN-04-BJ-8821"
  vehicleType: string; // e.g. "Ashok Leyland 2820-6x2 Multi-Axle Hauler"
  vehicleModelYear: number;
  transporterName: string; // e.g. "TVS Supply Chain Logistics"
  gpsDeviceId: string;
  speedKmph: number;
  fuelPercent: number;
  engineTempCelsius: number;
  batteryVoltage: number;
  odometerKm: number;
  gpsStatus: 'Active NavIC/GPS' | 'Warning' | 'Offline';
  lastPingTime: string;
  
  // Driver details
  driverName: string; // e.g. "K. Senthil Kumar"
  driverLicense: string; // e.g. "TN-02-2016-0038192"
  driverPhone: string; // e.g. "+91 98401 23456"
  driverExperienceYears: number;
  driverBloodGroup: string;
  dutyHoursToday: number;
  safetyScore: number; // 0 - 100
  
  // Route & Highway details
  originHub: string;
  destinationHub: string;
  highwayCorridor: string; // e.g. "NH 48 & NH 544 Express Corridor"
  totalDistanceKm: number;
  coveredDistanceKm: number;
  progressPercent: number;
  currentLat: number;
  currentLng: number;
  currentLocationName: string;
  checkpoints: RouteCheckpoint[];
  disruptionAlert?: {
    active: boolean;
    location: string;
    issue: string;
    delayHours: number;
    suggestedDetour: string;
  };
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  orderId: string;
  productId: string;
  supplierId: string;
  carrierId: string;
  originLocation: string;
  destinationWarehouseId: string;
  destinationLocation: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: ShipmentStatus;
  delayDays: number;
  trackingNumber: string;
  lastCheckpoint: string;
  isOverdue: boolean;
  telemetry?: VehicleDriverTelemetry;
}

export type OrderPriority = 'High' | 'Medium' | 'Low';
export type OrderStatus = 'Pending' | 'Shipped' | 'At Risk' | 'Recovered' | 'Delivered';
export type CustomerTier = 'Tier 1 Enterprise' | 'Standard' | 'Critical Healthcare' | 'Aerospace OEM';

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerTier: CustomerTier;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  orderDate: string;
  deliveryDeadline: string;
  status: OrderStatus;
  priority: OrderPriority;
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Medium' | 'High';
  delayScore: number;
  inventoryScore: number;
  supplierRiskScore: number;
  customerPriorityScore: number;
  riskReason: string;
  linkedShipmentId?: string;
  targetWarehouseId: string;
}

export type RecoveryType =
  | 'Inventory Redistribution'
  | 'Alternative Supplier'
  | 'Expedited Delivery'
  | 'Partial Order Splitting';

export type PlanStatus = 'Pending' | 'Approved' | 'Rejected' | 'Executed';

export interface RecoveryPlan {
  id: string;
  planNumber: string;
  disruptionId: string;
  recoveryType: RecoveryType;
  recommendedAction: string;
  reason: string;
  affectedOrderIds: string[];
  requiredQty: number;
  availableQty: number;
  estimatedCost: number;
  expectedRecoveryDays: number;
  expectedRiskReductionPercent: number;
  feasibility: 'High' | 'Medium' | 'Low';
  requestedBy: string;
  requestedAt: string;
  status: PlanStatus;
  approvedBy?: string;
  approvedAt?: string;
  executionNotes?: string;
  details: {
    sourceWarehouseId?: string;
    targetWarehouseId?: string;
    alternativeSupplierId?: string;
    expeditedCarrierId?: string;
    splitFirstBatchQty?: number;
  };
}

export interface NotificationItem {
  id: string;
  type: 'disruption' | 'shortage' | 'risk' | 'approval' | 'executed' | 'info';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  linkToTab?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  role: string;
  details: string;
  entityType: 'Disruption' | 'Plan' | 'Shipment' | 'Inventory' | 'Order';
  entityId: string;
}

export interface DataProvenance {
  sourceType: 'Demonstration Dataset' | 'Imported Dataset' | 'Connected Operational Source' | 'Empty Clean Workspace';
  lastImportedAt?: string;
  recordCount: number;
  sourceFile?: string;
}
