import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Boxes,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { shipments, orders, disruptions, recoveryPlans, suppliers, exportEntityCSV } = useApp();
  const [dateRange, setDateRange] = useState('Last 30 Days');

  // Dynamic calculations
  const totalShipments = shipments.length;
  const delayedShipments = shipments.filter((s) => s.status === 'Delayed' || s.delayDays > 0).length;
  const inTransitShipments = shipments.filter((s) => s.status === 'In Transit').length;
  const deliveredShipments = shipments.filter((s) => s.status === 'Delivered').length;
  const processingShipments = shipments.filter((s) => s.status === 'Processing' || s.status === 'Dispatched').length;

  const highRiskOrders = orders.filter((o) => o.riskLevel === 'High').length;
  const mediumRiskOrders = orders.filter((o) => o.riskLevel === 'Medium').length;
  const lowRiskOrders = orders.filter((o) => o.riskLevel === 'Low').length;

  const supplierDelayCount = disruptions.filter((d) => d.type === 'Supplier Delay').length;
  const inventoryShortageCount = disruptions.filter((d) => d.type === 'Inventory Shortage').length;
  const carrierDisruptionCount = disruptions.filter((d) => d.type === 'Carrier Disruption' || d.type === 'Port Congestion').length;

  const avgSupplierReliability = (
    suppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / suppliers.length
  ).toFixed(1);

  // Export summary report
  const handleExportSummaryCSV = () => {
    const reportData = [
      ['Metric', 'Value'],
      ['Total Shipments', totalShipments],
      ['Delivered Shipments', deliveredShipments],
      ['In Transit Shipments', inTransitShipments],
      ['Delayed Shipments', delayedShipments],
      ['High-Risk Customer Orders', highRiskOrders],
      ['Medium-Risk Customer Orders', mediumRiskOrders],
      ['Low-Risk Customer Orders', lowRiskOrders],
      ['Active Disruption Incidents', disruptions.length],
      ['Average Supplier Reliability (%)', avgSupplierReliability],
      ['Generated Timestamp', new Date().toISOString()],
    ];

    const csvContent = reportData.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rippleguard-analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Logistics Analytics & Executive Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational KPIs, multi-month trends, risk distributions, and recovery strategy performance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-300 rounded text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium focus:outline-none"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Current Quarter (Q4 2026)">Current Quarter (Q4 2026)</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>

          <button
            onClick={handleExportSummaryCSV}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px]">Total Shipments</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{totalShipments}</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px]">Delayed Shipments</div>
          <div className="text-xl font-bold font-mono text-red-600 mt-1">{delayedShipments}</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px]">Active Disruptions</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{disruptions.length}</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px]">Affected Orders</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1">
            {orders.filter((o) => o.status === 'At Risk').length}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px]">Recovery Success</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">95.6%</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 text-[11px]">Supplier Reliability</div>
          <div className="text-xl font-bold font-mono text-blue-600 mt-1">{avgSupplierReliability}%</div>
        </div>
      </div>

      {/* 6 Visual Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Shipment Status Distribution (Donut / Meter) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">1. Shipment Status Distribution</h3>
            <p className="text-[11px] text-slate-500 mb-4">Proportion across current freight fleet</p>

            <div className="flex items-center justify-center py-4">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="60" stroke="#f1f5f9" strokeWidth="20" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${(deliveredShipments / totalShipments) * 377} 377`}
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#2563eb"
                  strokeWidth="20"
                  strokeDashoffset={`-${(deliveredShipments / totalShipments) * 377}`}
                  strokeDasharray={`${(inTransitShipments / totalShipments) * 377} 377`}
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDashoffset={`-${((deliveredShipments + inTransitShipments) / totalShipments) * 377}`}
                  strokeDasharray={`${(delayedShipments / totalShipments) * 377} 377`}
                  fill="none"
                />
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-center pt-2">
              <div>
                <span className="text-emerald-700 font-bold block">{deliveredShipments}</span>
                <span className="text-slate-500">Delivered</span>
              </div>
              <div>
                <span className="text-blue-700 font-bold block">{inTransitShipments}</span>
                <span className="text-slate-500">In Transit</span>
              </div>
              <div>
                <span className="text-red-600 font-bold block">{delayedShipments}</span>
                <span className="text-slate-500">Delayed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Monthly Shipment Trends (SVG Line / Bar) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">2. Monthly Shipment Trends</h3>
            <p className="text-[11px] text-slate-500 mb-4">Completed shipments over past 6 months</p>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {[
                { month: 'May', count: 38 },
                { month: 'Jun', count: 42 },
                { month: 'Jul', count: 49 },
                { month: 'Aug', count: 45 },
                { month: 'Sep', count: 52 },
                { month: 'Oct', count: 50 },
              ].map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-700">{m.count}</span>
                  <div
                    style={{ height: `${(m.count / 60) * 110}px` }}
                    className="w-full bg-blue-600 rounded-t-sm hover:bg-blue-700 transition-all"
                  />
                  <span className="text-[10px] text-slate-500">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Disruption Distribution by Type */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">3. Disruption Distribution</h3>
            <p className="text-[11px] text-slate-500 mb-3">Root causes of recorded logistics bottlenecks</p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Supplier Delay &amp; Port Hold</span>
                  <span className="font-mono font-bold text-slate-900">45%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: '45%' }} className="h-full bg-red-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Warehouse Inventory Shortage</span>
                  <span className="font-mono font-bold text-slate-900">30%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: '30%' }} className="h-full bg-amber-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Carrier &amp; Highway Congestion</span>
                  <span className="font-mono font-bold text-slate-900">15%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: '15%' }} className="h-full bg-blue-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Quality Inspection Holds</span>
                  <span className="font-mono font-bold text-slate-900">10%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: '10%' }} className="h-full bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: Order Risk Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">4. Order Risk Distribution</h3>
            <p className="text-[11px] text-slate-500 mb-4">Formula evaluation of all 50 customer orders</p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-200">
                <span className="font-semibold text-red-900">High Risk (61–100)</span>
                <span className="font-mono font-bold text-red-700">{highRiskOrders} orders ({((highRiskOrders / 50) * 100).toFixed(0)}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-200">
                <span className="font-semibold text-amber-900">Medium Risk (31–60)</span>
                <span className="font-mono font-bold text-amber-700">{mediumRiskOrders} orders ({((mediumRiskOrders / 50) * 100).toFixed(0)}%)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-emerald-50 border border-emerald-200">
                <span className="font-semibold text-emerald-900">Low Risk (0–30)</span>
                <span className="font-mono font-bold text-emerald-700">{lowRiskOrders} orders ({((lowRiskOrders / 50) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 5: Supplier Performance Benchmark */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">5. Supplier Reliability Index</h3>
            <p className="text-[11px] text-slate-500 mb-3">Top vendor reliability scoring benchmark</p>

            <div className="space-y-2 text-xs">
              {suppliers.slice(0, 5).map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-medium text-slate-800 truncate">{s.name}</span>
                    <span className="font-mono font-bold text-slate-900">{s.reliabilityScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${s.reliabilityScore}%` }}
                      className={`h-full rounded-full ${s.reliabilityScore >= 90 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 6: Recovery Strategy Comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">6. Recovery Strategy Comparison</h3>
            <p className="text-[11px] text-slate-500 mb-3">Average turnaround days vs cost per recovered batch</p>

            <div className="space-y-2.5 text-xs pt-1">
              <div className="p-2 border border-slate-200 rounded flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-900">Inter-Warehouse Transfer</div>
                  <div className="text-[10px] text-slate-500 font-mono">1.0 Day Turnaround</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-600">$3,450 avg</div>
                  <div className="text-[10px] text-emerald-700">85% Risk Cut</div>
                </div>
              </div>

              <div className="p-2 border border-slate-200 rounded flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-900">Alternative Dual-Sourcing</div>
                  <div className="text-[10px] text-slate-500 font-mono">2.5 Days Turnaround</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-blue-600">$8,200 avg</div>
                  <div className="text-[10px] text-blue-700">74% Risk Cut</div>
                </div>
              </div>

              <div className="p-2 border border-slate-200 rounded flex justify-between items-center">
                <div>
                  <div className="font-semibold text-slate-900">Expedited Air Charter</div>
                  <div className="text-[10px] text-slate-500 font-mono">1.5 Days Turnaround</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-amber-600">$11,500 avg</div>
                  <div className="text-[10px] text-amber-700">62% Risk Cut</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
