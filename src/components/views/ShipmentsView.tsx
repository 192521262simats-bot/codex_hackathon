import React, { useState, useMemo } from 'react';
import {
  Truck,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit,
  MapPin,
  Calendar,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shipment, ShipmentStatus } from '../../types';

export const ShipmentsView: React.FC = () => {
  const { shipments, addShipment, updateShipment, suppliers, warehouses, carriers, products, orders } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  const pageSize = 10;

  // New Shipment Form State
  const [formData, setFormData] = useState({
    orderId: orders[0]?.id || 'ord-1',
    productId: products[0]?.id || 'prod-1',
    supplierId: suppliers[0]?.id || 'sup-1',
    carrierId: carriers[0]?.id || 'car-1',
    originLocation: `${suppliers[0]?.name}, ${suppliers[0]?.location}`,
    destinationWarehouseId: warehouses[0]?.id || 'wh-1',
    destinationLocation: `${warehouses[0]?.name}, ${warehouses[0]?.city}`,
    expectedDelivery: '2026-11-05',
    status: 'In Transit' as ShipmentStatus,
    delayDays: 0,
    trackingNumber: `TRK-889-${Math.floor(10000 + Math.random() * 90000)}`,
    lastCheckpoint: 'Carrier freight depot manifest generated',
  });

  // Filter and search
  const filteredShipments = useMemo(() => {
    return shipments.filter((shp) => {
      const matchSearch =
        shp.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shp.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shp.originLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shp.destinationLocation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || shp.status === statusFilter;
      const matchCarrier = carrierFilter === 'all' || shp.carrierId === carrierFilter;

      return matchSearch && matchStatus && matchCarrier;
    });
  }, [shipments, searchQuery, statusFilter, carrierFilter]);

  const totalPages = Math.ceil(filteredShipments.length / pageSize) || 1;
  const paginatedShipments = filteredShipments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    addShipment(formData);
    setShowAddModal(false);
  };

  const handleUpdateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;
    updateShipment(editingShipment.id, {
      status: editingShipment.status,
      delayDays: editingShipment.delayDays,
      lastCheckpoint: editingShipment.lastCheckpoint,
      destinationLocation: editingShipment.destinationLocation,
    });
    setEditingShipment(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Shipment Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational freight manifests, carrier handoffs, and transit delay surveillance.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Dispatch New Shipment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search shipment #, tracking, route..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
            >
              <option value="all">All Statuses ({shipments.length})</option>
              <option value="In Transit">In Transit</option>
              <option value="Delayed">Delayed</option>
              <option value="Processing">Processing</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-medium">Carrier:</span>
            <select
              value={carrierFilter}
              onChange={(e) => {
                setCarrierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
            >
              <option value="all">All Carriers</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Shipment Number</th>
                <th className="py-2.5 px-4">Order Ref</th>
                <th className="py-2.5 px-4">Product Cargo</th>
                <th className="py-2.5 px-4">Carrier</th>
                <th className="py-2.5 px-4">Origin &rarr; Destination</th>
                <th className="py-2.5 px-4">Expected Delivery</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {paginatedShipments.map((shp) => {
                const prod = products.find((p) => p.id === shp.productId);
                const carrier = carriers.find((c) => c.id === shp.carrierId);
                const isOverdue = shp.isOverdue || (shp.delayDays > 0 && shp.status !== 'Delivered');

                return (
                  <tr key={shp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      <div>{shp.shipmentNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{shp.trackingNumber}</div>
                    </td>

                    <td className="py-2.5 px-4 font-mono text-slate-700">
                      {shp.orderId.toUpperCase()}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-800">{prod?.name || 'Industrial Parts'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{prod?.sku}</div>
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="font-medium text-slate-800">{carrier?.name || 'Linehaul Carrier'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{carrier?.transportMode}</div>
                    </td>

                    <td className="py-2.5 px-4 max-w-xs truncate">
                      <div className="text-slate-800 font-medium truncate">{shp.originLocation.split(',')[0]}</div>
                      <div className="text-[10px] text-slate-500 truncate">&rarr; {shp.destinationLocation}</div>
                    </td>

                    <td className="py-2.5 px-4 font-mono">
                      <div className={isOverdue ? 'text-red-600 font-semibold' : 'text-slate-800'}>
                        {shp.expectedDelivery}
                      </div>
                      {isOverdue && (
                        <div className="text-[10px] text-red-600 font-semibold font-mono">
                          +{shp.delayDays}d Overdue
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[10px] px-2 py-0.5 rounded ${
                          shp.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : shp.status === 'Delayed'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : shp.status === 'In Transit'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {shp.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedShipment(shp)}
                          title="Inspect Telemetry"
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingShipment(shp)}
                          title="Edit Status"
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{paginatedShipments.length}</strong> of{' '}
            <strong className="text-slate-800">{filteredShipments.length}</strong> shipments
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 border border-slate-300 rounded disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 border border-slate-300 rounded disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Shipment Details Drawer */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-slate-400 text-[10px] uppercase">Telemetry Checkpoint</span>
                <h3 className="text-base font-bold text-slate-900">{selectedShipment.shipmentNumber}</h3>
              </div>
              <button onClick={() => setSelectedShipment(null)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 font-medium">Last Known Manifest Checkpoint</div>
                <div className="font-semibold text-slate-900 mt-1">{selectedShipment.lastCheckpoint}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">Tracking Number:</span>
                  <div className="font-mono font-bold text-slate-900">{selectedShipment.trackingNumber}</div>
                </div>
                <div>
                  <span className="text-slate-500">Expected Delivery:</span>
                  <div className="font-mono font-bold text-slate-900">{selectedShipment.expectedDelivery}</div>
                </div>
                <div>
                  <span className="text-slate-500">Origin Depot:</span>
                  <div className="font-semibold text-slate-900">{selectedShipment.originLocation}</div>
                </div>
                <div>
                  <span className="text-slate-500">Destination Hub:</span>
                  <div className="font-semibold text-slate-900">{selectedShipment.destinationLocation}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedShipment(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shipment Modal */}
      {editingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Edit Shipment {editingShipment.shipmentNumber}</h3>
            <form onSubmit={handleUpdateShipment} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={editingShipment.status}
                  onChange={(e) => setEditingShipment({ ...editingShipment, status: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                >
                  <option value="Processing">Processing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Delay Days</label>
                <input
                  type="number"
                  min="0"
                  value={editingShipment.delayDays}
                  onChange={(e) => setEditingShipment({ ...editingShipment, delayDays: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Last Reported Checkpoint</label>
                <input
                  type="text"
                  value={editingShipment.lastCheckpoint}
                  onChange={(e) => setEditingShipment({ ...editingShipment, lastCheckpoint: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingShipment(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Dispatch New Logistics Shipment</h3>
            <form onSubmit={handleCreateShipment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Cargo</label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Destination Warehouse</label>
                  <select
                    value={formData.destinationWarehouseId}
                    onChange={(e) => {
                      const wh = warehouses.find((w) => w.id === e.target.value);
                      setFormData({
                        ...formData,
                        destinationWarehouseId: e.target.value,
                        destinationLocation: `${wh?.name}, ${wh?.city}`,
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Carrier Linehaul</label>
                  <select
                    value={formData.carrierId}
                    onChange={(e) => setFormData({ ...formData, carrierId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    {carriers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.transportMode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expected Delivery</label>
                  <input
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
