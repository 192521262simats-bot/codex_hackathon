import React, { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  Users,
  ShieldAlert,
  Flame,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  BrainCircuit,
  Clock,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Play,
  RotateCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    shipments,
    orders,
    disruptions,
    recoveryPlans,
    executePlan,
    setCurrentTab,
    setActiveDisruptionId,
    reportDisruption,
    suppliers,
    warehouses,
    carriers,
  } = useApp();

  const [showReportModal, setShowReportModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Supplier Delay' as any,
    targetType: 'supplier' as any,
    targetId: suppliers[0]?.id || 'sup-1',
    productId: 'prod-1',
    delayDays: 3,
    affectedQuantity: 500,
    severity: 'Major' as any,
    description: 'Port container congestion and customs hold causing outbound delay.',
  });

  // Calculate dynamic KPIs
  const totalShipments = shipments.length;
  const delayedShipments = shipments.filter((s) => s.status === 'Delayed' || s.delayDays > 0).length;
  const affectedOrders = orders.filter((o) => o.status === 'At Risk' || o.riskLevel === 'High').length;
  const highRiskOrders = orders.filter((o) => o.riskLevel === 'High').length;
  const activeDisruptions = disruptions.filter((d) => d.status === 'Active').length;
  const executedPlansCount = recoveryPlans.filter((p) => p.status === 'Executed').length;
  const totalClosedPlans = recoveryPlans.filter((p) => p.status === 'Executed' || p.status === 'Rejected').length;
  const recoverySuccessRate = totalClosedPlans > 0
    ? ((executedPlansCount / totalClosedPlans) * 100).toFixed(1)
    : '95.6';

  // Shipment breakdown
  const deliveredShipments = shipments.filter((s) => s.status === 'Delivered').length;
  const inTransitShipments = shipments.filter((s) => s.status === 'In Transit').length;
  const processingShipments = shipments.filter((s) => s.status === 'Processing' || s.status === 'Dispatched').length;

  // Order Risk breakdown
  const lowRiskOrders = orders.filter((o) => o.riskLevel === 'Low').length;
  const mediumRiskOrders = orders.filter((o) => o.riskLevel === 'Medium').length;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportDisruption(formData);
    setShowReportModal(false);
    setCurrentTab('dependencies');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Supply Chain Control Tower
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time disruption telemetry, order vulnerability modeling, and automated recovery actions.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setCurrentTab('data')}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Data</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>Report Disruption</span>
          </button>
          <button
            onClick={() => setCurrentTab('risk')}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Analyze Orders</span>
          </button>
          <button
            onClick={() => setCurrentTab('recovery')}
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
            <span>Generate Recovery</span>
          </button>
        </div>
      </div>

      {/* 6 Core KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Shipments */}
        <div
          onClick={() => setCurrentTab('shipments')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-400 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Shipments</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalShipments}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>{inTransitShipments} en route</span>
            <span aria-hidden="true">·</span>
            <span>{deliveredShipments} complete</span>
          </div>
        </div>

        {/* 2. Delayed Shipments */}
        <div
          onClick={() => setCurrentTab('shipments')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-red-400 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Delayed Shipments</span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono tabular-nums">{delayedShipments}</div>
          <div className="text-[11px] text-red-600 mt-1 font-medium">
            Requires active tracking
          </div>
        </div>

        {/* 3. Affected Customer Orders */}
        <div
          onClick={() => setCurrentTab('risk')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Affected Orders</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">{affectedOrders}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {orders.length} active orders
          </div>
        </div>

        {/* 4. High-Risk Orders */}
        <div
          onClick={() => setCurrentTab('risk')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-red-400 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">High-Risk Orders</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono tabular-nums">{highRiskOrders}</div>
          <div className="text-[11px] text-red-600 mt-1">
            Score &ge; 61/100 threshold
          </div>
        </div>

        {/* 5. Active Disruptions */}
        <div
          onClick={() => setCurrentTab('disruptions')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-red-400 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Disruptions</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{activeDisruptions}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Triggering dependency ripple
          </div>
        </div>

        {/* 6. Recovery Success Rate */}
        <div
          onClick={() => setCurrentTab('approvals')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Recovery Success</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">{recoverySuccessRate}%</div>
          <div className="text-[11px] text-emerald-700 mt-1">
            {executedPlansCount} plans executed
          </div>
        </div>
      </div>

      {/* Main Grid: Sections A & B & C & D */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop): Recent Disruptions & Shipment Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Recent Disruptions */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Active Supply Disruptions</h2>
                <p className="text-[11px] text-slate-500">Live operational events impacting fulfillment schedules</p>
              </div>
              <button
                onClick={() => setCurrentTab('disruptions')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View Center</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {disruptions.slice(0, 3).map((disr) => (
                <div key={disr.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{disr.disruptionNumber}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-semibold text-slate-800">{disr.type}</span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          disr.severity === 'Critical'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {disr.severity}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{disr.reportedAt}</span>
                  </div>

                  <p className="text-xs text-slate-600 mb-2 line-clamp-2">{disr.description}</p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>Target: <strong className="text-slate-800">{disr.targetName}</strong></span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline">Delay: <strong className="text-red-600 font-mono">+{disr.delayDays} Days</strong></span>
                      <span>·</span>
                      <span>Affected Orders: <strong className="text-slate-800 font-mono">{disr.affectedOrderIds.length}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveDisruptionId(disr.id);
                          setCurrentTab('dependencies');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
                      >
                        <span>Map Impact</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Shipment Performance */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Shipment Fleet Performance</h2>
                <p className="text-[11px] text-slate-500">Logistics dispatch status and on-time transit ratios</p>
              </div>
              <button
                onClick={() => setCurrentTab('shipments')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Manage Shipments &rarr;
              </button>
            </div>

            {/* Horizontal progress bar */}
            <div className="space-y-3">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(deliveredShipments / totalShipments) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Delivered: ${deliveredShipments}`}
                />
                <div
                  style={{ width: `${(inTransitShipments / totalShipments) * 100}%` }}
                  className="bg-blue-600 h-full"
                  title={`In Transit: ${inTransitShipments}`}
                />
                <div
                  style={{ width: `${(processingShipments / totalShipments) * 100}%` }}
                  className="bg-slate-400 h-full"
                  title={`Processing: ${processingShipments}`}
                />
                <div
                  style={{ width: `${(delayedShipments / totalShipments) * 100}%` }}
                  className="bg-red-500 h-full"
                  title={`Delayed: ${delayedShipments}`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-100">
                  <div className="text-[11px] text-emerald-800 font-medium">Delivered</div>
                  <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums">{deliveredShipments}</div>
                  <div className="text-[10px] text-emerald-600 font-mono">{((deliveredShipments / totalShipments) * 100).toFixed(0)}% of total</div>
                </div>

                <div className="p-2.5 rounded bg-blue-50 border border-blue-100">
                  <div className="text-[11px] text-blue-800 font-medium">In Transit</div>
                  <div className="text-lg font-bold text-blue-700 font-mono tabular-nums">{inTransitShipments}</div>
                  <div className="text-[10px] text-blue-600 font-mono">{((inTransitShipments / totalShipments) * 100).toFixed(0)}% on road/air</div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-700 font-medium">Processing</div>
                  <div className="text-lg font-bold text-slate-700 font-mono tabular-nums">{processingShipments}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{((processingShipments / totalShipments) * 100).toFixed(0)}% staging</div>
                </div>

                <div className="p-2.5 rounded bg-red-50 border border-red-100">
                  <div className="text-[11px] text-red-800 font-medium">Delayed</div>
                  <div className="text-lg font-bold text-red-600 font-mono tabular-nums">{delayedShipments}</div>
                  <div className="text-[10px] text-red-500 font-mono">{((delayedShipments / totalShipments) * 100).toFixed(0)}% overdue</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Risk Overview & Recovery Activities */}
        <div className="space-y-6">
          {/* Section C: Order Risk Overview */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Order Risk Distribution</h2>
                <p className="text-[11px] text-slate-500">Calculated via multi-factor delivery risk formula</p>
              </div>
              <button
                onClick={() => setCurrentTab('risk')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Inspect
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-red-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    High Risk (&ge;61)
                  </span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">{highRiskOrders} orders</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(highRiskOrders / orders.length) * 100}%` }}
                    className="h-full bg-red-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Medium Risk (31–60)
                  </span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">{mediumRiskOrders} orders</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(mediumRiskOrders / orders.length) * 100}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Low Risk (0–30)
                  </span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">{lowRiskOrders} orders</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(lowRiskOrders / orders.length) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Formula: <span className="font-mono text-slate-700">(0.35×Delay) + (0.30×Stock) + (0.20×Supplier) + (0.15×Priority)</span>
            </div>
          </div>

          {/* Section D: Recovery Activities */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recovery Pipeline</h2>
                <p className="text-[11px] text-slate-500">Active decision recommendations & authorizations</p>
              </div>
              <button
                onClick={() => setCurrentTab('approvals')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Approvals &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {recoveryPlans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-900">{plan.planNumber}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        plan.status === 'Executed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : plan.status === 'Approved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-800 mb-1">{plan.recoveryType}</div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">{plan.recommendedAction}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Est. Cost: <strong className="text-slate-800 font-mono">${plan.estimatedCost.toLocaleString()}</strong></span>
                    {plan.status === 'Approved' ? (
                      <button
                        onClick={() => executePlan(plan.id)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[10px] flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Execute Now</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentTab('approvals')}
                        className="text-blue-600 hover:underline font-medium text-[11px]"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disruption Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Report Supply Chain Disruption</h3>
                <p className="text-slate-500 text-[11px]">Submitting triggers ripple calculation and recovery planning</p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disruption Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                >
                  <option value="Supplier Delay">Supplier Delay</option>
                  <option value="Inventory Shortage">Inventory Shortage</option>
                  <option value="Carrier Disruption">Carrier Disruption</option>
                  <option value="Port Congestion">Port Congestion</option>
                  <option value="Quality Hold">Quality Hold</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Affected Entity Type</label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      const firstId = newType === 'supplier' ? suppliers[0]?.id : newType === 'warehouse' ? warehouses[0]?.id : carriers[0]?.id;
                      setFormData({ ...formData, targetType: newType, targetId: firstId || '' });
                    }}
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                  >
                    <option value="supplier">Supplier</option>
                    <option value="warehouse">Warehouse Hub</option>
                    <option value="carrier">Logistics Carrier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Entity</label>
                  <select
                    value={formData.targetId}
                    onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                  >
                    {formData.targetType === 'supplier' &&
                      suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.country})</option>
                      ))}
                    {formData.targetType === 'warehouse' &&
                      warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                      ))}
                    {formData.targetType === 'carrier' &&
                      carriers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.transportMode})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delay Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.delayDays}
                    onChange={(e) => setFormData({ ...formData, delayDays: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Affected Quantity</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={formData.affectedQuantity}
                    onChange={(e) => setFormData({ ...formData, affectedQuantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Major">Major</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the operational cause (e.g. berth congestion, severe weather, equipment malfunction)..."
                  className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm"
                >
                  Log Disruption & Map Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
