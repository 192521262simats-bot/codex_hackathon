import React, { useState, useMemo } from 'react';
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
  Search,
  RotateCcw,
  Layers,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScoringBenchmarkCard } from '../common/ScoringBenchmarkCard';

export const ReportsView: React.FC = () => {
  const { shipments, orders, disruptions, recoveryPlans, suppliers, setCurrentTab, setActiveDisruptionId } = useApp();

  // Date-wise & Search Filters State
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntityTab, setSelectedEntityTab] = useState<'orders' | 'shipments' | 'disruptions'>('orders');

  const setPresetRange = (preset: 'all' | 'today' | '7days' | '30days' | 'oct2026' | 'nov2026') => {
    if (preset === 'all') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'today') {
      const today = '2026-10-30';
      setFromDate(today);
      setToDate(today);
    } else if (preset === '7days') {
      setFromDate('2026-10-23');
      setToDate('2026-10-30');
    } else if (preset === '30days') {
      setFromDate('2026-10-01');
      setToDate('2026-10-31');
    } else if (preset === 'oct2026') {
      setFromDate('2026-10-01');
      setToDate('2026-10-31');
    } else if (preset === 'nov2026') {
      setFromDate('2026-11-01');
      setToDate('2026-11-30');
    }
  };

  const clearAllFilters = () => {
    setFromDate('');
    setToDate('');
    setSearchQuery('');
  };

  // Date & query filtered records
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Date filter
      if (fromDate) {
        if (o.orderDate < fromDate && o.deliveryDeadline < fromDate) return false;
      }
      if (toDate) {
        if (o.orderDate > toDate && o.deliveryDeadline > toDate) return false;
      }
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.productId.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q) ||
          o.riskLevel.toLowerCase().includes(q) ||
          o.orderDate.toLowerCase().includes(q) ||
          o.deliveryDeadline.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [orders, fromDate, toDate, searchQuery]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      if (fromDate) {
        if (s.expectedDelivery < fromDate && (!s.actualDelivery || s.actualDelivery < fromDate)) return false;
      }
      if (toDate) {
        if (s.expectedDelivery > toDate && (!s.actualDelivery || s.actualDelivery > toDate)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          s.shipmentNumber.toLowerCase().includes(q) ||
          s.trackingNumber.toLowerCase().includes(q) ||
          s.originLocation.toLowerCase().includes(q) ||
          s.destinationLocation.toLowerCase().includes(q) ||
          s.status.toLowerCase().includes(q) ||
          s.expectedDelivery.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [shipments, fromDate, toDate, searchQuery]);

  const filteredDisruptions = useMemo(() => {
    return disruptions.filter((d) => {
      const datePart = d.reportedAt.split(' ')[0];
      if (fromDate && datePart < fromDate) return false;
      if (toDate && datePart > toDate) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          d.disruptionNumber.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.targetName.toLowerCase().includes(q) ||
          d.severity.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.status.toLowerCase().includes(q) ||
          d.reportedAt.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [disruptions, fromDate, toDate, searchQuery]);

  // Dynamically calculate KPIs based on filtered datasets
  const totalShipments = filteredShipments.length;
  const delayedShipments = filteredShipments.filter((s) => s.status === 'Delayed' || s.delayDays > 0).length;
  const inTransitShipments = filteredShipments.filter((s) => s.status === 'In Transit').length;
  const deliveredShipments = filteredShipments.filter((s) => s.status === 'Delivered').length;

  const totalFilteredOrders = filteredOrders.length;
  const highRiskOrders = filteredOrders.filter((o) => o.riskLevel === 'High').length;
  const mediumRiskOrders = filteredOrders.filter((o) => o.riskLevel === 'Medium').length;
  const lowRiskOrders = filteredOrders.filter((o) => o.riskLevel === 'Low').length;

  const avgSupplierReliability = suppliers.length > 0
    ? (suppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / suppliers.length).toFixed(1)
    : '0.0';

  const closedPlans = recoveryPlans.filter((p) => p.status === 'Executed' || p.status === 'Rejected');
  const recoverySuccess = closedPlans.length > 0
    ? ((recoveryPlans.filter((p) => p.status === 'Executed').length / closedPlans.length) * 100).toFixed(1)
    : '0.0';

  // Export filtered summary report
  const handleExportFilteredCSV = () => {
    const reportData = [
      ['RippleGuard AI - Analytics & Operational Report (Tamil Nadu Logistics Network)'],
      ['Date Range Filter', fromDate || toDate ? `${fromDate || 'Beginning'} to ${toDate || 'Present'}` : 'All Recorded Dates'],
      ['Search Filter', searchQuery || 'None'],
      ['Generated Timestamp', new Date().toISOString()],
      [''],
      ['Operational Metric', 'Filtered Count / Score'],
      ['Total Shipments', totalShipments],
      ['Delivered Shipments', deliveredShipments],
      ['In Transit Shipments', inTransitShipments],
      ['Delayed Shipments', delayedShipments],
      ['Total Evaluated Customer Orders', totalFilteredOrders],
      ['High-Risk Customer Orders', highRiskOrders],
      ['Medium-Risk Customer Orders', mediumRiskOrders],
      ['Low-Risk Customer Orders', lowRiskOrders],
      ['Active Disruption Incidents', filteredDisruptions.length],
      ['Average Supplier Reliability (%)', avgSupplierReliability],
      ['Recovery Plan Success Rate (%)', `${recoverySuccess}%`],
    ];

    const csvContent = reportData.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rippleguard-tamil-nadu-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isFilteringActive = !!fromDate || !!toDate || !!searchQuery;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Date Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tamil Nadu Logistics Analytics & Reports</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              Corridor Telematics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational KPIs, scoring benchmark adherence, and date-wise search across Tamil Nadu highway shipments and customer orders.
          </p>
        </div>

        <button
          onClick={handleExportFilteredCSV}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Date-Wise Search & Filter Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Text Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search date (e.g. 2026-10-28), order #, customer, city, status, SKU..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-md border border-slate-300">
              <span className="text-slate-500 font-medium">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-md border border-slate-300">
              <span className="text-slate-500 font-medium">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-800"
              />
            </div>

            {isFilteringActive && (
              <button
                onClick={clearAllFilters}
                className="px-2.5 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center gap-1 font-medium transition-colors"
                title="Reset all date and text filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Date Presets Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 text-[11px]">
          <span className="text-slate-400 font-medium">Quick Dates:</span>
          <button
            onClick={() => setPresetRange('all')}
            className={`px-2 py-0.5 rounded font-medium ${
              !fromDate && !toDate ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Records
          </button>
          <button
            onClick={() => setPresetRange('today')}
            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
          >
            Today (30 Oct)
          </button>
          <button
            onClick={() => setPresetRange('7days')}
            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPresetRange('30days')}
            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setPresetRange('oct2026')}
            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
          >
            October 2026
          </button>
          <button
            onClick={() => setPresetRange('nov2026')}
            className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
          >
            November 2026
          </button>

          {isFilteringActive && (
            <span className="ml-auto text-blue-600 font-medium font-mono text-[11px]">
              Matching: {filteredOrders.length} orders &bull; {filteredShipments.length} shipments &bull; {filteredDisruptions.length} disruptions
            </span>
          )}
        </div>
      </div>

      {/* Scoring Benchmark Scorecard */}
      <ScoringBenchmarkCard />

      {/* KPI Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-[11px]">Shipments in Scope</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{totalShipments}</div>
          <span className="text-[10px] text-slate-400">{deliveredShipments} delivered</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-[11px]">Delayed Shipments</div>
          <div className="text-xl font-bold font-mono text-red-600 mt-1">{delayedShipments}</div>
          <span className="text-[10px] text-red-600 font-medium">Corridor holds</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-[11px]">Active Disruptions</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{filteredDisruptions.length}</div>
          <span className="text-[10px] text-slate-400">Recorded events</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-[11px]">High-Risk Orders</div>
          <div className="text-xl font-bold font-mono text-amber-600 mt-1">{highRiskOrders}</div>
          <span className="text-[10px] text-slate-400">Score &gt;= 61/100</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-[11px]">Recovery Success</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">{recoverySuccess}%</div>
          <span className="text-[10px] text-emerald-600 font-medium">Plan execution</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-[11px]">Supplier Score</div>
          <div className="text-xl font-bold font-mono text-blue-600 mt-1">{avgSupplierReliability}%</div>
          <span className="text-[10px] text-slate-400">TN vendor avg</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Shipment Status Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">1. Shipment Status Distribution</h3>
            <p className="text-[11px] text-slate-500 mb-4">Current fleet breakdown across Tamil Nadu highways</p>

            <div className="flex items-center justify-center py-4">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="60" stroke="#f1f5f9" strokeWidth="20" fill="none" />
                {totalShipments > 0 && (
                  <>
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
                  </>
                )}
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

        {/* Chart 2: Monthly Trends in Tamil Nadu Corridor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">2. Tamil Nadu Corridor Throughput</h3>
            <p className="text-[11px] text-slate-500 mb-4">Completed shipments over past 6 months</p>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {[
                { month: 'May', count: 38 },
                { month: 'Jun', count: 42 },
                { month: 'Jul', count: 49 },
                { month: 'Aug', count: 45 },
                { month: 'Sep', count: 52 },
                { month: 'Oct', count: totalShipments > 0 ? totalShipments : 50 },
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

        {/* Chart 3: Disruption Distribution by Root Cause */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">3. Disruption Root Causes</h3>
            <p className="text-[11px] text-slate-500 mb-3">Tamil Nadu arterial bottleneck analysis</p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>NH 48 / NH 44 Highway Inundation</span>
                  <span className="font-mono font-bold text-slate-900">50%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: '50%' }} className="h-full bg-red-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Hub Inventory Shortage (Oragadam)</span>
                  <span className="font-mono font-bold text-slate-900">30%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: '30%' }} className="h-full bg-amber-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Carrier &amp; FASTag Gantry Holds</span>
                  <span className="font-mono font-bold text-slate-900">12%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: '12%' }} className="h-full bg-blue-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>VOC Port Container Berth Hold</span>
                  <span className="font-mono font-bold text-slate-900">8%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: '8%' }} className="h-full bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date-Wise Interactive Records Explorer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Tab Selector */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedEntityTab('orders')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                selectedEntityTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Filtered Customer Orders ({filteredOrders.length})
            </button>
            <button
              onClick={() => setSelectedEntityTab('shipments')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                selectedEntityTab === 'shipments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Filtered Shipments ({filteredShipments.length})
            </button>
            <button
              onClick={() => setSelectedEntityTab('disruptions')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                selectedEntityTab === 'disruptions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Filtered Disruptions ({filteredDisruptions.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {isFilteringActive ? (
              <span>Filtered by {fromDate || toDate ? `Dates (${fromDate || '*'} to ${toDate || '*'})` : ''} {searchQuery ? `& Query "${searchQuery}"` : ''}</span>
            ) : (
              <span>Showing all system records</span>
            )}
          </div>
        </div>

        {/* Tab 1: Orders Table */}
        {selectedEntityTab === 'orders' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Order #</th>
                  <th className="py-2.5 px-4">Tamil Nadu Customer</th>
                  <th className="py-2.5 px-4">Order Date</th>
                  <th className="py-2.5 px-4">Delivery Deadline</th>
                  <th className="py-2.5 px-4">Risk Level</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No customer orders match the specified date range or search query.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.slice(0, 15).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-800">{o.customerName}</div>
                        <div className="text-[10px] text-slate-400">{o.customerTier}</div>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{o.orderDate}</td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-800">{o.deliveryDeadline}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            o.riskLevel === 'High'
                              ? 'bg-red-100 text-red-800'
                              : o.riskLevel === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {o.riskLevel} ({o.riskScore}/100)
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-medium text-slate-700">{o.status}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                        ₹{o.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Shipments Table */}
        {selectedEntityTab === 'shipments' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Shipment #</th>
                  <th className="py-2.5 px-4">Vehicle Plate</th>
                  <th className="py-2.5 px-4">Tamil Nadu Corridor</th>
                  <th className="py-2.5 px-4">Expected Delivery</th>
                  <th className="py-2.5 px-4">Delay (Days)</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No freight shipments match the specified date range or search query.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.slice(0, 15).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{s.shipmentNumber}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-mono font-semibold text-slate-800">{s.telemetry?.vehicleNumber || 'TN-04-BJ-8821'}</span>
                        <div className="text-[10px] text-slate-400">{s.telemetry?.driverName}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-800 truncate">{s.originLocation.split(',')[0]} &rarr; {s.destinationLocation.split(',')[0]}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{s.lastCheckpoint}</div>
                      </td>
                      <td className="py-2.5 px-4 font-mono">{s.expectedDelivery}</td>
                      <td className="py-2.5 px-4 font-mono">
                        {s.delayDays > 0 ? (
                          <span className="text-red-600 font-bold">+{s.delayDays}d Delay</span>
                        ) : (
                          <span className="text-emerald-700">On Time</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            s.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'Delayed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Disruptions Table */}
        {selectedEntityTab === 'disruptions' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Disruption #</th>
                  <th className="py-2.5 px-4">Classification</th>
                  <th className="py-2.5 px-4">Target Entity</th>
                  <th className="py-2.5 px-4">Reported Date</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDisruptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No disruption incidents recorded in this timeframe.
                    </td>
                  </tr>
                ) : (
                  filteredDisruptions.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{d.disruptionNumber}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{d.type}</td>
                      <td className="py-2.5 px-4 text-slate-700">{d.targetName}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{d.reportedAt}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            d.severity === 'Critical'
                              ? 'bg-red-600 text-white'
                              : d.severity === 'Major'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {d.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-700">{d.status}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setActiveDisruptionId(d.id);
                            setCurrentTab('disruptions');
                          }}
                          className="px-2.5 py-1 text-[11px] bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium"
                        >
                          View Telematics &rarr;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
