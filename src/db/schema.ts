import { pgTable, text, integer, numeric, boolean, timestamp, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('Logistics Manager'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey(),
  supplierNumber: text('supplier_number').notNull(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  location: text('location').notNull(),
  productsSupplied: text('products_supplied').notNull(), // JSON string array
  reliabilityScore: integer('reliability_score').notNull(),
  avgDeliveryDays: integer('avg_delivery_days').notNull(),
  status: text('status').notNull(),
  contactEmail: text('contact_email'),
  leadTimeVarianceDays: integer('lead_time_variance_days').default(1),
  qualityRating: numeric('quality_rating').default('4.8'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const warehouses = pgTable('warehouses', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  region: text('region').notNull(),
  capacityUnits: integer('capacity_units').notNull(),
  currentUtilizationPercent: integer('current_utilization_percent').notNull(),
  manager: text('manager'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  sku: text('sku').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  primarySupplierId: text('primary_supplier_id'),
  criticalComponent: boolean('critical_component').default(false),
  minLeadTimeDays: integer('min_lead_time_days').default(7),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inventory = pgTable('inventory', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  warehouseId: text('warehouse_id').notNull(),
  availableQty: integer('available_qty').notNull(),
  reservedQty: integer('reserved_qty').default(0).notNull(),
  requiredQty: integer('required_qty').default(0).notNull(),
  reorderLevel: integer('reorder_level').notNull(),
  stockStatus: text('stock_status').notNull(),
  lastUpdated: text('last_updated'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const carriers = pgTable('carriers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  transportMode: text('transport_mode').notNull(),
  onTimeRating: integer('on_time_rating').notNull(),
  status: text('status').notNull(),
  contact: text('contact'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shipments = pgTable('shipments', {
  id: text('id').primaryKey(),
  shipmentNumber: text('shipment_number').notNull(),
  orderId: text('order_id').notNull(),
  productId: text('product_id').notNull(),
  supplierId: text('supplier_id').notNull(),
  carrierId: text('carrier_id').notNull(),
  originLocation: text('origin_location').notNull(),
  destinationWarehouseId: text('destination_warehouse_id').notNull(),
  destinationLocation: text('destination_location').notNull(),
  expectedDelivery: text('expected_delivery').notNull(),
  actualDelivery: text('actual_delivery'),
  status: text('status').notNull(),
  delayDays: integer('delay_days').default(0).notNull(),
  trackingNumber: text('tracking_number').notNull(),
  lastCheckpoint: text('last_checkpoint'),
  isOverdue: boolean('is_overdue').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull(),
  customerName: text('customer_name').notNull(),
  customerTier: text('customer_tier').notNull(),
  productId: text('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price').notNull(),
  totalAmount: numeric('total_amount').notNull(),
  orderDate: text('order_date').notNull(),
  deliveryDeadline: text('delivery_deadline').notNull(),
  status: text('status').notNull(),
  priority: text('priority').notNull(),
  riskScore: integer('risk_score').notNull(),
  riskLevel: text('risk_level').notNull(),
  delayScore: integer('delay_score').default(0).notNull(),
  inventoryScore: integer('inventory_score').default(0).notNull(),
  supplierRiskScore: integer('supplier_risk_score').default(0).notNull(),
  customerPriorityScore: integer('customer_priority_score').default(50).notNull(),
  riskReason: text('risk_reason'),
  linkedShipmentId: text('linked_shipment_id'),
  targetWarehouseId: text('target_warehouse_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const disruptions = pgTable('disruptions', {
  id: text('id').primaryKey(),
  disruptionNumber: text('disruption_number').notNull(),
  type: text('type').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  targetName: text('target_name').notNull(),
  productId: text('product_id'),
  delayDays: integer('delay_days').notNull(),
  affectedQuantity: integer('affected_quantity').notNull(),
  severity: text('severity').notNull(),
  description: text('description').notNull(),
  reportedAt: text('reported_at').notNull(),
  status: text('status').notNull(),
  affectedProductIds: text('affected_product_ids').default('[]').notNull(),
  affectedWarehouseIds: text('affected_warehouse_ids').default('[]').notNull(),
  affectedShipmentIds: text('affected_shipment_ids').default('[]').notNull(),
  affectedOrderIds: text('affected_order_ids').default('[]').notNull(),
  mitigationPlanId: text('mitigation_plan_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const recoveryPlans = pgTable('recovery_plans', {
  id: text('id').primaryKey(),
  planNumber: text('plan_number').notNull(),
  disruptionId: text('disruption_id').notNull(),
  recoveryType: text('recovery_type').notNull(),
  recommendedAction: text('recommended_action').notNull(),
  reason: text('reason').notNull(),
  affectedOrderIds: text('affected_order_ids').default('[]').notNull(),
  requiredQty: integer('required_qty').notNull(),
  availableQty: integer('available_qty').notNull(),
  estimatedCost: integer('estimated_cost').notNull(),
  expectedRecoveryDays: integer('expected_recovery_days').notNull(),
  expectedRiskReductionPercent: integer('expected_risk_reduction_percent').notNull(),
  feasibility: text('feasibility').notNull(),
  requestedBy: text('requested_by').notNull(),
  requestedAt: text('requested_at').notNull(),
  status: text('status').notNull(),
  approvedBy: text('approved_by'),
  approvedAt: text('approved_at'),
  executionNotes: text('execution_notes'),
  details: text('details').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  action: text('action').notNull(),
  user: text('user').notNull(),
  role: text('role').notNull(),
  details: text('details').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
