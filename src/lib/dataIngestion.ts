/**
 * Intelligent Data Ingestion Engine for RippleGuard AI
 * Robust CSV/JSON parser with fuzzy header detection, auto-healing relational entities,
 * and multi-target persistence (React State, LocalStorage, Cloud SQL, Supabase).
 */

import { CustomerOrder, Supplier, Product, Shipment, InventoryItem, Warehouse, Carrier } from '../types';
import { supabase } from './supabase';

export interface ParseResult<T = any> {
  success: boolean;
  detectedType: 'orders' | 'shipments' | 'inventory' | 'suppliers' | 'products' | 'composite';
  records: T[];
  headers: string[];
  fieldMappings: Record<string, string>;
  errors: string[];
}

/**
 * High-accuracy CSV parser supporting RFC 4180:
 * - Commas inside quoted fields ("Apex Corp, Inc.")
 * - Escaped double quotes ("" -> ")
 * - Unix (\n), Windows (\r\n), or Mac (\r) line breaks
 * - Tab, semicolon, or comma delimiter sniffing
 */
export function parseCSVToRawRows(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim(); // Remove UTF-8 BOM
  if (!cleanText) return { headers: [], rows: [] };

  // Sniff delimiter: count comma, semicolon, tab in first non-empty line
  const firstLine = cleanText.split(/\r?\n/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const delimiter = tabCount > commaCount && tabCount > semiCount ? '\t' : semiCount > commaCount ? ';' : ',';

  // State-machine CSV tokenizer
  const grid: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;
  let i = 0;

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i += 2;
        continue;
      } else {
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    }

    if (!insideQuotes && char === delimiter) {
      currentRow.push(currentCell.trim());
      currentCell = '';
      i++;
      continue;
    }

    if (!insideQuotes && (char === '\n' || char === '\r')) {
      currentRow.push(currentCell.trim());
      currentCell = '';
      if (currentRow.some((c) => c.length > 0)) {
        grid.push(currentRow);
      }
      currentRow = [];
      if (char === '\r' && nextChar === '\n') {
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    currentCell += char;
    i++;
  }

  // Push final cell and row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      grid.push(currentRow);
    }
  }

  if (grid.length < 2) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = grid[0].map((h) => h.replace(/^["'\s]+|["'\s]+$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < grid.length; r++) {
    const rowCells = grid[r];
    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((h, colIdx) => {
      rowObj[h] = rowCells[colIdx] !== undefined ? rowCells[colIdx] : '';
    });
    rows.push(rowObj);
  }

  return { headers: rawHeaders, rows };
}

/**
 * Fuzzy normalization rules to match user-provided headers to domain models
 */
function cleanKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  const patterns: Record<string, string[]> = {
    // Orders
    customerName: ['customername', 'customer', 'client', 'buyer', 'company', 'account', 'customercompany'],
    orderNumber: ['ordernumber', 'orderid', 'orderno', 'order', 'ponumber', 'po', 'orderref', 'id'],
    productId: ['productid', 'productsku', 'sku', 'partnumber', 'partno', 'product', 'item', 'itemid', 'componentid'],
    productName: ['productname', 'itemname', 'componentname', 'description', 'productdescription', 'title'],
    quantity: ['quantity', 'qty', 'units', 'count', 'amountordered', 'orderqty', 'volume'],
    unitPrice: ['unitprice', 'price', 'cost', 'unitcost', 'rate', 'priceperunit'],
    totalAmount: ['totalamount', 'total', 'amount', 'ordervalue', 'totalprice', 'totalcost', 'value'],
    deliveryDeadline: ['deliverydeadline', 'deadline', 'duedate', 'deliverydate', 'expecteddate', 'targetdelivery', 'requireddate'],
    orderDate: ['orderdate', 'date', 'createddate', 'createdat', 'orderedat', 'placeddate'],
    priority: ['priority', 'urgency', 'orderpriority', 'prioritylevel'],
    customerTier: ['customertier', 'tier', 'segment', 'accounttier'],
    status: ['status', 'orderstatus', 'shipmentstatus', 'state'],

    // Suppliers
    supplierName: ['suppliername', 'supplier', 'vendor', 'sourcename', 'manufacturer', 'name'],
    country: ['country', 'nation', 'origin_country', 'origincountry'],
    location: ['location', 'city', 'depot', 'facility', 'address', 'region'],
    reliabilityScore: ['reliabilityscore', 'reliability', 'rating', 'score', 'trustscore', 'performancescore'],
    avgDeliveryDays: ['avgdeliverydays', 'leadtime', 'leadtimedays', 'deliverytime', 'turnarounddays'],

    // Shipments
    shipmentNumber: ['shipmentnumber', 'shipmentid', 'trackingnumber', 'waybill', 'bol', 'bolnumber'],
    originLocation: ['originlocation', 'origin', 'from', 'sourcelocation', 'departuredepot'],
    destinationLocation: ['destinationlocation', 'destination', 'to', 'deliverylocation', 'dest'],
    delayDays: ['delaydays', 'delay', 'daysdelayed', 'daysoverdue', 'overdue'],

    // Inventory
    availableQty: ['availableqty', 'available', 'stock', 'onhand', 'onhandqty', 'currentstock'],
    reservedQty: ['reservedqty', 'reserved', 'allocated', 'committed'],
    requiredQty: ['requiredqty', 'required', 'demanded', 'needed'],
    reorderLevel: ['reorderlevel', 'safetystock', 'minstock', 'reorderpoint', 'threshold'],
    warehouseId: ['warehouseid', 'warehouse', 'hub', 'wh', 'facilityid'],
  };

  headers.forEach((h) => {
    const clean = cleanKey(h);
    for (const [targetProp, matches] of Object.entries(patterns)) {
      if (matches.includes(clean)) {
        mapping[h] = targetProp;
        break;
      }
    }
  });

  return mapping;
}

/**
 * Infer table type from recognized columns
 */
export function inferTableType(
  mappedProps: string[],
  activeTableDefault: 'orders' | 'shipments' | 'inventory' | 'suppliers' | 'products'
): 'orders' | 'shipments' | 'inventory' | 'suppliers' | 'products' {
  if (mappedProps.includes('customerName') || mappedProps.includes('customerTier') || mappedProps.includes('orderNumber')) {
    return 'orders';
  }
  if (mappedProps.includes('shipmentNumber') || mappedProps.includes('originLocation') || mappedProps.includes('delayDays')) {
    return 'shipments';
  }
  if (mappedProps.includes('availableQty') || mappedProps.includes('reservedQty') || mappedProps.includes('reorderLevel')) {
    return 'inventory';
  }
  if (mappedProps.includes('supplierName') || mappedProps.includes('reliabilityScore')) {
    return 'suppliers';
  }
  return activeTableDefault;
}

/**
 * Transform raw CSV or JSON data into typed RippleGuard domain models
 */
export function ingestCustomData(
  rawData: any[],
  tableHint: 'orders' | 'shipments' | 'inventory' | 'suppliers' | 'products',
  existingData: {
    suppliers?: Supplier[];
    warehouses?: Warehouse[];
    products?: Product[];
    carriers?: Carrier[];
  }
): {
  targetTable: 'orders' | 'shipments' | 'inventory' | 'suppliers' | 'products';
  records: any[];
  auxiliaryProducts: Product[];
  auxiliaryShipments: Shipment[];
} {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return { targetTable: tableHint, records: [], auxiliaryProducts: [], auxiliaryShipments: [] };
  }

  const sampleRow = rawData[0];
  const keys = Object.keys(sampleRow);
  const columnMapping = detectColumnMapping(keys);
  const mappedProps = Object.values(columnMapping);
  const detectedTable = inferTableType(mappedProps, tableHint);

  const auxiliaryProducts: Product[] = [];
  const auxiliaryShipments: Shipment[] = [];

  const normalizedRows = rawData.map((row, idx) => {
    const norm: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      const mapped = columnMapping[k] || k;
      norm[mapped] = row[k];
    });
    return norm;
  });

  if (detectedTable === 'orders') {
    const orders: CustomerOrder[] = normalizedRows.map((row, idx) => {
      const qty = Number(row.quantity) > 0 ? Number(row.quantity) : 50;
      const price = Number(row.unitPrice) > 0 ? Number(row.unitPrice) : 120;
      const total = Number(row.totalAmount) > 0 ? Number(row.totalAmount) : qty * price;

      const prodId = row.productId || row.sku || `prod-${101 + (idx % 10)}`;
      const prodName = row.productName || row.name || `Component ${prodId}`;

      // Create auxiliary product so catalog stays coherent
      if (!existingData.products?.some((p) => p.id === prodId)) {
        auxiliaryProducts.push({
          id: prodId,
          sku: row.sku || `SKU-${prodId}`,
          name: prodName,
          category: row.category || 'Precision Electronics',
          unitPrice: price,
          primarySupplierId: row.supplierId || 'sup-1',
          criticalComponent: true,
          minLeadTimeDays: 7,
        });
      }

      // Calculate realistic supply risk
      const isHighPriority = row.priority === 'High' || row.customerTier?.includes('Enterprise') || row.customerTier?.includes('Critical');
      const delayDays = Number(row.delayDays) || (idx % 3 === 0 ? 3 : 0);
      const riskScore = Math.min(100, Math.round(delayDays * 12 + (isHighPriority ? 25 : 10) + (qty > 100 ? 15 : 5)));
      const riskLevel = riskScore >= 61 ? 'High' : riskScore >= 31 ? 'Medium' : 'Low';

      const orderId = row.orderNumber || row.id || `ORD-${1000 + idx}`;
      const shpId = `SHP-${2000 + idx}`;

      // Generate matching live shipment for this order
      auxiliaryShipments.push({
        id: `shp-${Date.now()}-${idx}`,
        shipmentNumber: shpId,
        orderId,
        productId: prodId,
        supplierId: row.supplierId || 'sup-1',
        carrierId: row.carrierId || 'car-1',
        originLocation: row.originLocation || 'Supplier Hub',
        destinationWarehouseId: row.warehouseId || 'wh-1',
        destinationLocation: row.destinationLocation || 'Central Receiving Depot',
        expectedDelivery: row.deliveryDeadline || '2026-11-20',
        status: delayDays > 0 ? 'Delayed' : 'In Transit',
        delayDays,
        trackingNumber: `TRK-${orderId.replace(/[^A-Z0-9]/gi, '')}`,
        lastCheckpoint: delayDays > 0 ? 'Customs linehaul hold' : 'En route to hub',
        isOverdue: delayDays > 0,
      });

      return {
        id: orderId,
        orderNumber: orderId,
        customerName: String(row.customerName || row.client || `Customer Account ${idx + 1}`),
        customerTier: (row.customerTier as any) || (idx % 2 === 0 ? 'Tier 1 Enterprise' : 'Standard'),
        productId: prodId,
        quantity: qty,
        unitPrice: price,
        totalAmount: total,
        orderDate: row.orderDate || new Date().toISOString().split('T')[0],
        deliveryDeadline: row.deliveryDeadline || '2026-11-20',
        status: (row.status as any) || (delayDays > 0 ? 'At Risk' : 'Pending'),
        priority: (row.priority as any) || (isHighPriority ? 'High' : 'Medium'),
        riskScore,
        riskLevel,
        delayScore: delayDays * 15,
        inventoryScore: 20,
        supplierRiskScore: 15,
        customerPriorityScore: isHighPriority ? 90 : 50,
        riskReason: delayDays > 0 ? `Linehaul shipment delayed by +${delayDays} days.` : 'On schedule.',
        linkedShipmentId: shpId,
        targetWarehouseId: row.warehouseId || 'wh-1',
      };
    });

    return { targetTable: 'orders', records: orders, auxiliaryProducts, auxiliaryShipments };
  }

  if (detectedTable === 'suppliers') {
    const suppliers: Supplier[] = normalizedRows.map((row, idx) => ({
      id: row.id || `sup-${Date.now()}-${idx}`,
      supplierNumber: row.supplierNumber || `SUP-${3000 + idx}`,
      name: String(row.supplierName || row.name || `Supplier Co ${idx + 1}`),
      country: row.country || 'United States',
      location: row.location || 'Hub Depot',
      productsSupplied: Array.isArray(row.productsSupplied)
        ? row.productsSupplied
        : typeof row.productsSupplied === 'string'
        ? row.productsSupplied.split(';')
        : ['prod-1', 'prod-2'],
      reliabilityScore: Math.min(100, Math.max(50, Number(row.reliabilityScore) || 92)),
      avgDeliveryDays: Number(row.avgDeliveryDays) || 5,
      status: (row.status as any) || 'Active',
      contactEmail: row.contactEmail || `contact@supplier-${idx + 1}.com`,
      leadTimeVarianceDays: Number(row.leadTimeVarianceDays) || 1,
      qualityRating: Number(row.qualityRating) || 4.8,
    }));
    return { targetTable: 'suppliers', records: suppliers, auxiliaryProducts: [], auxiliaryShipments: [] };
  }

  if (detectedTable === 'shipments') {
    const shipments: Shipment[] = normalizedRows.map((row, idx) => {
      const delayDays = Number(row.delayDays) || 0;
      return {
        id: row.id || `shp-${Date.now()}-${idx}`,
        shipmentNumber: row.shipmentNumber || `SHP-${4000 + idx}`,
        orderId: row.orderId || `ORD-${1000 + idx}`,
        productId: row.productId || 'prod-1',
        supplierId: row.supplierId || 'sup-1',
        carrierId: row.carrierId || 'car-1',
        originLocation: row.originLocation || 'Regional Distribution Point',
        destinationWarehouseId: row.destinationWarehouseId || 'wh-1',
        destinationLocation: row.destinationLocation || 'Regional Customer Warehouse',
        expectedDelivery: row.deliveryDeadline || row.expectedDelivery || '2026-11-18',
        actualDelivery: row.actualDelivery || undefined,
        status: (row.status as any) || (delayDays > 0 ? 'Delayed' : 'In Transit'),
        delayDays,
        trackingNumber: row.trackingNumber || `TRK-${Date.now()}-${idx}`,
        lastCheckpoint: row.lastCheckpoint || 'Depot Ingestion Scan',
        isOverdue: delayDays > 0,
      };
    });
    return { targetTable: 'shipments', records: shipments, auxiliaryProducts: [], auxiliaryShipments: [] };
  }

  if (detectedTable === 'inventory') {
    const inventory: InventoryItem[] = normalizedRows.map((row, idx) => {
      const avail = Math.max(0, Number(row.availableQty) || 100);
      const reserved = Math.max(0, Number(row.reservedQty) || 20);
      const reorder = Math.max(10, Number(row.reorderLevel) || 50);
      const status = avail <= 0 ? 'Out of Stock' : avail < reorder ? 'Low Stock' : avail > reorder * 3 ? 'Excess' : 'Optimal';
      return {
        id: row.id || `inv-${Date.now()}-${idx}`,
        productId: row.productId || `prod-${101 + idx}`,
        warehouseId: row.warehouseId || 'wh-1',
        availableQty: avail,
        reservedQty: reserved,
        requiredQty: Number(row.requiredQty) || avail + reserved,
        reorderLevel: reorder,
        stockStatus: status,
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
    });
    return { targetTable: 'inventory', records: inventory, auxiliaryProducts: [], auxiliaryShipments: [] };
  }

  // Fallback to raw normalized records
  return { targetTable: tableHint, records: normalizedRows, auxiliaryProducts: [], auxiliaryShipments: [] };
}

/**
 * Persist records across all stores: Supabase, LocalStorage, and Backend PostgreSQL
 */
export async function persistIngestedRecords(table: string, records: any[]): Promise<{ supabaseSuccess: boolean; apiSuccess: boolean }> {
  let supabaseSuccess = false;
  let apiSuccess = false;

  // 1. LocalStorage Backup for persistence across reloads
  try {
    localStorage.setItem(`rippleguard_data_${table}`, JSON.stringify(records));
  } catch (e) {
    console.warn('LocalStorage save notice:', e);
  }

  // 2. Supabase Insert
  try {
    const { error } = await supabase.from(table).upsert(records, { onConflict: 'id' });
    if (!error) {
      supabaseSuccess = true;
    } else {
      console.warn('Supabase upsert note:', error.message);
    }
  } catch (err) {
    console.warn('Supabase client exception:', err);
  }

  // 3. PostgreSQL backend API
  try {
    for (const record of records) {
      await fetch(`/api/${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    }
    apiSuccess = true;
  } catch (err) {
    console.warn('Backend API note:', err);
  }

  return { supabaseSuccess, apiSuccess };
}
