import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Sliders,
  AlertTriangle,
  Info,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerOrder } from '../../types';

export const RiskAnalysisView: React.FC = () => {
  const { orders, products, setCurrentTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  // Interactive weight tuning
  const [delayWeight, setDelayWeight] = useState<number>(0.35);
  const [inventoryWeight, setInventoryWeight] = useState<number>(0.30);
  const [supplierWeight, setSupplierWeight] = useState<number>(0.20);
  const [priorityWeight, setPriorityWeight] = useState<number>(0.15);

  const resetWeights = () => {
    setDelayWeight(0.35);
    setInventoryWeight(0.30);
    setSupplierWeight(0.20);
    setPriorityWeight(0.15);
  };

  // Re-calculate orders dynamically if user tweaks weights in the simulator
  const evaluatedOrders = useMemo(() => {
    return orders.map((o) => {
      const dynamicScore = Math.min(
        100,
        Math.round(
          delayWeight * o.delayScore +
          inventoryWeight * o.inventoryScore +
          supplierWeight * o.supplierRiskScore +
          priorityWeight * o.customerPriorityScore
        )
      );

      let level: 'Low' | 'Medium' | 'High' = 'Low';
      if (dynamicScore >= 61) level = 'High';
      else if (dynamicScore >= 31) level = 'Medium';

      return {
        ...o,
        dynamicScore,
        dynamicLevel: level,
      };
    });
  }, [orders, delayWeight, inventoryWeight, supplierWeight, priorityWeight]);

  const filteredOrders = useMemo(() => {
    return evaluatedOrders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLevel = levelFilter === 'all' || o.dynamicLevel === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [evaluatedOrders, searchQuery, levelFilter]);

  const highRiskCount = evaluatedOrders.filter((o) => o.dynamicLevel === 'High').length;
  const mediumRiskCount = evaluatedOrders.filter((o) => o.dynamicLevel === 'Medium').length;
  const lowRiskCount = evaluatedOrders.filter((o) => o.dynamicLevel === 'Low').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Order Delivery Risk Analysis</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              Explainable AI Scoring
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent multi-factor risk quantification based on shipment delays, inventory buffers, supplier reliability, and order SLA.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('recovery')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start"
        >
          <span>Run Recovery Engine</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Formula & Explainability Banner */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold mb-1">
              Transparent Risk Formula Specification
            </div>
            <div className="text-base font-mono font-bold text-white">
              Risk Score = ({delayWeight.toFixed(2)} &times; Delay) + ({inventoryWeight.toFixed(2)} &times; Inventory) + ({supplierWeight.toFixed(2)} &times; Supplier) + ({priorityWeight.toFixed(2)} &times; Priority)
            </div>
            <p className="text-xs text-slate-400 mt-1">
              All sub-factors are normalized to a 0–100 scale: Low (0–30), Medium (31–60), High (61–100).
            </p>
          </div>

          {/* Interactive Weight Sliders Drawer */}
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs w-full lg:w-96 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                Live Weight Simulation
              </span>
              <button
                onClick={resetWeights}
                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Default (35/30/20/15)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Delay Factor</span>
                  <span className="font-mono text-white">{(delayWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={delayWeight}
                  onChange={(e) => setDelayWeight(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Stock Deficit</span>
                  <span className="font-mono text-white">{(inventoryWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={inventoryWeight}
                  onChange={(e) => setInventoryWeight(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Supplier Risk</span>
                  <span className="font-mono text-white">{(supplierWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={supplierWeight}
                  onChange={(e) => setSupplierWeight(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Customer SLA</span>
                  <span className="font-mono text-white">{(priorityWeight * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.05"
                  value={priorityWeight}
                  onChange={(e) => setPriorityWeight(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Tier Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          onClick={() => setLevelFilter(levelFilter === 'High' ? 'all' : 'High')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            levelFilter === 'High' ? 'ring-2 ring-red-500 bg-red-50/40' : 'bg-white border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-red-700 font-semibold mb-1">
            <span>High Risk (Score 61–100)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-red-600">{highRiskCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Imminent customer penalty or contract breach</div>
        </div>

        <div
          onClick={() => setLevelFilter(levelFilter === 'Medium' ? 'all' : 'Medium')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            levelFilter === 'Medium' ? 'ring-2 ring-amber-500 bg-amber-50/40' : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1">
            <span>Medium Risk (Score 31–60)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">{mediumRiskCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Tight buffer with reduced recovery window</div>
        </div>

        <div
          onClick={() => setLevelFilter(levelFilter === 'Low' ? 'all' : 'Low')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            levelFilter === 'Low' ? 'ring-2 ring-emerald-500 bg-emerald-50/40' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-1">
            <span>Low Risk (Score 0–30)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{lowRiskCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Nominal fulfillment buffers intact</div>
        </div>
      </div>

      {/* Orders Table with Risk Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name or order number..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Filter Tier:</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
              {(['all', 'High', 'Medium', 'Low'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    levelFilter === lvl
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl === 'all' ? 'All Orders' : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Order Ref</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Product Component</th>
                <th className="py-2.5 px-4">Delivery Deadline</th>
                <th className="py-2.5 px-4">Risk Level</th>
                <th className="py-2.5 px-4 text-center">Calculated Score</th>
                <th className="py-2.5 px-4">Explainable Reason for Risk</th>
                <th className="py-2.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredOrders.map((ord) => {
                const prod = products.find((p) => p.id === ord.productId);

                return (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-500">{ord.customerTier}</div>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-medium text-slate-800">{prod?.name || 'Component'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ord.quantity} units · ${ord.totalAmount.toLocaleString()}</div>
                    </td>

                    <td className="py-2.5 px-4 font-mono text-slate-800">
                      {ord.deliveryDeadline}
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          ord.dynamicLevel === 'High'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : ord.dynamicLevel === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {ord.dynamicLevel}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <div className={`font-mono font-bold text-sm ${
                        ord.dynamicLevel === 'High' ? 'text-red-600' : ord.dynamicLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {ord.dynamicScore}/100
                      </div>
                    </td>

                    <td className="py-2.5 px-4 max-w-sm">
                      <p className="text-slate-600 truncate text-[11px]" title={ord.riskReason}>
                        {ord.riskReason}
                      </p>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-[11px]"
                      >
                        Breakdown &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Risk Breakdown Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-slate-400 text-[10px] uppercase">{selectedOrder.orderNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedOrder.customerName}</h3>
                <p className="text-slate-500">Order Delivery Deadline: {selectedOrder.deliveryDeadline}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <div className="py-4 space-y-3">
              {/* Score Header */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium">Composite Risk Score</span>
                  <div className="text-2xl font-bold font-mono text-slate-900">{selectedOrder.riskScore} / 100</div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded ${
                    selectedOrder.riskLevel === 'High'
                      ? 'bg-red-600 text-white'
                      : selectedOrder.riskLevel === 'Medium'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {selectedOrder.riskLevel.toUpperCase()} RISK
                </span>
              </div>

              {/* Sub-Score Breakdown */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-800 block">Formula Factor Breakdown (0–100 scale)</span>

                <div className="p-2 border border-slate-200 rounded">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Transit Delay Score (Weight: 35%)</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOrder.delayScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${selectedOrder.delayScore}%` }} className="h-full bg-blue-600" />
                  </div>
                </div>

                <div className="p-2 border border-slate-200 rounded">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Inventory Shortage Score (Weight: 30%)</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOrder.inventoryScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${selectedOrder.inventoryScore}%` }} className="h-full bg-amber-500" />
                  </div>
                </div>

                <div className="p-2 border border-slate-200 rounded">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Supplier Reliability Deficit (Weight: 20%)</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOrder.supplierRiskScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${selectedOrder.supplierRiskScore}%` }} className="h-full bg-purple-600" />
                  </div>
                </div>

                <div className="p-2 border border-slate-200 rounded">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Customer SLA Priority (Weight: 15%)</span>
                    <span className="font-mono font-bold text-slate-900">{selectedOrder.customerPriorityScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${selectedOrder.customerPriorityScore}%` }} className="h-full bg-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Natural Language Reason */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-slate-700">
                <span className="font-semibold text-blue-900 block mb-0.5">Vulnerability Explanation:</span>
                {selectedOrder.riskReason}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setCurrentTab('recovery');
                }}
                className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
              >
                Generate Mitigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
