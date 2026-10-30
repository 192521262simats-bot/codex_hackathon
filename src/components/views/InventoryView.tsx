import React, { useState, useMemo } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  TrendingUp,
  Search,
  Filter,
  Edit2,
  Building2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';

export const InventoryView: React.FC = () => {
  const { inventory, products, warehouses, updateStock } = useApp();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editAvail, setEditAvail] = useState<number>(0);
  const [editReserved, setEditReserved] = useState<number>(0);

  // Summaries
  const totalAvailableUnits = inventory.reduce((sum, item) => sum + item.availableQty, 0);
  const totalReservedUnits = inventory.reduce((sum, item) => sum + item.reservedQty, 0);
  const lowStockCount = inventory.filter((item) => item.stockStatus === 'Low Stock').length;
  const outOfStockCount = inventory.filter((item) => item.stockStatus === 'Out of Stock').length;
  const excessCount = inventory.filter((item) => item.stockStatus === 'Excess').length;

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchWh = selectedWarehouseId === 'all' || item.warehouseId === selectedWarehouseId;
      const prod = products.find((p) => p.id === item.productId);
      const matchSearch =
        (prod?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (prod?.sku.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchWh && matchSearch;
    });
  }, [inventory, selectedWarehouseId, searchQuery, products]);

  // Warehouse comparison data
  const warehouseAggregates = useMemo(() => {
    return warehouses.map((wh) => {
      const itemsInWh = inventory.filter((i) => i.warehouseId === wh.id);
      const avail = itemsInWh.reduce((sum, i) => sum + i.availableQty, 0);
      const reserved = itemsInWh.reduce((sum, i) => sum + i.reservedQty, 0);
      return {
        ...wh,
        availableUnits: avail,
        reservedUnits: reserved,
        totalStock: avail + reserved,
      };
    });
  }, [warehouses, inventory]);

  const maxStock = Math.max(...warehouseAggregates.map((w) => w.totalStock), 10000);

  const handleStartEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditAvail(item.availableQty);
    setEditReserved(item.reservedQty);
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (editAvail < 0 || editReserved < 0) {
      alert('Inventory quantities cannot be negative.');
      return;
    }
    updateStock(editingItem.id, editAvail, editReserved);
    setEditingItem(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory & Buffer Surveillance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional warehouse safety stock levels, reserve allocations, and shortage detection.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Last Global Reconciliation: <strong>Today 11:30 UTC</strong>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Total Available Stock</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {totalAvailableUnits.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            + {totalReservedUnits.toLocaleString()} units reserved
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Low-Stock Lines</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1">
            {lowStockCount}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">
            Below safety buffer threshold
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Out of Stock</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono tabular-nums mt-1">
            {outOfStockCount}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">
            Zero fulfillment capability
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Excess Inventory</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {excessCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">
            Surplus available for transfer
          </div>
        </div>
      </div>

      {/* Warehouse Stock Comparison Chart */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Regional Warehouse Capacity & Stock Allocation</h2>
            <p className="text-[11px] text-slate-500">Available vs Reserved units across fulfillment centers</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600"></span>
              <span className="text-slate-600">Available Stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-300"></span>
              <span className="text-slate-600">Reserved / Allocated</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {warehouseAggregates.map((wh) => {
            const availPct = (wh.availableUnits / maxStock) * 100;
            const resPct = (wh.reservedUnits / maxStock) * 100;

            return (
              <div key={wh.id} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{wh.name}</span>
                    <span className="text-slate-400 font-mono font-normal">({wh.city})</span>
                  </span>
                  <span className="font-mono tabular-nums text-slate-700 font-medium">
                    <strong className="text-blue-600">{wh.availableUnits.toLocaleString()} avail</strong> / {wh.reservedUnits.toLocaleString()} reserved ({wh.currentUtilizationPercent}% util)
                  </span>
                </div>

                <div className="h-4 w-full bg-slate-100 rounded-md overflow-hidden flex">
                  <div
                    style={{ width: `${availPct}%` }}
                    className="bg-blue-600 h-full transition-all duration-500"
                    title={`Available: ${wh.availableUnits.toLocaleString()}`}
                  />
                  <div
                    style={{ width: `${resPct}%` }}
                    className="bg-slate-300 h-full transition-all duration-500"
                    title={`Reserved: ${wh.reservedUnits.toLocaleString()}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Table with Warehouse Filter */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name or SKU..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-slate-500 font-medium">Warehouse Filter:</span>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
            >
              <option value="all">All Regional Warehouses ({warehouses.length})</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Product Details</th>
                <th className="py-2.5 px-4">Warehouse Depot</th>
                <th className="py-2.5 px-4 text-right">Available Qty</th>
                <th className="py-2.5 px-4 text-right">Reserved Qty</th>
                <th className="py-2.5 px-4 text-right">Required Qty</th>
                <th className="py-2.5 px-4 text-right">Reorder Point</th>
                <th className="py-2.5 px-4">Stock Status</th>
                <th className="py-2.5 px-4 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredInventory.map((item) => {
                const prod = products.find((p) => p.id === item.productId);
                const wh = warehouses.find((w) => w.id === item.warehouseId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{prod?.name || 'Component'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{prod?.sku} · {prod?.category}</div>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-medium text-slate-800">{wh?.name}</div>
                      <div className="text-[10px] text-slate-400">{wh?.city}</div>
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {item.availableQty.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono text-slate-500 tabular-nums">
                      {item.reservedQty.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                      {item.requiredQty.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                      {item.reorderLevel.toLocaleString()}
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.stockStatus === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : item.stockStatus === 'Out of Stock'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : item.stockStatus === 'Excess'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.stockStatus}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="Adjust Stock"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Adjust Warehouse Stock</h3>
            <p className="text-slate-500 mb-4">
              Enter updated counts. Reserved stock cannot be combined into available stock.
            </p>

            <form onSubmit={handleSaveStock} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Available Quantity (Unreserved)</label>
                <input
                  type="number"
                  min="0"
                  value={editAvail}
                  onChange={(e) => setEditAvail(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reserved Quantity (Allocated)</label>
                <input
                  type="number"
                  min="0"
                  value={editReserved}
                  onChange={(e) => setEditReserved(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
