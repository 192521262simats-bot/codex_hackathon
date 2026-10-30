import React, { useState } from 'react';
import {
  BrainCircuit,
  Boxes,
  Building2,
  Plane,
  Split,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Send,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RecoveryPlan, RecoveryType } from '../../types';

export const RecoveryPlannerView: React.FC = () => {
  const {
    disruptions,
    activeDisruptionId,
    setActiveDisruptionId,
    recoveryPlans,
    inventory,
    suppliers,
    warehouses,
    orders,
    products,
    approvePlan,
    executePlan,
    setCurrentTab,
    currentUser,
  } = useApp();

  const currentDisruption = disruptions.find((d) => d.id === activeDisruptionId) || disruptions[0];
  const affectedOrdersList = orders.filter((o) => currentDisruption?.affectedOrderIds.includes(o.id));
  const targetProdId = currentDisruption?.productId || (currentDisruption?.affectedProductIds[0] || 'prod-1');
  const targetProd = products.find((p) => p.id === targetProdId) || products[0];

  // Evaluate candidate recovery strategies based on actual resources
  // Strategy 1: Inventory Redistribution
  const surplusStock = inventory.find(
    (inv) =>
      inv.productId === targetProdId &&
      inv.warehouseId !== currentDisruption?.targetId &&
      inv.availableQty >= (currentDisruption?.affectedQuantity || 300) * 0.5
  );
  const sourceWh = warehouses.find((w) => w.id === surplusStock?.warehouseId);
  const destWh = warehouses.find((w) => w.id === (currentDisruption?.affectedWarehouseIds[0] || 'wh-1'));

  const redistributionFeasible = Boolean(surplusStock && surplusStock.availableQty > 200);

  // Strategy 2: Alternative Supplier
  const altSuppliers = suppliers.filter(
    (s) =>
      s.id !== currentDisruption?.targetId &&
      s.status === 'Active' &&
      s.productsSupplied.includes(targetProdId)
  );
  const bestAltSupplier = altSuppliers.sort((a, b) => b.reliabilityScore - a.reliabilityScore)[0];
  const altSupplierFeasible = Boolean(bestAltSupplier);

  // Strategy 3: Expedited Air Cargo Charter
  const airCargoFeasible = true;

  // Strategy 4: Partial Order Splitting
  const splittingFeasible = affectedOrdersList.length > 1;

  // Candidate options list
  const strategies = [
    {
      type: 'Inventory Redistribution' as RecoveryType,
      title: 'Inter-Warehouse Inventory Redistribution',
      icon: Boxes,
      isBestMatch: redistributionFeasible && (currentDisruption?.type === 'Inventory Shortage' || surplusStock?.availableQty! > 500),
      action: redistributionFeasible
        ? `Reallocate ${Math.min(surplusStock!.availableQty, currentDisruption?.affectedQuantity || 300)} units of ${targetProd.name} from ${sourceWh?.name || 'Reno Gateway'} to ${destWh?.name || 'Chicago Hub'}.`
        : `No regional warehouse holds surplus stock for ${targetProd.name} above safety threshold.`,
      reason: redistributionFeasible
        ? `${sourceWh?.name} holds ${surplusStock!.availableQty} available units exceeding its safety buffer. Rapid regional transfer fulfills pending customer orders without new manufacturing lead time.`
        : 'Safety buffers in other depots are fully allocated to local contracts.',
      requiredQty: currentDisruption?.affectedQuantity || 300,
      availableQty: surplusStock ? surplusStock.availableQty : 0,
      cost: redistributionFeasible ? Math.round((currentDisruption?.affectedQuantity || 300) * 11.5 + 1200) : 0,
      recoveryDays: 1,
      riskReduction: 85,
      feasibility: redistributionFeasible ? ('High' as const) : ('Low' as const),
    },
    {
      type: 'Alternative Supplier' as RecoveryType,
      title: 'Dual-Sourcing Alternative Supplier Order',
      icon: Building2,
      isBestMatch: !redistributionFeasible && altSupplierFeasible,
      action: altSupplierFeasible
        ? `Issue priority purchase order for ${currentDisruption?.affectedQuantity || 300} units of ${targetProd.name} to ${bestAltSupplier.name} (${bestAltSupplier.country}).`
        : `No verified active secondary supplier on file for ${targetProd.sku}.`,
      reason: altSupplierFeasible
        ? `${bestAltSupplier.name} demonstrates a ${bestAltSupplier.reliabilityScore}% reliability rating with average lead time of ${bestAltSupplier.avgDeliveryDays} days, fully covering the defected batch.`
        : 'Single-source dependency restricts immediate procurement reallocation.',
      requiredQty: currentDisruption?.affectedQuantity || 300,
      availableQty: altSupplierFeasible ? (currentDisruption?.affectedQuantity || 300) + 200 : 0,
      cost: altSupplierFeasible ? Math.round((currentDisruption?.affectedQuantity || 300) * targetProd.unitPrice * 1.08) : 0,
      recoveryDays: altSupplierFeasible ? Math.max(2, bestAltSupplier.avgDeliveryDays - 5) : 10,
      riskReduction: 74,
      feasibility: altSupplierFeasible ? ('High' as const) : ('Low' as const),
    },
    {
      type: 'Expedited Delivery' as RecoveryType,
      title: 'Expedited Linehaul Air Freight Upgrade',
      icon: Plane,
      isBestMatch: false,
      action: `Upgrade in-transit containers to SwiftLine Air Cargo dedicated charter, bypassing port dwell.`,
      reason: `Expedited air charter eliminates marine container congestion, cutting 3 critical days from the customer delivery window.`,
      requiredQty: currentDisruption?.affectedQuantity || 300,
      availableQty: currentDisruption?.affectedQuantity || 300,
      cost: Math.round((currentDisruption?.affectedQuantity || 300) * 28 + 2500),
      recoveryDays: 2,
      riskReduction: 62,
      feasibility: 'Medium' as const,
    },
    {
      type: 'Partial Order Splitting' as RecoveryType,
      title: 'Partial SLA Order Splitting',
      icon: Split,
      isBestMatch: false,
      action: `Immediately dispatch 40% initial batch from staging buffer to Tier 1 Enterprise accounts, deferring balance by 4 days.`,
      reason: `Satisfies critical manufacturing line continuity for high-tier accounts while secondary shipment clears customs.`,
      requiredQty: currentDisruption?.affectedQuantity || 300,
      availableQty: Math.round((currentDisruption?.affectedQuantity || 300) * 0.4),
      cost: 1800,
      recoveryDays: 1,
      riskReduction: 55,
      feasibility: splittingFeasible ? ('High' as const) : ('Medium' as const),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Recovery Planner</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              Transparent Decision Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic strategy synthesis based on live warehouse inventory, vendor reliability, and SLA penalties.
          </p>
        </div>

        {/* Disruption Target Selector */}
        <div className="flex items-center gap-2 self-start">
          <span className="text-xs text-slate-500 font-medium">Target Disruption:</span>
          <select
            value={currentDisruption?.id}
            onChange={(e) => setActiveDisruptionId(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900 font-medium"
          >
            {disruptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.disruptionNumber} · {d.type} ({d.targetName.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Disruption Context Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="font-mono font-bold text-red-400">{currentDisruption?.disruptionNumber}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">{currentDisruption?.type}</span>
            <span className="text-slate-500">·</span>
            <span className="font-semibold text-white">{currentDisruption?.targetName}</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-1 max-w-2xl">{currentDisruption?.description}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div>
            <div className="text-slate-400 text-[10px]">AFFECTED ORDERS</div>
            <div className="text-lg font-bold text-white">{affectedOrdersList.length} Orders</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">CARGO DEFICIT</div>
            <div className="text-lg font-bold text-amber-400">{currentDisruption?.affectedQuantity} Units</div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">EXPECTED DELAY</div>
            <div className="text-lg font-bold text-red-400">+{currentDisruption?.delayDays} Days</div>
          </div>
        </div>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strat, idx) => {
          const Icon = strat.icon;
          const isHighFeas = strat.feasibility === 'High';

          return (
            <div
              key={idx}
              className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                strat.isBestMatch
                  ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        strat.isBestMatch ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{strat.title}</h3>
                      <div className="text-[10px] font-mono text-slate-500">{strat.type}</div>
                    </div>
                  </div>

                  {strat.isBestMatch && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                {/* Recommended Action */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Operational Action
                  </div>
                  <div className="font-semibold text-slate-900">{strat.action}</div>
                  <div className="text-slate-600 text-[11px] mt-1.5">{strat.reason}</div>
                </div>

                {/* Quantitative Metric Grid */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-xs text-center">
                  <div>
                    <div className="text-[10px] text-slate-500">Est. Extra Cost</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      ${strat.cost.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500">Recovery Time</div>
                    <div className="text-sm font-bold font-mono text-slate-900">
                      {strat.recoveryDays} {strat.recoveryDays === 1 ? 'Day' : 'Days'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500">Risk Reduction</div>
                    <div className="text-sm font-bold font-mono text-emerald-600">
                      -{strat.riskReduction}%
                    </div>
                  </div>
                </div>

                {/* Resource Feasibility */}
                <div className="flex items-center justify-between text-xs pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Resource Feasibility:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        strat.feasibility === 'High'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : strat.feasibility === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {strat.feasibility}
                    </span>
                  </div>

                  <div className="text-slate-500 font-mono text-[11px]">
                    Avail: <strong className="text-slate-800">{strat.availableQty}</strong> / Req: <strong className="text-slate-800">{strat.requiredQty}</strong>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentTab('simulator')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Simulate What-If &rarr;
                </button>

                <button
                  onClick={() => setCurrentTab('approvals')}
                  disabled={strat.feasibility === 'Low'}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-xs transition-colors flex items-center gap-1.5 ${
                    strat.feasibility === 'Low'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : strat.isBestMatch
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-900 text-white'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Manager Approval</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
