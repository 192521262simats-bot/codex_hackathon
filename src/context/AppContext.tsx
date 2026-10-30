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

const STORAGE_KEY = 'rippleguard_ai_state_v1';

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

  // Entity Management
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
  // Load state from localStorage or initial dataset
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_warehouses`);
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [carriers, setCarriers] = useState<Carrier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_carriers`);
    return saved ? JSON.parse(saved) : INITIAL_CARRIERS;
  });

  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shipments`);
    return saved ? JSON.parse(saved) : INITIAL_SHIPMENTS;
  });

  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [disruptions, setDisruptions] = useState<Disruption[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_disruptions`);
    return saved ? JSON.parse(saved) : INITIAL_DISRUPTIONS;
  });

  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_plans`);
    return saved ? JSON.parse(saved) : INITIAL_RECOVERY_PLANS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_PROFILES[0]);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeDisruptionId, setActiveDisruptionId] = useState<string | null>('dis-1');
  const [dataProvenance, setDataProvenance] = useState<DataProvenance>({
    sourceType: 'Demonstration Dataset',
    recordCount: 50 + 50 + 20 + 10 + 5,
    lastImportedAt: '2026-10-29 08:00',
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
      localStorage.setItem(`${STORAGE_KEY}_warehouses`, JSON.stringify(warehouses));
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
      localStorage.setItem(`${STORAGE_KEY}_carriers`, JSON.stringify(carriers));
      localStorage.setItem(`${STORAGE_KEY}_shipments`, JSON.stringify(shipments));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_disruptions`, JSON.stringify(disruptions));
      localStorage.setItem(`${STORAGE_KEY}_plans`, JSON.stringify(recoveryPlans));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [suppliers, warehouses, products, inventory, carriers, shipments, orders, disruptions, recoveryPlans, notifications, auditLogs]);

  // Role switching
  const setCurrentUserRole = (role: UserRole) => {
    const found = INITIAL_USER_PROFILES.find((p) => p.role === role);
    if (found) {
      setCurrentUser(found);
      addAuditLog('User Switched Role', `Logged in as ${found.name} (${found.role})`, 'Plan', 'system');
    }
  };

  const addAuditLog = (action: string, details: string, entityType: AuditLog['entityType'], entityId: string) => {
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

    // Find affected warehouses if supplier disrupted
    if (targetType === 'supplier') {
      const invMatches = inventory.filter((inv) => affectedProductIds.includes(inv.productId));
      affectedWarehouseIds = Array.from(new Set(invMatches.map((i) => i.warehouseId)));
    }

    // Find affected shipments
    const relShipments = shipments.filter(
      (s) =>
        s.status !== 'Delivered' &&
        (affectedProductIds.includes(s.productId) ||
          (targetType === 'supplier' && s.supplierId === targetId) ||
          (targetType === 'warehouse' && s.destinationWarehouseId === targetId) ||
          (targetType === 'carrier' && s.carrierId === targetId))
    );
    affectedShipmentIds = Array.from(new Set([...affectedShipmentIds, ...relShipments.map((s) => s.id)]));

    // Find affected customer orders
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
    let targetName = 'Unknown Target';
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

    const disruptionNumber = `DIS-2026-${(100 + disruptions.length + 1).toString()}`;
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

    // Update affected shipments
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

    // Update affected orders & re-calculate formula:
    // Risk Score = (0.35 × Delay Score) + (0.30 × Inventory Score) + (0.20 × Supplier Risk Score) + (0.15 × Customer Priority Score)
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

    // Auto-generate recovery plan
    const generatedPlan = generatePlanForDisruptionObject(newDisruption);

    newDisruption.mitigationPlanId = generatedPlan.id;

    setDisruptions((prev) => [newDisruption, ...prev]);
    setRecoveryPlans((prev) => [generatedPlan, ...prev]);
    setActiveDisruptionId(newDisruptionId);

    // Create Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'disruption',
      title: `${data.severity} Disruption: ${targetName}`,
      message: `${data.type} detected affecting ${affectedOrderIds.length} orders. Plan ${generatedPlan.planNumber} generated.`,
      severity: data.severity === 'Critical' ? 'critical' : 'warning',
      timestamp: 'Just now',
      read: false,
      linkToTab: 'disruptions',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addAuditLog('Disruption Reported', `Logged ${data.type} on ${targetName}. Affected ${affectedOrderIds.length} orders.`, 'Disruption', newDisruptionId);

    return { disruption: newDisruption, plan: generatedPlan };
  };

  const generatePlanForDisruptionObject = (disr: Disruption): RecoveryPlan => {
    const planNumber = `REC-PLAN-${500 + recoveryPlans.length + 1}`;
    const planId = `plan-${Date.now()}`;

    // Intelligent decision rule logic:
    // 1. If warehouse stock shortage, check if another warehouse has surplus (> reorderLevel * 1.5)
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

    // Check inventory in other warehouses
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
      recommendedAction = `Transfer ${Math.min(surplusInv.availableQty, requiredQty)} units of ${targetProd.name} from ${sourceWh?.name || 'Secondary Depot'} to ${targetWh?.name || 'Local Hub'} via expedited freight.`;
      reason = `${sourceWh?.name} holds ${surplusInv.availableQty} available units exceeding its safety buffer. Rapid regional transfer fulfills pending customer orders without new manufacturing lead time.`;
      estimatedCost = Math.round(requiredQty * 12 + 1200);
      expectedRecoveryDays = 1;
      expectedRiskReductionPercent = 85;
      feasibility = 'High';
      availableQty = surplusInv.availableQty;
      details.sourceWarehouseId = surplusInv.warehouseId;
      details.targetWarehouseId = targetWh?.id || 'wh-1';
      details.expeditedCarrierId = 'car-5';
    } else {
      // Find alternate supplier
      const altSupplier = suppliers.find(
        (s) =>
          s.id !== disr.targetId &&
          s.status === 'Active' &&
          s.productsSupplied.includes(targetProdId) &&
          s.reliabilityScore >= 85
      );

      if (altSupplier) {
        recoveryType = 'Alternative Supplier';
        recommendedAction = `Issue priority purchase order for ${requiredQty} units of ${targetProd.name} to ${altSupplier.name} (${altSupplier.country}).`;
        reason = `${altSupplier.name} demonstrates a ${altSupplier.reliabilityScore}% reliability rating and an average lead time of ${altSupplier.avgDeliveryDays} days, fully covering the defected batch.`;
        estimatedCost = Math.round(requiredQty * targetProd.unitPrice * 1.08);
        expectedRecoveryDays = Math.max(2, altSupplier.avgDeliveryDays - 4);
        expectedRiskReductionPercent = 74;
        feasibility = 'High';
        availableQty = requiredQty + 200;
        details.alternativeSupplierId = altSupplier.id;
        details.expeditedCarrierId = 'car-2';
      } else {
        // Fallback: Expedited Delivery or Partial Splitting
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
    addAuditLog('Plan Generated', `Generated candidate recovery plan ${plan.planNumber}`, 'Plan', plan.id);
    return plan;
  };

  // What-If Simulation Engine
  const runWhatIfSimulation = (disruptionId?: string): SimulationResult[] => {
    const disr = disruptions.find((d) => d.id === (disruptionId || activeDisruptionId)) || disruptions[0];
    const affectedOrdersList = orders.filter((o) => disr?.affectedOrderIds.includes(o.id));
    const totalOrderValue = affectedOrdersList.reduce((acc, o) => acc + o.totalAmount, 0) || 120000;
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

  // Plan Approval
  const approvePlan = (planId: string) => {
    setRecoveryPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return {
            ...p,
            status: 'Approved',
            approvedBy: `${currentUser.name} (${currentUser.role})`,
            approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };
        }
        return p;
      })
    );

    const plan = recoveryPlans.find((p) => p.id === planId);
    if (plan) {
      addAuditLog('Plan Approved', `Plan ${plan.planNumber} (${plan.recoveryType}) approved by ${currentUser.name}.`, 'Plan', planId);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'approval',
          title: `Plan ${plan.planNumber} Approved`,
          message: `Manager authorized execution of ${plan.recoveryType}. Ready for live operational dispatch.`,
          severity: 'info',
          timestamp: 'Just now',
          read: false,
          linkToTab: 'approvals',
        },
        ...prev,
      ]);
    }
  };

  // Plan Rejection
  const rejectPlan = (planId: string, reason = 'Alternative operational route selected') => {
    setRecoveryPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return {
            ...p,
            status: 'Rejected',
            executionNotes: reason,
          };
        }
        return p;
      })
    );
    const plan = recoveryPlans.find((p) => p.id === planId);
    if (plan) {
      addAuditLog('Plan Rejected', `Plan ${plan.planNumber} rejected: ${reason}`, 'Plan', planId);
    }
  };

  // Plan Execution: ACTUALLY UPDATES THE SYSTEM STATE!
  const executePlan = (planId: string) => {
    const plan = recoveryPlans.find((p) => p.id === planId);
    if (!plan) return;

    // 1. If Inventory Redistribution: actually move inventory between warehouses!
    if (plan.recoveryType === 'Inventory Redistribution' && plan.details.sourceWarehouseId && plan.details.targetWarehouseId) {
      const sourceWh = plan.details.sourceWarehouseId;
      const targetWh = plan.details.targetWarehouseId;
      const transferQty = plan.requiredQty;

      setInventory((prev) =>
        prev.map((item) => {
          if (item.warehouseId === sourceWh && item.availableQty >= transferQty) {
            const newAvail = item.availableQty - transferQty;
            return {
              ...item,
              availableQty: newAvail,
              stockStatus: computeStockStatus(newAvail, item.reorderLevel),
              lastUpdated: 'Just now (Transferred out)',
            };
          }
          if (item.warehouseId === targetWh) {
            const newAvail = item.availableQty + transferQty;
            return {
              ...item,
              availableQty: newAvail,
              stockStatus: computeStockStatus(newAvail, item.reorderLevel),
              lastUpdated: 'Just now (Transferred in)',
            };
          }
          return item;
        })
      );
    }

    // 2. Update affected Shipments
    setShipments((prev) =>
      prev.map((shp) => {
        if (plan.affectedOrderIds.includes(shp.orderId)) {
          return {
            ...shp,
            status: 'In Transit',
            delayDays: 0,
            isOverdue: false,
            lastCheckpoint: `Recovery dispatched: ${plan.recoveryType}. En route for expedited delivery.`,
          };
        }
        return shp;
      })
    );

    // 3. Update affected Customer Orders: Protected & Recovered!
    setOrders((prev) =>
      prev.map((ord) => {
        if (plan.affectedOrderIds.includes(ord.id)) {
          return {
            ...ord,
            status: 'Recovered',
            riskScore: 12, // Reduced to safe low risk!
            riskLevel: 'Low',
            delayScore: 5,
            inventoryScore: 10,
            riskReason: `Protected via executed recovery plan ${plan.planNumber} (${plan.recoveryType}). Delivery guaranteed.`,
          };
        }
        return ord;
      })
    );

    // 4. Update Disruption status to Mitigated
    setDisruptions((prev) =>
      prev.map((disr) => {
        if (disr.id === plan.disruptionId) {
          return {
            ...disr,
            status: 'Mitigated',
          };
        }
        return disr;
      })
    );

    // 5. Update Plan status to Executed
    setRecoveryPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return {
            ...p,
            status: 'Executed',
            executionNotes: `Executed by ${currentUser.name} at ${new Date().toLocaleTimeString()}. Shipments updated and stock reallocated.`,
          };
        }
        return p;
      })
    );

    // Confetti celebration for supply chain recovery!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#38bdf8', '#6366f1'],
      });
    } catch (e) {
      // Ignore if canvas-confetti is not in DOM
    }

    addAuditLog(
      'Recovery Plan Executed',
      `Executed ${plan.planNumber} (${plan.recoveryType}). Reallocated ${plan.requiredQty} units and recovered ${plan.affectedOrderIds.length} orders.`,
      'Plan',
      planId
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'executed',
        title: `Recovery Executed: ${plan.planNumber}`,
        message: `Plan execution successful! ${plan.affectedOrderIds.length} customer orders protected from SLA penalty.`,
        severity: 'success',
        timestamp: 'Just now',
        read: false,
        linkToTab: 'approvals',
      },
      ...prev,
    ]);
  };

  const resolveDisruption = (id: string) => {
    setDisruptions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Resolved' } : d))
    );
    addAuditLog('Disruption Resolved', `Closed disruption record ${id}`, 'Disruption', id);
  };

  // Add / Edit Shipment
  const addShipment = (shipment: Omit<Shipment, 'id' | 'shipmentNumber' | 'isOverdue'>) => {
    const shipmentNumber = `SHP-2026-${(3000 + shipments.length + 1).toString()}`;
    const newShipment: Shipment = {
      ...shipment,
      id: `shp-${Date.now()}`,
      shipmentNumber,
      isOverdue: shipment.status === 'Delayed',
    };
    setShipments((prev) => [newShipment, ...prev]);
    addAuditLog('Shipment Created', `Added shipment ${shipmentNumber}`, 'Shipment', newShipment.id);
  };

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, isOverdue: updates.status === 'Delayed' || s.isOverdue } : s))
    );
    addAuditLog('Shipment Updated', `Modified shipment ${id}`, 'Shipment', id);
  };

  // Inventory Stock update
  const updateStock = (inventoryId: string, availableQty: number, reservedQty: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === inventoryId) {
          const safeAvail = Math.max(0, availableQty);
          const safeReserved = Math.max(0, reservedQty);
          return {
            ...item,
            availableQty: safeAvail,
            reservedQty: safeReserved,
            stockStatus: computeStockStatus(safeAvail, item.reorderLevel),
            lastUpdated: 'Just now (Manual adjustment)',
          };
        }
        return item;
      })
    );
    addAuditLog('Stock Adjusted', `Adjusted inventory item ${inventoryId} to ${availableQty} units`, 'Inventory', inventoryId);
  };

  // Notification actions
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Demo Scenarios
  const loadScenarioA = () => {
    // Scenario A: Supplier A (Global Chipsets Corp) port congestion delay
    setActiveDisruptionId('dis-1');
    setCurrentTab('disruptions');
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'disruption',
        title: 'Demonstration Scenario A Active',
        message: 'Global Chipsets Corp 3-day port delay scenario loaded. Inspect the Dependency Impact Map and AI Recovery Planner.',
        severity: 'critical',
        timestamp: 'Just now',
        read: false,
        linkToTab: 'dependencies',
      },
      ...prev,
    ]);
  };

  const loadScenarioB = () => {
    // Scenario B: Chicago Hub Shortage + Reno Pacific Gateway Surplus
    setActiveDisruptionId('dis-2');
    setCurrentTab('recovery');
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'shortage',
        title: 'Demonstration Scenario B Active',
        message: 'Warehouse 1 (Chicago) shortage vs Warehouse 2 (Reno) excess stock loaded. Inventory redistribution plan ready.',
        severity: 'warning',
        timestamp: 'Just now',
        read: false,
        linkToTab: 'recovery',
      },
      ...prev,
    ]);
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
      sourceType: 'Demonstration Dataset',
      recordCount: 50 + 50 + 20 + 10 + 5,
      lastImportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });
    localStorage.clear();
    addAuditLog('System Reset', 'Reset all records to initial demonstration baseline.', 'Disruption', 'all');
  };

  // CSV/JSON Data Import with Validation
  const importRecords = (
    entityType: 'orders' | 'shipments' | 'inventory' | 'suppliers',
    data: any[],
    sourceName: string
  ) => {
    const errors: string[] = [];
    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, importedCount: 0, errors: ['File contains no valid record rows.'] };
    }

    let importedCount = 0;

    if (entityType === 'orders') {
      const validOrders: CustomerOrder[] = [];
      data.forEach((row, idx) => {
        if (!row.customerName || !row.productId) {
          errors.push(`Row ${idx + 1}: Missing customerName or productId`);
          return;
        }
        const qty = Number(row.quantity) || 10;
        const total = Number(row.totalAmount) || qty * 100;
        const newOrder: CustomerOrder = {
          id: row.id || `ord-imp-${Date.now()}-${idx}`,
          orderNumber: row.orderNumber || `ORD-IMP-${2000 + idx}`,
          customerName: String(row.customerName),
          customerTier: row.customerTier || 'Standard',
          productId: String(row.productId),
          quantity: qty,
          unitPrice: Number(row.unitPrice) || 100,
          totalAmount: total,
          orderDate: row.orderDate || new Date().toISOString().split('T')[0],
          deliveryDeadline: row.deliveryDeadline || '2026-11-15',
          status: row.status || 'Pending',
          priority: row.priority || 'Medium',
          riskScore: Number(row.riskScore) || 20,
          riskLevel: (row.riskScore || 20) > 60 ? 'High' : (row.riskScore || 20) > 30 ? 'Medium' : 'Low',
          delayScore: Number(row.delayScore) || 0,
          inventoryScore: Number(row.inventoryScore) || 10,
          supplierRiskScore: Number(row.supplierRiskScore) || 15,
          customerPriorityScore: 50,
          riskReason: row.riskReason || 'Operational baseline imported.',
          targetWarehouseId: row.targetWarehouseId || 'wh-1',
        };
        validOrders.push(newOrder);
        importedCount++;
      });
      if (validOrders.length > 0) {
        setOrders(validOrders);
      }
    } else if (entityType === 'shipments') {
      const validShipments: Shipment[] = [];
      data.forEach((row, idx) => {
        if (!row.productId || !row.destinationLocation) {
          errors.push(`Row ${idx + 1}: Missing productId or destination`);
          return;
        }
        validShipments.push({
          id: row.id || `shp-imp-${Date.now()}-${idx}`,
          shipmentNumber: row.shipmentNumber || `SHP-IMP-${4000 + idx}`,
          orderId: row.orderId || `ord-${idx + 1}`,
          productId: row.productId,
          supplierId: row.supplierId || 'sup-1',
          carrierId: row.carrierId || 'car-1',
          originLocation: row.originLocation || 'Supplier Depot',
          destinationWarehouseId: row.destinationWarehouseId || 'wh-1',
          destinationLocation: row.destinationLocation,
          expectedDelivery: row.expectedDelivery || '2026-11-05',
          actualDelivery: row.actualDelivery,
          status: row.status || 'In Transit',
          delayDays: Number(row.delayDays) || 0,
          trackingNumber: row.trackingNumber || `TRK-${Date.now()}-${idx}`,
          lastCheckpoint: row.lastCheckpoint || 'Imported manifest checkpoint',
          isOverdue: row.status === 'Delayed',
        });
        importedCount++;
      });
      if (validShipments.length > 0) {
        setShipments(validShipments);
      }
    }

    if (importedCount > 0) {
      setDataProvenance({
        sourceType: 'Imported Dataset',
        lastImportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        recordCount: importedCount,
        sourceFile: sourceName,
      });
      addAuditLog(
        'Data Imported',
        `Imported ${importedCount} records into ${entityType} from ${sourceName}`,
        'Order',
        'import'
      );
    }

    return { success: importedCount > 0, importedCount, errors };
  };

  // Export JSON
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

  // Export CSV
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
        addShipment,
        updateShipment,
        updateStock,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        loadScenarioA,
        loadScenarioB,
        resetToDefaultData,
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
