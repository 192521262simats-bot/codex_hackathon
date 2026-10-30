import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
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
  UserRole,
  DataProvenance,
} from '../types';
import {
  INITIAL_USER_PROFILES,
  INITIAL_SUPPLIERS,
  INITIAL_WAREHOUSES,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_CARRIERS,
  INITIAL_SHIPMENTS,
  INITIAL_ORDERS,
  INITIAL_DISRUPTIONS,
  INITIAL_RECOVERY_PLANS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  computeStockStatus,
} from '../data/initialData';
import { ingestCustomData, persistIngestedRecords } from '../lib/dataIngestion';

const STORAGE_KEY = 'rippleguard_ai_state_v2';

export interface SimulationResult {
  strategy: string;
  name: string;
  expectedDeliveryDelayDays: number;
  additionalCost: number;
  ordersRecovered: number;
  expectedRecoveryDays: number;
  remainingRiskScore: number;
  feasibility: 'High' | 'Medium' | 'Low';
  description: string;
  isRecommended?: boolean;
}

interface AppContextType {
  // Data
  suppliers: Supplier[];
  warehouses: Warehouse[];
  products: Product[];
  inventory: InventoryItem[];
  carriers: Carrier[];
  shipments: Shipment[];
  orders: CustomerOrder[];
  disruptions: Disruption[];
  recoveryPlans: RecoveryPlan[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  currentUser: UserProfile;
  userProfiles: UserProfile[];
  dataProvenance: DataProvenance;
  currentTab: string;
  activeDisruptionId: string | null;
  isLoadingDb: boolean;

  // Actions
  setCurrentTab: (tab: string) => void;
  setActiveDisruptionId: (id: string | null) => void;
  setCurrentUserRole: (role: UserRole) => void;
  
  // Disruption & Risk
  reportDisruption: (data: {
    type: Disruption['type'];
    targetType: Disruption['targetType'];
    targetId: string;
    productId?: string;
    delayDays: number;
    affectedQuantity: number;
    severity: Disruption['severity'];
    description: string;
  }) => { disruption: Disruption; plan: RecoveryPlan };
  resolveDisruption: (id: string) => void;

  // Recovery & Approvals
  approvePlan: (planId: string) => void;
  rejectPlan: (planId: string, reason?: string) => void;
  executePlan: (planId: string) => void;
  generateRecoveryPlanForDisruption: (disruptionId: string) => RecoveryPlan | null;
  runWhatIfSimulation: (disruptionId?: string) => SimulationResult[];

  // Entity Management & Custom Additions
  addOrder: (order: Partial<CustomerOrder>) => Promise<void>;
  addSupplier: (supplier: Partial<Supplier>) => Promise<void>;
  addProduct: (product: Partial<Product>) => Promise<void>;
  addShipment: (shipment: Omit<Shipment, 'id' | 'shipmentNumber' | 'isOverdue'>) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  updateStock: (inventoryId: string, availableQty: number, reservedQty: number) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;

  // Demo Scenarios & Data Management
  loadScenarioA: () => void;
  loadScenarioB: () => void;
  resetToDefaultData: () => void;
  clearAllData: () => Promise<void>;
  ingestDataset: (
    data: any[],
    tableHint?: 'orders' | 'shipments' | 'inventory' | 'suppliers' | 'products',
    sourceName?: string
  ) => Promise<{ success: boolean; count: number; table: string; errors: string[] }>;
  importRecords: (
    entityType: 'orders' | 'shipments' | 'inventory' | 'suppliers',
    data: any[],
    sourceName: string
  ) => { success: boolean; importedCount: number; errors: string[] };
  exportDataJSON: () => void;
  exportEntityCSV: (entityType: 'orders' | 'shipments' | 'inventory' | 'suppliers') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_PROFILES[0]);
  const [currentTab, setCurrentTab] = useState<string>('data');
  const [activeDisruptionId, setActiveDisruptionId] = useState<string | null>(null);
  const [dataProvenance, setDataProvenance] = useState<DataProvenance>({
    sourceType: 'Connected Operational Source',
    recordCount: 0,
    lastImportedAt: 'Supabase / Live Database',
  });

  // Fetch from PostgreSQL backend on mount
  useEffect(() => {
    async function loadFromBackend() {
      try {
        setIsLoadingDb(true);
        const [
          supRes,
          whRes,
          prodRes,
          invRes,
          carRes,
          shpRes,
          ordRes,
          disRes,
          planRes,
          auditRes,
        ] = await Promise.allSettled([
          fetch('/api/suppliers').then((r) => r.json()),
          fetch('/api/warehouses').then((r) => r.json()),
          fetch('/api/products').then((r) => r.json()),
          fetch('/api/inventory').then((r) => r.json()),
          fetch('/api/carriers').then((r) => r.json()),
          fetch('/api/shipments').then((r) => r.json()),
          fetch('/api/orders').then((r) => r.json()),
          fetch('/api/disruptions').then((r) => r.json()),
          fetch('/api/recovery-plans').then((r) => r.json()),
          fetch('/api/audit-logs').then((r) => r.json()),
        ]);

        let hasDbRecords = false;

        if (supRes.status === 'fulfilled' && Array.isArray(supRes.value) && supRes.value.length > 0) {
          setSuppliers(supRes.value);
          hasDbRecords = true;
        }
        if (whRes.status === 'fulfilled' && Array.isArray(whRes.value) && whRes.value.length > 0) {
          setWarehouses(whRes.value);
          hasDbRecords = true;
        }
        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value) && prodRes.value.length > 0) {
          setProducts(prodRes.value);
          hasDbRecords = true;
        }
        if (invRes.status === 'fulfilled' && Array.isArray(invRes.value) && invRes.value.length > 0) {
          setInventory(invRes.value);
          hasDbRecords = true;
        }
        if (carRes.status === 'fulfilled' && Array.isArray(carRes.value) && carRes.value.length > 0) {
          setCarriers(carRes.value);
          hasDbRecords = true;
        }
        if (shpRes.status === 'fulfilled' && Array.isArray(shpRes.value) && shpRes.value.length > 0) {
          setShipments(shpRes.value);
          hasDbRecords = true;
        }
        if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value) && ordRes.value.length > 0) {
          setOrders(ordRes.value);
          hasDbRecords = true;
        }
        if (disRes.status === 'fulfilled' && Array.isArray(disRes.value) && disRes.value.length > 0) {
          setDisruptions(disRes.value);
          hasDbRecords = true;
        }
        if (planRes.status === 'fulfilled' && Array.isArray(planRes.value) && planRes.value.length > 0) {
          setRecoveryPlans(planRes.value);
          hasDbRecords = true;
        }
        if (auditRes.status === 'fulfilled' && Array.isArray(auditRes.value) && auditRes.value.length > 0) {
          setAuditLogs(auditRes.value);
        }

        // Restore from LocalStorage if user previously uploaded datasets
        try {
          const storedOrders = localStorage.getItem('rippleguard_data_orders');
          if (storedOrders) {
            const parsed = JSON.parse(storedOrders);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setOrders(parsed);
              hasDbRecords = true;
            }
          }
          const storedShipments = localStorage.getItem('rippleguard_data_shipments');
          if (storedShipments) {
            const parsed = JSON.parse(storedShipments);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setShipments(parsed);
              hasDbRecords = true;
            }
          }
          const storedInventory = localStorage.getItem('rippleguard_data_inventory');
          if (storedInventory) {
            const parsed = JSON.parse(storedInventory);
            if (Array.isArray(parsed) && parsed.length > 0) setInventory(parsed);
          }
          const storedSuppliers = localStorage.getItem('rippleguard_data_suppliers');
          if (storedSuppliers) {
            const parsed = JSON.parse(storedSuppliers);
            if (Array.isArray(parsed) && parsed.length > 0) setSuppliers(parsed);
          }
          const storedProducts = localStorage.getItem('rippleguard_data_products');
          if (storedProducts) {
            const parsed = JSON.parse(storedProducts);
            if (Array.isArray(parsed) && parsed.length > 0) setProducts(parsed);
          }
        } catch (e) {
          console.warn('LocalStorage restore note:', e);
        }

        if (hasDbRecords) {
          setDataProvenance({
            sourceType: 'Connected Operational Source',
            lastImportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            recordCount: (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value) ? ordRes.value.length : 0) +
                         (shpRes.status === 'fulfilled' && Array.isArray(shpRes.value) ? shpRes.value.length : 0),
          });
        }
      } catch (err) {
        console.warn('Backend load notice:', err);
      } finally {
        setIsLoadingDb(false);
      }
    }

    loadFromBackend();
  }, []);

  // Role switching
  const setCurrentUserRole = (role: UserRole) => {
    const found = INITIAL_USER_PROFILES.find((p) => p.role === role);
    if (found) {
      setCurrentUser(found);
      addAuditLog('User Switched Role', `Logged in as ${found.name} (${found.role})`, 'Plan', 'system');
    }
  };

  const addAuditLog = async (action: string, details: string, entityType: AuditLog['entityType'], entityId: string) => {
    const now = new Date();
    const formatted = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formatted,
      action,
      user: currentUser.name,
      role: currentUser.role,
      details,
      entityType,
      entityId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
    } catch (e) {
      // Local fallback
    }
  };

  // Helper: Traverse supply chain dependencies
  const calculateRippleImpact = (
    targetType: Disruption['targetType'],
    targetId: string,
    productId?: string
  ) => {
    let affectedProductIds: string[] = [];
    let affectedWarehouseIds: string[] = [];
    let affectedShipmentIds: string[] = [];
    let affectedOrderIds: string[] = [];

    if (targetType === 'supplier') {
      const sup = suppliers.find((s) => s.id === targetId);
      if (sup) {
        affectedProductIds = productId ? [productId] : [...sup.productsSupplied];
      }
    } else if (targetType === 'warehouse') {
      affectedWarehouseIds = [targetId];
      if (productId) {
        affectedProductIds = [productId];
      } else {
        const invInWh = inventory.filter((i) => i.warehouseId === targetId && i.availableQty < i.reorderLevel);
        affectedProductIds = invInWh.map((i) => i.productId);
      }
    } else if (targetType === 'carrier') {
      const shps = shipments.filter((s) => s.carrierId === targetId && s.status !== 'Delivered');
      affectedShipmentIds = shps.map((s) => s.id);
      affectedProductIds = Array.from(new Set(shps.map((s) => s.productId)));
    }

    if (targetType === 'supplier') {
      const invMatches = inventory.filter((inv) => affectedProductIds.includes(inv.productId));
      affectedWarehouseIds = Array.from(new Set(invMatches.map((i) => i.warehouseId)));
    }

    const relShipments = shipments.filter(
      (s) =>
        s.status !== 'Delivered' &&
        (affectedProductIds.includes(s.productId) ||
          (targetType === 'supplier' && s.supplierId === targetId) ||
          (targetType === 'warehouse' && s.destinationWarehouseId === targetId) ||
          (targetType === 'carrier' && s.carrierId === targetId))
    );
    affectedShipmentIds = Array.from(new Set([...affectedShipmentIds, ...relShipments.map((s) => s.id)]));

    const relOrders = orders.filter(
      (o) =>
        o.status !== 'Delivered' &&
        (affectedProductIds.includes(o.productId) ||
          relShipments.some((s) => s.orderId === o.id))
    );
    affectedOrderIds = relOrders.map((o) => o.id);

    return {
      affectedProductIds,
      affectedWarehouseIds,
      affectedShipmentIds,
      affectedOrderIds,
    };
  };

  // Disruption Reporting
  const reportDisruption = (data: {
    type: Disruption['type'];
    targetType: Disruption['targetType'];
    targetId: string;
    productId?: string;
    delayDays: number;
    affectedQuantity: number;
    severity: Disruption['severity'];
    description: string;
  }) => {
    let targetName = 'Target Entity';
    if (data.targetType === 'supplier') {
      const s = suppliers.find((x) => x.id === data.targetId);
      targetName = s ? `${s.name} (${s.country})` : data.targetId;
    } else if (data.targetType === 'warehouse') {
      const w = warehouses.find((x) => x.id === data.targetId);
      targetName = w ? `${w.name} (${w.city})` : data.targetId;
    } else if (data.targetType === 'carrier') {
      const c = carriers.find((x) => x.id === data.targetId);
      targetName = c ? `${c.name} (${c.transportMode})` : data.targetId;
    }

    const {
      affectedProductIds,
      affectedWarehouseIds,
      affectedShipmentIds,
      affectedOrderIds,
    } = calculateRippleImpact(data.targetType, data.targetId, data.productId);

    const disruptionNumber = `DIS-${(100 + disruptions.length + 1).toString()}`;
    const newDisruptionId = `dis-${Date.now()}`;

    const newDisruption: Disruption = {
      id: newDisruptionId,
      disruptionNumber,
      type: data.type,
      targetType: data.targetType,
      targetId: data.targetId,
      targetName,
      productId: data.productId,
      delayDays: data.delayDays,
      affectedQuantity: data.affectedQuantity,
      severity: data.severity,
      description: data.description,
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Active',
      affectedProductIds,
      affectedWarehouseIds,
      affectedShipmentIds,
      affectedOrderIds,
    };

    setShipments((prev) =>
      prev.map((s) => {
        if (affectedShipmentIds.includes(s.id)) {
          return {
            ...s,
            status: 'Delayed',
            delayDays: Math.max(s.delayDays, data.delayDays),
            isOverdue: true,
            lastCheckpoint: `Disruption reported: ${data.description.substring(0, 45)}...`,
          };
        }
        return s;
      })
    );

    setOrders((prev) =>
      prev.map((o) => {
        if (affectedOrderIds.includes(o.id)) {
          const delayScore = Math.min(100, data.delayDays * 25);
          const inventoryScore = Math.min(100, 70 + (data.affectedQuantity > 100 ? 25 : 10));
          const supplierRiskScore = data.severity === 'Critical' ? 90 : data.severity === 'Major' ? 70 : 45;
          const customerPriorityScore = o.priority === 'High' ? 100 : o.priority === 'Medium' ? 60 : 25;
          const newRisk = Math.min(
            100,
            Math.round(
              0.35 * delayScore +
              0.30 * inventoryScore +
              0.20 * supplierRiskScore +
              0.15 * customerPriorityScore
            )
          );

          let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
          if (newRisk >= 61) riskLevel = 'High';
          else if (newRisk >= 31) riskLevel = 'Medium';

          return {
            ...o,
            status: 'At Risk',
            riskScore: newRisk,
            riskLevel,
            delayScore,
            inventoryScore,
            supplierRiskScore,
            customerPriorityScore,
            riskReason: `Disruption ${disruptionNumber}: ${data.description}`,
          };
        }
        return o;
      })
    );

    const generatedPlan = generatePlanForDisruptionObject(newDisruption);
    newDisruption.mitigationPlanId = generatedPlan.id;

    setDisruptions((prev) => [newDisruption, ...prev]);
    setRecoveryPlans((prev) => [generatedPlan, ...prev]);
    setActiveDisruptionId(newDisruptionId);

    // Persist to backend database
    fetch('/api/disruptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDisruption),
    }).catch(console.error);

    fetch('/api/recovery-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generatedPlan),
    }).catch(console.error);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'disruption',
        title: `${data.severity} Disruption: ${targetName}`,
        message: `${data.type} detected affecting ${affectedOrderIds.length} orders. Plan ${generatedPlan.planNumber} generated.`,
        severity: data.severity === 'Critical' ? 'critical' : 'warning',
        timestamp: 'Just now',
        read: false,
        linkToTab: 'disruptions',
      },
      ...prev,
    ]);

    addAuditLog('Disruption Reported', `Logged ${data.type} on ${targetName}. Affected ${affectedOrderIds.length} orders.`, 'Disruption', newDisruptionId);

    return { disruption: newDisruption, plan: generatedPlan };
  };

  const generatePlanForDisruptionObject = (disr: Disruption): RecoveryPlan => {
    const planNumber = `REC-PLAN-${500 + recoveryPlans.length + 1}`;
    const planId = `plan-${Date.now()}`;

    let recoveryType: RecoveryPlan['recoveryType'] = 'Alternative Supplier';
    let recommendedAction = '';
    let reason = '';
    let estimatedCost = 4500;
    let expectedRecoveryDays = 2;
    let expectedRiskReductionPercent = 70;
    let feasibility: 'High' | 'Medium' | 'Low' = 'High';
    let availableQty = 0;
    const requiredQty = disr.affectedQuantity || 300;
    const details: RecoveryPlan['details'] = {};

    const targetProdId = disr.productId || (disr.affectedProductIds.length > 0 ? disr.affectedProductIds[0] : 'prod-1');
    const targetProd = products.find((p) => p.id === targetProdId) || products[0];

    const surplusInv = inventory.find(
      (inv) =>
        inv.productId === targetProdId &&
        inv.warehouseId !== disr.targetId &&
        inv.availableQty >= requiredQty * 0.8
    );

    if (surplusInv) {
      const sourceWh = warehouses.find((w) => w.id === surplusInv.warehouseId);
      const targetWh = warehouses.find((w) => w.id === (disr.affectedWarehouseIds[0] || 'wh-1'));
      recoveryType = 'Inventory Redistribution';
      recommendedAction = `Transfer ${Math.min(surplusInv.availableQty, requiredQty)} units of ${targetProd?.name || 'cargo'} from ${sourceWh?.name || 'Secondary Depot'} to ${targetWh?.name || 'Local Hub'} via expedited freight.`;
      reason = `${sourceWh?.name} holds ${surplusInv.availableQty} available units exceeding its buffer. Rapid regional transfer fulfills pending customer orders without new manufacturing lead time.`;
      estimatedCost = Math.round(requiredQty * 12 + 1200);
      expectedRecoveryDays = 1;
      expectedRiskReductionPercent = 85;
      feasibility = 'High';
      availableQty = surplusInv.availableQty;
      details.sourceWarehouseId = surplusInv.warehouseId;
      details.targetWarehouseId = targetWh?.id || 'wh-1';
      details.expeditedCarrierId = 'car-5';
    } else {
      const altSupplier = suppliers.find(
        (s) =>
          s.id !== disr.targetId &&
          s.status === 'Active' &&
          s.productsSupplied.includes(targetProdId) &&
          s.reliabilityScore >= 85
      );

      if (altSupplier) {
        recoveryType = 'Alternative Supplier';
        recommendedAction = `Issue priority purchase order for ${requiredQty} units of ${targetProd?.name || 'parts'} to ${altSupplier.name} (${altSupplier.country}).`;
        reason = `${altSupplier.name} demonstrates a ${altSupplier.reliabilityScore}% reliability rating and an average lead time of ${altSupplier.avgDeliveryDays} days, fully covering the defected batch.`;
        estimatedCost = Math.round(requiredQty * (targetProd?.unitPrice || 100) * 1.08);
        expectedRecoveryDays = Math.max(2, altSupplier.avgDeliveryDays - 4);
        expectedRiskReductionPercent = 74;
        feasibility = 'High';
        availableQty = requiredQty + 200;
        details.alternativeSupplierId = altSupplier.id;
        details.expeditedCarrierId = 'car-2';
      } else {
        recoveryType = 'Expedited Delivery';
        recommendedAction = `Reroute cargo via SwiftLine Air Cargo priority charter with 24/7 dedicated linehaul clearance.`;
        reason = `No single supplier has verified buffer stock; air cargo bypassing congested sea ports recovers 3 critical days of lead time.`;
        estimatedCost = Math.round(requiredQty * 28 + 2500);
        expectedRecoveryDays = 2;
        expectedRiskReductionPercent = 62;
        feasibility = 'Medium';
        availableQty = requiredQty;
        details.expeditedCarrierId = 'car-2';
      }
    }

    return {
      id: planId,
      planNumber,
      disruptionId: disr.id,
      recoveryType,
      recommendedAction,
      reason,
      affectedOrderIds: disr.affectedOrderIds,
      requiredQty,
      availableQty,
      estimatedCost,
      expectedRecoveryDays,
      expectedRiskReductionPercent,
      feasibility,
      requestedBy: `${currentUser.name} (${currentUser.role})`,
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending',
      details,
    };
  };

  const generateRecoveryPlanForDisruption = (disruptionId: string): RecoveryPlan | null => {
    const disr = disruptions.find((d) => d.id === disruptionId);
    if (!disr) return null;
    const plan = generatePlanForDisruptionObject(disr);
    setRecoveryPlans((prev) => [plan, ...prev]);
    fetch('/api/recovery-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    }).catch(console.error);
    addAuditLog('Plan Generated', `Generated candidate recovery plan ${plan.planNumber}`, 'Plan', plan.id);
    return plan;
  };

  const runWhatIfSimulation = (disruptionId?: string): SimulationResult[] => {
    const disr = disruptions.find((d) => d.id === (disruptionId || activeDisruptionId)) || disruptions[0];
    const affectedOrdersList = orders.filter((o) => disr?.affectedOrderIds.includes(o.id));
    const orderCount = affectedOrdersList.length || 5;

    return [
      {
        strategy: 'wait_original',
        name: 'Wait for Original Supplier',
        expectedDeliveryDelayDays: (disr?.delayDays || 3) + 2,
        additionalCost: 0,
        ordersRecovered: Math.round(orderCount * 0.2),
        expectedRecoveryDays: (disr?.delayDays || 3) + 4,
        remainingRiskScore: 84,
        feasibility: 'High',
        description: 'Passive baseline. High likelihood of customer cancellation penalties and tier degradation.',
        isRecommended: false,
      },
      {
        strategy: 'inventory_transfer',
        name: 'Inter-Warehouse Inventory Transfer',
        expectedDeliveryDelayDays: 1,
        additionalCost: 3450,
        ordersRecovered: orderCount,
        expectedRecoveryDays: 1,
        remainingRiskScore: 18,
        feasibility: 'High',
        description: 'Reallocates surplus buffer from secondary hub. Lowest cost and fastest recovery time.',
        isRecommended: true,
      },
      {
        strategy: 'alternative_supplier',
        name: 'Procure from Alternative Supplier',
        expectedDeliveryDelayDays: 2,
        additionalCost: 8200,
        ordersRecovered: Math.round(orderCount * 0.9),
        expectedRecoveryDays: 3,
        remainingRiskScore: 26,
        feasibility: 'High',
        description: 'Engages qualified pre-vetted vendor. High reliability score and preserves local warehouse buffers.',
        isRecommended: false,
      },
      {
        strategy: 'expedited_shipping',
        name: 'Expedited Air Cargo Charter',
        expectedDeliveryDelayDays: 1,
        additionalCost: 11500,
        ordersRecovered: Math.round(orderCount * 0.85),
        expectedRecoveryDays: 2,
        remainingRiskScore: 32,
        feasibility: 'Medium',
        description: 'High air cargo premium. Bypasses port and road congestion to deliver within contract grace period.',
        isRecommended: false,
      },
    ];
  };

  const approvePlan = (planId: string) => {
    const updatedBy = `${currentUser.name} (${currentUser.role})`;
    const updatedTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setRecoveryPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const updated = {
            ...p,
            status: 'Approved' as const,
            approvedBy: updatedBy,
            approvedAt: updatedTime,
          };
          fetch('/api/recovery-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return p;
      })
    );

    const plan = recoveryPlans.find((p) => p.id === planId);
    if (plan) {
      addAuditLog('Plan Approved', `Plan ${plan.planNumber} (${plan.recoveryType}) approved by ${currentUser.name}.`, 'Plan', planId);
    }
  };

  const rejectPlan = (planId: string, reason = 'Alternative operational route selected') => {
    setRecoveryPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const updated = {
            ...p,
            status: 'Rejected' as const,
            executionNotes: reason,
          };
          fetch('/api/recovery-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return p;
      })
    );
  };

  const executePlan = (planId: string) => {
    const plan = recoveryPlans.find((p) => p.id === planId);
    if (!plan) return;

    if (plan.recoveryType === 'Inventory Redistribution' && plan.details.sourceWarehouseId && plan.details.targetWarehouseId) {
      const sourceWh = plan.details.sourceWarehouseId;
      const targetWh = plan.details.targetWarehouseId;
      const transferQty = plan.requiredQty;

      setInventory((prev) =>
        prev.map((item) => {
          if (item.warehouseId === sourceWh && item.availableQty >= transferQty) {
            const newAvail = item.availableQty - transferQty;
            const updated = {
              ...item,
              availableQty: newAvail,
              stockStatus: computeStockStatus(newAvail, item.reorderLevel),
              lastUpdated: 'Just now (Transferred out)',
            };
            fetch('/api/inventory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated),
            }).catch(console.error);
            return updated;
          }
          if (item.warehouseId === targetWh) {
            const newAvail = item.availableQty + transferQty;
            const updated = {
              ...item,
              availableQty: newAvail,
              stockStatus: computeStockStatus(newAvail, item.reorderLevel),
              lastUpdated: 'Just now (Transferred in)',
            };
            fetch('/api/inventory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated),
            }).catch(console.error);
            return updated;
          }
          return item;
        })
      );
    }

    setShipments((prev) =>
      prev.map((shp) => {
        if (plan.affectedOrderIds.includes(shp.orderId)) {
          const updated = {
            ...shp,
            status: 'In Transit' as const,
            delayDays: 0,
            isOverdue: false,
            lastCheckpoint: `Recovery dispatched: ${plan.recoveryType}. En route for delivery.`,
          };
          fetch('/api/shipments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return shp;
      })
    );

    setOrders((prev) =>
      prev.map((ord) => {
        if (plan.affectedOrderIds.includes(ord.id)) {
          const updated = {
            ...ord,
            status: 'Recovered' as const,
            riskScore: 12,
            riskLevel: 'Low' as const,
            delayScore: 5,
            inventoryScore: 10,
            riskReason: `Protected via executed recovery plan ${plan.planNumber} (${plan.recoveryType}). Delivery guaranteed.`,
          };
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return ord;
      })
    );

    setDisruptions((prev) =>
      prev.map((disr) => {
        if (disr.id === plan.disruptionId) {
          const updated = {
            ...disr,
            status: 'Mitigated' as const,
          };
          fetch('/api/disruptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return disr;
      })
    );

    setRecoveryPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const updated = {
            ...p,
            status: 'Executed' as const,
            executionNotes: `Executed by ${currentUser.name} at ${new Date().toLocaleTimeString()}. Records updated.`,
          };
          fetch('/api/recovery-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return p;
      })
    );

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#38bdf8', '#6366f1'],
      });
    } catch (e) {}

    addAuditLog(
      'Recovery Plan Executed',
      `Executed ${plan.planNumber} (${plan.recoveryType}). Reallocated ${plan.requiredQty} units and recovered ${plan.affectedOrderIds.length} orders.`,
      'Plan',
      planId
    );
  };

  const resolveDisruption = (id: string) => {
    setDisruptions((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, status: 'Resolved' as const };
          fetch('/api/disruptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return d;
      })
    );
    addAuditLog('Disruption Resolved', `Closed disruption record ${id}`, 'Disruption', id);
  };

  // Add custom records directly into Cloud SQL
  const addOrder = async (data: Partial<CustomerOrder>) => {
    const newOrder: CustomerOrder = {
      id: data.id || `ord-${Date.now()}`,
      orderNumber: data.orderNumber || `ORD-${Date.now().toString().slice(-4)}`,
      customerName: data.customerName || 'Customer Enterprise',
      customerTier: data.customerTier || 'Standard',
      productId: data.productId || products[0]?.id || 'prod-1',
      quantity: Number(data.quantity) || 50,
      unitPrice: Number(data.unitPrice) || 100,
      totalAmount: Number(data.totalAmount) || Number(data.quantity || 50) * Number(data.unitPrice || 100),
      orderDate: data.orderDate || new Date().toISOString().split('T')[0],
      deliveryDeadline: data.deliveryDeadline || '2026-11-25',
      status: data.status || 'Pending',
      priority: data.priority || 'Medium',
      riskScore: Number(data.riskScore) || 20,
      riskLevel: data.riskLevel || 'Low',
      delayScore: Number(data.delayScore) || 0,
      inventoryScore: Number(data.inventoryScore) || 10,
      supplierRiskScore: Number(data.supplierRiskScore) || 15,
      customerPriorityScore: data.priority === 'High' ? 100 : data.priority === 'Medium' ? 60 : 25,
      riskReason: data.riskReason || 'Custom live order.',
      targetWarehouseId: data.targetWarehouseId || warehouses[0]?.id || 'wh-1',
    };

    setOrders((prev) => [newOrder, ...prev]);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      addAuditLog('Custom Order Added', `Created order ${newOrder.orderNumber} for ${newOrder.customerName}`, 'Order', newOrder.id);
    } catch (e) {
      console.error(e);
    }
  };

  const addSupplier = async (data: Partial<Supplier>) => {
    const newSupplier: Supplier = {
      id: data.id || `sup-${Date.now()}`,
      supplierNumber: data.supplierNumber || `SUP-${Date.now().toString().slice(-4)}`,
      name: data.name || 'New Supplier',
      country: data.country || 'Global',
      location: data.location || 'Depot',
      productsSupplied: data.productsSupplied || [],
      reliabilityScore: Number(data.reliabilityScore) || 90,
      avgDeliveryDays: Number(data.avgDeliveryDays) || 7,
      status: data.status || 'Active',
      contactEmail: data.contactEmail || '',
      leadTimeVarianceDays: Number(data.leadTimeVarianceDays) || 1,
      qualityRating: Number(data.qualityRating) || 4.8,
    };

    setSuppliers((prev) => [newSupplier, ...prev]);

    try {
      await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      });
      addAuditLog('Custom Supplier Added', `Created supplier ${newSupplier.name}`, 'Disruption', newSupplier.id);
    } catch (e) {
      console.error(e);
    }
  };

  const addProduct = async (data: Partial<Product>) => {
    const newProduct: Product = {
      id: data.id || `prod-${Date.now()}`,
      sku: data.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: data.name || 'New Component',
      category: data.category || 'Hardware',
      unitPrice: Number(data.unitPrice) || 100,
      primarySupplierId: data.primarySupplierId || suppliers[0]?.id || 'sup-1',
      criticalComponent: Boolean(data.criticalComponent),
      minLeadTimeDays: Number(data.minLeadTimeDays) || 7,
    };

    setProducts((prev) => [newProduct, ...prev]);

    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      addAuditLog('Custom Product Added', `Created product ${newProduct.name}`, 'Disruption', newProduct.id);
    } catch (e) {
      console.error(e);
    }
  };

  const addShipment = (shipment: Omit<Shipment, 'id' | 'shipmentNumber' | 'isOverdue'>) => {
    const shipmentNumber = `SHP-${(3000 + shipments.length + 1).toString()}`;
    const newShipment: Shipment = {
      ...shipment,
      id: `shp-${Date.now()}`,
      shipmentNumber,
      isOverdue: shipment.status === 'Delayed',
    };
    setShipments((prev) => [newShipment, ...prev]);
    fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newShipment),
    }).catch(console.error);
    addAuditLog('Shipment Created', `Added shipment ${shipmentNumber}`, 'Shipment', newShipment.id);
  };

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = {
            ...s,
            ...updates,
            isOverdue: updates.status === 'Delayed' || s.isOverdue,
          };
          fetch('/api/shipments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return s;
      })
    );
    addAuditLog('Shipment Updated', `Modified shipment ${id}`, 'Shipment', id);
  };

  const updateStock = (inventoryId: string, availableQty: number, reservedQty: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === inventoryId) {
          const safeAvail = Math.max(0, availableQty);
          const safeReserved = Math.max(0, reservedQty);
          const updated = {
            ...item,
            availableQty: safeAvail,
            reservedQty: safeReserved,
            stockStatus: computeStockStatus(safeAvail, item.reorderLevel),
            lastUpdated: 'Just now (Database adjustment)',
          };
          fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(console.error);
          return updated;
        }
        return item;
      })
    );
    addAuditLog('Stock Adjusted', `Adjusted inventory item ${inventoryId} to ${availableQty} units`, 'Inventory', inventoryId);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const loadScenarioA = () => {
    setActiveDisruptionId('dis-1');
    setCurrentTab('disruptions');
  };

  const loadScenarioB = () => {
    setActiveDisruptionId('dis-2');
    setCurrentTab('recovery');
  };

  const resetToDefaultData = () => {
    setSuppliers(INITIAL_SUPPLIERS);
    setWarehouses(INITIAL_WAREHOUSES);
    setProducts(INITIAL_PRODUCTS);
    setInventory(INITIAL_INVENTORY);
    setCarriers(INITIAL_CARRIERS);
    setShipments(INITIAL_SHIPMENTS);
    setOrders(INITIAL_ORDERS);
    setDisruptions(INITIAL_DISRUPTIONS);
    setRecoveryPlans(INITIAL_RECOVERY_PLANS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveDisruptionId('dis-1');
    setDataProvenance({
      sourceType: 'Connected Operational Source',
      recordCount: 50 + 50 + 20 + 10 + 5,
      lastImportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
  };

  // User requests: "i want to add my own data usng supabase so no own data stimulation should be added"
  const clearAllData = async () => {
    try {
      await fetch('/api/clear-all-data', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    try {
      localStorage.removeItem('rippleguard_data_orders');
      localStorage.removeItem('rippleguard_data_shipments');
      localStorage.removeItem('rippleguard_data_inventory');
      localStorage.removeItem('rippleguard_data_suppliers');
      localStorage.removeItem('rippleguard_data_products');
    } catch (e) {}

    setSuppliers([]);
    setWarehouses([]);
    setProducts([]);
    setInventory([]);
    setCarriers([]);
    setShipments([]);
    setOrders([]);
    setDisruptions([]);
    setRecoveryPlans([]);
    setActiveDisruptionId(null);
    setDataProvenance({
      sourceType: 'Connected Operational Source',
      recordCount: 0,
      lastImportedAt: 'Cleared: Zero simulated data',
    });
    setNotifications([
      {
        id: `notif-${Date.now()}`,
        type: 'info',
        title: 'Database Emptied for Live Data',
        message: 'All simulated demonstration records removed. Ready for your custom records or CSV/JSON ingestion.',
        severity: 'info',
        timestamp: 'Just now',
        read: false,
        linkToTab: 'data',
      },
    ]);
  };

  const ingestDataset = async (
    data: any[],
    tableHint: 'orders' | 'shipments' | 'inventory' | 'suppliers' | 'products' = 'orders',
    sourceName: string = 'User Upload'
  ): Promise<{ success: boolean; count: number; table: string; errors: string[] }> => {
    const { targetTable, records, auxiliaryProducts, auxiliaryShipments } = ingestCustomData(
      data,
      tableHint,
      { suppliers, warehouses, products, carriers }
    );

    if (records.length === 0) {
      return { success: false, count: 0, table: targetTable, errors: ['No valid records could be processed from file.'] };
    }

    if (targetTable === 'orders') {
      setOrders(records);
      if (auxiliaryProducts.length > 0) {
        setProducts((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          auxiliaryProducts.forEach((p) => map.set(p.id, p));
          return Array.from(map.values());
        });
        persistIngestedRecords('products', auxiliaryProducts);
      }
      if (auxiliaryShipments.length > 0) {
        setShipments(auxiliaryShipments);
        persistIngestedRecords('shipments', auxiliaryShipments);
      }
    } else if (targetTable === 'shipments') {
      setShipments(records);
    } else if (targetTable === 'inventory') {
      setInventory(records);
    } else if (targetTable === 'suppliers') {
      setSuppliers(records);
    } else if (targetTable === 'products') {
      setProducts(records);
    }

    await persistIngestedRecords(targetTable, records);

    setDataProvenance({
      sourceType: 'Connected Operational Source',
      lastImportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      recordCount: records.length,
      sourceFile: sourceName,
    });

    addAuditLog(
      'Live Data Ingested',
      `Loaded ${records.length} records into ${targetTable} from ${sourceName}`,
      'Order',
      targetTable
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'info',
        title: 'Dataset Ingested Successfully',
        message: `Successfully loaded ${records.length} operational records into ${targetTable}. Dashboards and risk models updated.`,
        severity: 'info',
        timestamp: 'Just now',
        read: false,
        linkToTab: targetTable === 'orders' ? 'risk' : targetTable,
      },
      ...prev,
    ]);

    return { success: true, count: records.length, table: targetTable, errors: [] };
  };

  const importRecords = (
    entityType: 'orders' | 'shipments' | 'inventory' | 'suppliers',
    data: any[],
    sourceName: string
  ) => {
    ingestDataset(data, entityType, sourceName);
    return { success: true, importedCount: data.length, errors: [] };
  };

  const exportDataJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      suppliers,
      warehouses,
      products,
      inventory,
      carriers,
      shipments,
      orders,
      disruptions,
      recoveryPlans,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rippleguard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportEntityCSV = (entityType: 'orders' | 'shipments' | 'inventory' | 'suppliers') => {
    let rows: any[] = [];
    if (entityType === 'orders') rows = orders;
    else if (entityType === 'shipments') rows = shipments;
    else if (entityType === 'inventory') rows = inventory;
    else if (entityType === 'suppliers') rows = suppliers;

    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map((r) =>
        Object.values(r)
          .map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : String(v ?? '')))
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rippleguard-${entityType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppContext.Provider
      value={{
        suppliers,
        warehouses,
        products,
        inventory,
        carriers,
        shipments,
        orders,
        disruptions,
        recoveryPlans,
        notifications,
        auditLogs,
        currentUser,
        userProfiles: INITIAL_USER_PROFILES,
        dataProvenance,
        currentTab,
        activeDisruptionId,
        isLoadingDb,
        setCurrentTab,
        setActiveDisruptionId,
        setCurrentUserRole,
        reportDisruption,
        resolveDisruption,
        approvePlan,
        rejectPlan,
        executePlan,
        generateRecoveryPlanForDisruption,
        runWhatIfSimulation,
        addOrder,
        addSupplier,
        addProduct,
        addShipment,
        updateShipment,
        updateStock,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        loadScenarioA,
        loadScenarioB,
        resetToDefaultData,
        clearAllData,
        ingestDataset,
        importRecords,
        exportDataJSON,
        exportEntityCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
