import React from 'react';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Gauge,
  Info,
  Clock,
  Truck,
  Boxes,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ScoringBenchmarkCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { shipments, orders, suppliers, inventory } = useApp();

  const totalShipments = shipments.length;
  const delayedShipments = shipments.filter((s) => s.status === 'Delayed' || s.delayDays > 0).length;
  const onTimeShipments = Math.max(0, totalShipments - delayedShipments);
  const actualOTIF = totalShipments > 0 ? (onTimeShipments / totalShipments) * 100 : 0;
  const otifBenchmark = 95.0;

  const avgSupplierReliability = suppliers.length > 0
    ? suppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / suppliers.length
    : 0;
  const supplierBenchmark = 85.0;

  const totalOrders = orders.length;
  const highRiskOrders = orders.filter((o) => o.riskLevel === 'High').length;
  const highRiskPercent = totalOrders > 0 ? (highRiskOrders / totalOrders) * 100 : 0;
  const riskBenchmark = 8.0;

  const lowStockCount = inventory.filter((i) => i.stockStatus === 'Low Stock' || i.stockStatus === 'Out of Stock').length;
  const stockHealthPercent = inventory.length > 0
    ? Math.max(0, ((inventory.length - lowStockCount) / inventory.length) * 100)
    : 0;
  const stockHealthBenchmark = 90.0;

  const benchmarks = [
    {
      id: 'otif',
      title: 'On-Time In-Full (OTIF)',
      benchmarkText: 'Target >= 95.0%',
      targetValue: 95.0,
      actualValue: actualOTIF,
      unit: '%',
      pass: totalShipments > 0 && actualOTIF >= otifBenchmark,
      warning: totalShipments > 0 && actualOTIF < otifBenchmark && actualOTIF >= 80,
      statusLabel: totalShipments === 0 ? 'Awaiting Data (0%)' : actualOTIF >= otifBenchmark ? 'Benchmark Met' : actualOTIF >= 80 ? 'Warning (Slight Delay)' : 'Breach Alert',
      icon: Clock,
      note: 'Evaluated across Tamil Nadu expressway freight manifests (NH 48, NH 44, NH 544).',
    },
    {
      id: 'supplier',
      title: 'Supplier Reliability Index',
      benchmarkText: 'Target >= 85.0%',
      targetValue: 85.0,
      actualValue: avgSupplierReliability,
      unit: '%',
      pass: suppliers.length > 0 && avgSupplierReliability >= supplierBenchmark,
      warning: suppliers.length > 0 && avgSupplierReliability < supplierBenchmark && avgSupplierReliability >= 75,
      statusLabel: suppliers.length === 0 ? 'Awaiting Data (0%)' : avgSupplierReliability >= supplierBenchmark ? 'Certified Benchmark' : 'Under Review',
      icon: ShieldCheck,
      note: 'Weighted vendor scorecard across Tamil Nadu industrial hubs (SIPCOT, Peelamedu, Manali).',
    },
    {
      id: 'risk',
      title: 'High-Risk Order Exposure',
      benchmarkText: 'Target <= 8.0%',
      targetValue: 8.0,
      actualValue: highRiskPercent,
      unit: '%',
      pass: totalOrders > 0 && highRiskPercent <= riskBenchmark,
      warning: totalOrders > 0 && highRiskPercent > riskBenchmark && highRiskPercent <= 20,
      statusLabel: totalOrders === 0 ? 'Awaiting Data (0%)' : highRiskPercent <= riskBenchmark ? 'Within Tolerance' : 'High Risk Alert',
      reverseScale: true,
      icon: AlertTriangle,
      note: '4-factor delivery risk formula: (0.35 x Delay) + (0.30 x Inventory) + (0.20 x Supplier) + (0.15 x SLA).',
    },
    {
      id: 'buffer',
      title: 'Warehouse Safety Buffer',
      benchmarkText: 'Target >= 90.0%',
      targetValue: 90.0,
      actualValue: stockHealthPercent,
      unit: '%',
      pass: inventory.length > 0 && stockHealthPercent >= stockHealthBenchmark,
      warning: inventory.length > 0 && stockHealthPercent < stockHealthBenchmark && stockHealthPercent >= 75,
      statusLabel: inventory.length === 0 ? 'Awaiting Data (0%)' : stockHealthPercent >= stockHealthBenchmark ? 'Buffer Healthy' : 'Buffer Deficit',
      icon: Boxes,
      note: 'Monitored across 5 Tamil Nadu distribution hubs (Chennai, Coimbatore, Madurai, Hosur, Tuticorin).',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Logistics Scoring Benchmark & Compliance</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              ISO / CSCMP Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time evaluation against Tamil Nadu linehaul enterprise logistics benchmarks and threshold bands.
          </p>
        </div>

        {/* Benchmark Scoring Bands Legend */}
        <div className="flex items-center gap-2 self-start text-[11px] font-mono bg-slate-50 p-1.5 rounded border border-slate-200">
          <span className="text-slate-500 font-sans font-medium">Risk Score Bands:</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">0–30 Low</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">31–60 Med</span>
          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold">61–100 High</span>
        </div>
      </div>

      {/* Benchmark Metric Grid */}
      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-4 pt-4`}>
        {benchmarks.map((bm) => {
          const Icon = bm.icon;
          const variance = bm.actualValue - bm.targetValue;
          const isFavorable = bm.reverseScale ? variance <= 0 : variance >= 0;

          return (
            <div
              key={bm.id}
              className={`p-3.5 rounded-lg border transition-all ${
                bm.pass
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : bm.warning
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-red-200 bg-red-50/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800 truncate">{bm.title}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    bm.pass
                      ? 'bg-emerald-100 text-emerald-800'
                      : bm.warning
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {bm.statusLabel}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2 mt-1">
                <div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {bm.actualValue.toFixed(1)}
                    <span className="text-sm font-sans text-slate-500 ml-0.5">{bm.unit}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {bm.benchmarkText}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center text-[11px] font-mono font-bold ${
                      isFavorable ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {variance > 0 ? `+${variance.toFixed(1)}` : variance.toFixed(1)}{bm.unit}
                  </span>
                  <div className="text-[10px] text-slate-400">vs target</div>
                </div>
              </div>

              {/* Progress bar comparing to target */}
              <div className="mt-3">
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, Math.max(5, bm.actualValue))}%` }}
                    className={`h-full rounded-full transition-all ${
                      bm.pass ? 'bg-emerald-500' : bm.warning ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 mt-2 line-clamp-1" title={bm.note}>
                {bm.note}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
