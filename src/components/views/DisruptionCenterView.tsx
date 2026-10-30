import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  ArrowRight,
  Layers,
  Clock,
  CheckCircle2,
  BrainCircuit,
  Filter,
  Flame,
  Search,
  Navigation,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Disruption, DisruptionSeverity, DisruptionType, Shipment } from '../../types';
import { VehicleTrackingMap } from '../common/VehicleTrackingMap';

export const DisruptionCenterView: React.FC = () => {
  const {
    disruptions,
    reportDisruption,
    resolveDisruption,
    suppliers,
    warehouses,
    carriers,
    products,
    shipments,
    setActiveDisruptionId,
    setCurrentTab,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [trackedShipment, setTrackedShipment] = useState<Shipment | null>(null);

  const [formData, setFormData] = useState({
    type: 'Supplier Delay' as DisruptionType,
    targetType: 'supplier' as Disruption['targetType'],
    targetId: suppliers[0]?.id || 'sup-1',
    productId: products[0]?.id || 'prod-1',
    delayDays: 3,
    affectedQuantity: 400,
    severity: 'Major' as DisruptionSeverity,
    description: '',
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateWarning(null);

    // Prevent duplicate disruption check
    const existing = disruptions.find(
      (d) =>
        d.status === 'Active' &&
        d.targetId === formData.targetId &&
        d.type === formData.type
    );

    if (existing) {
      setDuplicateWarning(
        `Duplicate Event Blocked: An active ${formData.type} is already recorded for this entity (${existing.disruptionNumber}).`
      );
      return;
    }

    const { disruption } = reportDisruption(formData);
    setShowModal(false);
    setActiveDisruptionId(disruption.id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Disruption Detection Center</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
              Autonomous Surveillance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-echelon disruption logging, root-cause classification, and ripple impact propagation.
          </p>
        </div>

        <button
          onClick={() => {
            setDuplicateWarning(null);
            setShowModal(true);
          }}
          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Report New Disruption</span>
        </button>
      </div>

      {/* Disruption Feed Cards */}
      <div className="space-y-4">
        {disruptions.map((disr) => {
          const isResolved = disr.status === 'Resolved';
          const isMitigated = disr.status === 'Mitigated';

          return (
            <div
              key={disr.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                isResolved
                  ? 'border-slate-200 opacity-75'
                  : isMitigated
                  ? 'border-emerald-300 bg-emerald-50/15'
                  : 'border-red-300 bg-red-50/10'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-slate-900">{disr.disruptionNumber}</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold text-slate-800 text-xs">{disr.type}</span>
                  <span className="text-slate-300">·</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      disr.severity === 'Critical'
                        ? 'bg-red-600 text-white'
                        : disr.severity === 'Major'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {disr.severity.toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isResolved
                        ? 'bg-slate-200 text-slate-700'
                        : isMitigated
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    STATUS: {disr.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Reported: <strong>{disr.reportedAt}</strong>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-700 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {disr.description}
              </p>

              {/* Impact breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-medium">Disrupted Target</span>
                  <span className="font-semibold text-slate-900">{disr.targetName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-medium">Estimated Delay</span>
                  <span className="font-mono font-bold text-red-600">+{disr.delayDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-medium">Affected Orders</span>
                  <span className="font-mono font-bold text-slate-900">{disr.affectedOrderIds.length} Customer Orders</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block font-medium">Cargo Deficit</span>
                  <span className="font-mono font-bold text-slate-900">{disr.affectedQuantity} Units</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      const linked = shipments.find((s) => disr.affectedShipmentIds.includes(s.id)) || shipments[0];
                      setTrackedShipment(linked);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Track Vehicle &amp; Route Map (GPS)</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveDisruptionId(disr.id);
                      setCurrentTab('dependencies');
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Dependency Propagation Map</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveDisruptionId(disr.id);
                      setCurrentTab('recovery');
                    }}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium flex items-center gap-1.5"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Recovery Recommendations</span>
                  </button>
                </div>

                {!isResolved && (
                  <button
                    onClick={() => resolveDisruption(disr.id)}
                    className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:text-slate-900 rounded font-medium hover:bg-slate-50"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vehicle Tracking Map Modal */}
      {trackedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-6xl w-full my-auto">
            <VehicleTrackingMap
              shipment={shipments.find((s) => s.id === trackedShipment.id) || trackedShipment}
              onClose={() => setTrackedShipment(null)}
            />
          </div>
        </div>
      )}

      {/* Disruption Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Log Logistics Disruption</h3>
                <p className="text-slate-500">Autonomous cascade will re-evaluate connected orders and inventory buffers</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            {duplicateWarning && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                {duplicateWarning}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Disruption Classification</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
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
                  <label className="block text-slate-700 font-semibold mb-1">Entity Domain</label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      const firstId = newType === 'supplier' ? suppliers[0]?.id : newType === 'warehouse' ? warehouses[0]?.id : carriers[0]?.id;
                      setFormData({ ...formData, targetType: newType, targetId: firstId || '' });
                    }}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    <option value="supplier">Supplier</option>
                    <option value="warehouse">Warehouse Hub</option>
                    <option value="carrier">Carrier Fleet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Name</label>
                  <select
                    value={formData.targetId}
                    onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
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
                  <label className="block text-slate-700 font-semibold mb-1">Delay (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={formData.delayDays}
                    onChange={(e) => setFormData({ ...formData, delayDays: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Affected Qty</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={formData.affectedQuantity}
                    onChange={(e) => setFormData({ ...formData, affectedQuantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded text-xs"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Major">Major</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Disruption Root Cause / Notes</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="E.g., customs verification audit, port strike, mechanical failure..."
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white rounded font-medium hover:bg-red-700 shadow-xs"
                >
                  Commit & Calculate Ripple
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
