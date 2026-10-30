import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/db/index.ts';
import {
  users,
  suppliers,
  warehouses,
  products,
  inventory,
  carriers,
  shipments,
  orders,
  disruptions,
  recoveryPlans,
  auditLogs,
} from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Suppliers API
app.get('/api/suppliers', async (req, res) => {
  try {
    const list = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
    res.json(list.map(s => ({
      ...s,
      productsSupplied: typeof s.productsSupplied === 'string' ? JSON.parse(s.productsSupplied || '[]') : s.productsSupplied,
      qualityRating: Number(s.qualityRating) || 4.8,
    })));
  } catch (err: any) {
    console.error('Failed to get suppliers:', err);
    res.status(500).json({ error: 'Failed to fetch suppliers from database' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(suppliers).values({
      id: data.id || `sup-${Date.now()}`,
      supplierNumber: data.supplierNumber || `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name,
      country: data.country || 'Global',
      location: data.location || 'Distribution Depot',
      productsSupplied: JSON.stringify(data.productsSupplied || []),
      reliabilityScore: Number(data.reliabilityScore) || 90,
      avgDeliveryDays: Number(data.avgDeliveryDays) || 7,
      status: data.status || 'Active',
      contactEmail: data.contactEmail || '',
      leadTimeVarianceDays: Number(data.leadTimeVarianceDays) || 1,
      qualityRating: String(data.qualityRating || '4.8'),
    }).onConflictDoUpdate({
      target: suppliers.id,
      set: {
        name: data.name,
        country: data.country,
        location: data.location,
        productsSupplied: JSON.stringify(data.productsSupplied || []),
        reliabilityScore: Number(data.reliabilityScore) || 90,
        avgDeliveryDays: Number(data.avgDeliveryDays) || 7,
        status: data.status,
      },
    }).returning();
    res.json(inserted[0]);
  } catch (err: any) {
    console.error('Failed to save supplier:', err);
    res.status(500).json({ error: 'Failed to save supplier to database' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await db.delete(suppliers).where(eq(suppliers.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// Warehouses API
app.get('/api/warehouses', async (req, res) => {
  try {
    const list = await db.select().from(warehouses);
    res.json(list);
  } catch (err: any) {
    console.error('Failed to get warehouses:', err);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

app.post('/api/warehouses', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(warehouses).values({
      id: data.id || `wh-${Date.now()}`,
      code: data.code || `WH-${Date.now().toString().slice(-4)}`,
      name: data.name,
      city: data.city || 'Hub City',
      region: data.region || 'Region',
      capacityUnits: Number(data.capacityUnits) || 50000,
      currentUtilizationPercent: Number(data.currentUtilizationPercent) || 70,
      manager: data.manager || 'Site Director',
    }).onConflictDoUpdate({
      target: warehouses.id,
      set: {
        name: data.name,
        city: data.city,
        capacityUnits: Number(data.capacityUnits) || 50000,
        currentUtilizationPercent: Number(data.currentUtilizationPercent) || 70,
      },
    }).returning();
    res.json(inserted[0]);
  } catch (err: any) {
    console.error('Failed to save warehouse:', err);
    res.status(500).json({ error: 'Failed to save warehouse' });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const list = await db.select().from(products);
    res.json(list.map(p => ({
      ...p,
      unitPrice: Number(p.unitPrice),
    })));
  } catch (err: any) {
    console.error('Failed to get products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(products).values({
      id: data.id || `prod-${Date.now()}`,
      sku: data.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: data.name,
      category: data.category || 'General Cargo',
      unitPrice: String(data.unitPrice || '100'),
      primarySupplierId: data.primarySupplierId || null,
      criticalComponent: Boolean(data.criticalComponent),
      minLeadTimeDays: Number(data.minLeadTimeDays) || 7,
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        name: data.name,
        sku: data.sku,
        unitPrice: String(data.unitPrice || '100'),
        category: data.category,
      },
    }).returning();
    res.json(inserted[0]);
  } catch (err: any) {
    console.error('Failed to save product:', err);
    res.status(500).json({ error: 'Failed to save product' });
  }
});

// Inventory API
app.get('/api/inventory', async (req, res) => {
  try {
    const list = await db.select().from(inventory);
    res.json(list);
  } catch (err: any) {
    console.error('Failed to get inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(inventory).values({
      id: data.id || `inv-${Date.now()}`,
      productId: data.productId,
      warehouseId: data.warehouseId,
      availableQty: Number(data.availableQty) || 0,
      reservedQty: Number(data.reservedQty) || 0,
      requiredQty: Number(data.requiredQty) || 0,
      reorderLevel: Number(data.reorderLevel) || 100,
      stockStatus: data.stockStatus || 'Optimal',
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    }).onConflictDoUpdate({
      target: inventory.id,
      set: {
        availableQty: Number(data.availableQty) || 0,
        reservedQty: Number(data.reservedQty) || 0,
        requiredQty: Number(data.requiredQty) || 0,
        stockStatus: data.stockStatus || 'Optimal',
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
    }).returning();
    res.json(inserted[0]);
  } catch (err: any) {
    console.error('Failed to save inventory:', err);
    res.status(500).json({ error: 'Failed to save inventory' });
  }
});

// Carriers API
app.get('/api/carriers', async (req, res) => {
  try {
    const list = await db.select().from(carriers);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch carriers' });
  }
});

// Shipments API
app.get('/api/shipments', async (req, res) => {
  try {
    const list = await db.select().from(shipments).orderBy(desc(shipments.createdAt));
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

app.post('/api/shipments', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(shipments).values({
      id: data.id || `shp-${Date.now()}`,
      shipmentNumber: data.shipmentNumber || `SHP-${Date.now().toString().slice(-4)}`,
      orderId: data.orderId || 'ord-1',
      productId: data.productId,
      supplierId: data.supplierId,
      carrierId: data.carrierId,
      originLocation: data.originLocation,
      destinationWarehouseId: data.destinationWarehouseId,
      destinationLocation: data.destinationLocation,
      expectedDelivery: data.expectedDelivery,
      actualDelivery: data.actualDelivery || null,
      status: data.status || 'In Transit',
      delayDays: Number(data.delayDays) || 0,
      trackingNumber: data.trackingNumber || `TRK-${Date.now()}`,
      lastCheckpoint: data.lastCheckpoint || 'Depot Ingestion',
      isOverdue: Boolean(data.isOverdue || data.delayDays > 0),
    }).onConflictDoUpdate({
      target: shipments.id,
      set: {
        status: data.status,
        delayDays: Number(data.delayDays) || 0,
        lastCheckpoint: data.lastCheckpoint,
        destinationLocation: data.destinationLocation,
        isOverdue: Boolean(data.isOverdue),
      },
    }).returning();
    res.json(inserted[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save shipment' });
  }
});

app.delete('/api/shipments/:id', async (req, res) => {
  try {
    await db.delete(shipments).where(eq(shipments.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const list = await db.select().from(orders).orderBy(desc(orders.createdAt));
    res.json(list.map(o => ({
      ...o,
      unitPrice: Number(o.unitPrice),
      totalAmount: Number(o.totalAmount),
    })));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(orders).values({
      id: data.id || `ord-${Date.now()}`,
      orderNumber: data.orderNumber || `ORD-${Date.now().toString().slice(-4)}`,
      customerName: data.customerName,
      customerTier: data.customerTier || 'Standard',
      productId: data.productId,
      quantity: Number(data.quantity) || 10,
      unitPrice: String(data.unitPrice || '100'),
      totalAmount: String(data.totalAmount || Number(data.quantity || 10) * Number(data.unitPrice || 100)),
      orderDate: data.orderDate || new Date().toISOString().split('T')[0],
      deliveryDeadline: data.deliveryDeadline || '2026-11-20',
      status: data.status || 'Pending',
      priority: data.priority || 'Medium',
      riskScore: Number(data.riskScore) || 20,
      riskLevel: data.riskLevel || 'Low',
      delayScore: Number(data.delayScore) || 0,
      inventoryScore: Number(data.inventoryScore) || 0,
      supplierRiskScore: Number(data.supplierRiskScore) || 0,
      customerPriorityScore: Number(data.customerPriorityScore) || 50,
      riskReason: data.riskReason || 'Operational baseline.',
      linkedShipmentId: data.linkedShipmentId || null,
      targetWarehouseId: data.targetWarehouseId || 'wh-1',
    }).onConflictDoUpdate({
      target: orders.id,
      set: {
        status: data.status,
        riskScore: Number(data.riskScore) || 0,
        riskLevel: data.riskLevel,
        delayScore: Number(data.delayScore) || 0,
        riskReason: data.riskReason,
      },
    }).returning();
    res.json(inserted[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save order' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await db.delete(orders).where(eq(orders.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Disruptions API
app.get('/api/disruptions', async (req, res) => {
  try {
    const list = await db.select().from(disruptions).orderBy(desc(disruptions.createdAt));
    res.json(list.map(d => ({
      ...d,
      affectedProductIds: JSON.parse(d.affectedProductIds || '[]'),
      affectedWarehouseIds: JSON.parse(d.affectedWarehouseIds || '[]'),
      affectedShipmentIds: JSON.parse(d.affectedShipmentIds || '[]'),
      affectedOrderIds: JSON.parse(d.affectedOrderIds || '[]'),
    })));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch disruptions' });
  }
});

app.post('/api/disruptions', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(disruptions).values({
      id: data.id || `dis-${Date.now()}`,
      disruptionNumber: data.disruptionNumber || `DIS-${Date.now().toString().slice(-4)}`,
      type: data.type,
      targetType: data.targetType,
      targetId: data.targetId,
      targetName: data.targetName,
      productId: data.productId || null,
      delayDays: Number(data.delayDays) || 1,
      affectedQuantity: Number(data.affectedQuantity) || 100,
      severity: data.severity || 'Moderate',
      description: data.description || '',
      reportedAt: data.reportedAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: data.status || 'Active',
      affectedProductIds: JSON.stringify(data.affectedProductIds || []),
      affectedWarehouseIds: JSON.stringify(data.affectedWarehouseIds || []),
      affectedShipmentIds: JSON.stringify(data.affectedShipmentIds || []),
      affectedOrderIds: JSON.stringify(data.affectedOrderIds || []),
      mitigationPlanId: data.mitigationPlanId || null,
    }).onConflictDoUpdate({
      target: disruptions.id,
      set: {
        status: data.status,
        mitigationPlanId: data.mitigationPlanId,
      },
    }).returning();
    res.json(inserted[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save disruption' });
  }
});

// Recovery Plans API
app.get('/api/recovery-plans', async (req, res) => {
  try {
    const list = await db.select().from(recoveryPlans).orderBy(desc(recoveryPlans.createdAt));
    res.json(list.map(p => ({
      ...p,
      affectedOrderIds: JSON.parse(p.affectedOrderIds || '[]'),
      details: JSON.parse(p.details || '{}'),
    })));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch recovery plans' });
  }
});

app.post('/api/recovery-plans', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(recoveryPlans).values({
      id: data.id || `plan-${Date.now()}`,
      planNumber: data.planNumber || `REC-PLAN-${Date.now().toString().slice(-4)}`,
      disruptionId: data.disruptionId,
      recoveryType: data.recoveryType,
      recommendedAction: data.recommendedAction,
      reason: data.reason,
      affectedOrderIds: JSON.stringify(data.affectedOrderIds || []),
      requiredQty: Number(data.requiredQty) || 0,
      availableQty: Number(data.availableQty) || 0,
      estimatedCost: Number(data.estimatedCost) || 0,
      expectedRecoveryDays: Number(data.expectedRecoveryDays) || 1,
      expectedRiskReductionPercent: Number(data.expectedRiskReductionPercent) || 70,
      feasibility: data.feasibility || 'High',
      requestedBy: data.requestedBy || 'Logistics Manager',
      requestedAt: data.requestedAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: data.status || 'Pending',
      approvedBy: data.approvedBy || null,
      approvedAt: data.approvedAt || null,
      executionNotes: data.executionNotes || null,
      details: JSON.stringify(data.details || {}),
    }).onConflictDoUpdate({
      target: recoveryPlans.id,
      set: {
        status: data.status,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        executionNotes: data.executionNotes,
      },
    }).returning();
    res.json(inserted[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save recovery plan' });
  }
});

// Audit Logs API
app.get('/api/audit-logs', async (req, res) => {
  try {
    const list = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(auditLogs).values({
      id: data.id || `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: data.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: data.action,
      user: data.user,
      role: data.role,
      details: data.details,
      entityType: data.entityType,
      entityId: data.entityId,
    }).returning();
    res.json(inserted[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save audit log' });
  }
});

// Entity Deletes
app.delete('/api/disruptions/:id', async (req, res) => {
  try {
    await db.delete(disruptions).where(eq(disruptions.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete disruption' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.delete(products).where(eq(products.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await db.delete(inventory).where(eq(inventory.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete inventory record' });
  }
});

app.delete('/api/recovery-plans/:id', async (req, res) => {
  try {
    await db.delete(recoveryPlans).where(eq(recoveryPlans.id, req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete recovery plan' });
  }
});

// Clear single table
app.post('/api/clear-table/:table', async (req, res) => {
  const table = req.params.table.toLowerCase();
  try {
    if (table === 'orders') await db.delete(orders);
    else if (table === 'shipments') await db.delete(shipments);
    else if (table === 'inventory') await db.delete(inventory);
    else if (table === 'suppliers') await db.delete(suppliers);
    else if (table === 'products') await db.delete(products);
    else if (table === 'warehouses') await db.delete(warehouses);
    else if (table === 'carriers') await db.delete(carriers);
    else if (table === 'disruptions') await db.delete(disruptions);
    else if (table === 'recoveryplans' || table === 'recovery-plans') await db.delete(recoveryPlans);
    else if (table === 'auditlogs' || table === 'audit-logs') await db.delete(auditLogs);
    else return res.status(400).json({ error: `Unknown table ${table}` });

    res.json({ success: true, message: `Table ${table} cleared completely.` });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to clear table ${table}` });
  }
});

// Clear all data (so user has a completely clean database with NO simulated records)
app.post('/api/clear-all-data', async (req, res) => {
  try {
    await db.delete(auditLogs);
    await db.delete(recoveryPlans);
    await db.delete(disruptions);
    await db.delete(orders);
    await db.delete(shipments);
    await db.delete(inventory);
    await db.delete(products);
    await db.delete(warehouses);
    await db.delete(suppliers);
    await db.delete(carriers);
    res.json({ success: true, message: 'All database tables cleared. Zero simulated data present.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

// In production / preview, serve built client. In development, Vite middleware handles it.
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Server failed to start:', err);
});
