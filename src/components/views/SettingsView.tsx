import React, { useState } from 'react';
import {
  Settings,
  Shield,
  User,
  Bell,
  Building,
  CheckCircle2,
  Lock,
  Sliders,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const { currentUser, userProfiles, setCurrentUserRole } = useApp();

  const [notifSound, setNotifSound] = useState(true);
  const [criticalEmailAlerts, setCriticalEmailAlerts] = useState(true);
  const [autoSlaEscalation, setAutoSlaEscalation] = useState(true);
  const [safetyStockMultiplier, setSafetyStockMultiplier] = useState('1.5');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const rolePermissions: Record<UserRole, { title: string; perms: string[] }> = {
    'Logistics Manager': {
      title: 'Full Operational & Governance Authority',
      perms: [
        'End-to-end supply chain visibility and control tower metrics',
        'Direct authorization of high-value recovery plans and charters',
        'Execution dispatch to global warehouse networks',
        'Multi-factor risk threshold calibration and simulator testing',
      ],
    },
    'Warehouse Operator': {
      title: 'Fulfillment & Stock Management Authority',
      perms: [
        'Inventory stock count reconciliation and buffer adjustments',
        'Physical cross-dock transfer acceptance and staging verification',
        'Warehouse shortage incident reporting and logging',
        'Carrier dispatch tracking and arrival manifest sign-off',
      ],
    },
    'Procurement Approver': {
      title: 'Strategic Sourcing & Vendor Authority',
      perms: [
        'Supplier dual-sourcing contracts and purchase orders',
        'Alternative vendor qualification and reliability vetting',
        'Procurement budget authorization for emergency batches',
        'Supplier audit logs and SLA compliance monitoring',
      ],
    },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Role-Based Access</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          User profiles, RBAC permission matrices, automated SLA triggers, and enterprise configurations.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
              {currentUser.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{currentUser.name}</h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentUser.title} · {currentUser.department}</p>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Security Status: <strong className="text-emerald-600">Enterprise Verified</strong>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="pt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Switch Active Operating Profile:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {userProfiles.map((p) => {
              const isSelected = currentUser.role === p.role;
              return (
                <div
                  key={p.id}
                  onClick={() => setCurrentUserRole(p.role)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 mb-0.5">
                    <span>{p.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="text-blue-700 font-medium text-[11px]">{p.role}</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{p.title}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Role-Based Access Control (RBAC): {currentUser.role}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {rolePermissions[currentUser.role].title}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {rolePermissions[currentUser.role].perms.map((perm, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2.5 rounded bg-slate-50 border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700">{perm}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Autonomous Control Tower Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Warehouse Safety Buffer Target</label>
            <select
              value={safetyStockMultiplier}
              onChange={(e) => setSafetyStockMultiplier(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50"
            >
              <option value="1.2">1.2x Reorder Level (Lean)</option>
              <option value="1.5">1.5x Reorder Level (Balanced Standard)</option>
              <option value="2.0">2.0x Reorder Level (High Resilience Buffer)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">High-Risk Customer Threshold</label>
            <input
              type="text"
              disabled
              value="Risk Score >= 61 (Standardized Enterprise SLA)"
              className="w-full p-2 border border-slate-200 rounded text-xs bg-slate-100 text-slate-600 font-mono"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={criticalEmailAlerts}
              onChange={(e) => setCriticalEmailAlerts(e.target.checked)}
              className="rounded text-blue-600 border-slate-300"
            />
            <span className="text-slate-700">Dispatch instant notifications for Critical supply delays (&gt;2 days)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSlaEscalation}
              onChange={(e) => setAutoSlaEscalation(e.target.checked)}
              className="rounded text-blue-600 border-slate-300"
            />
            <span className="text-slate-700">Automatically synthesize AI Recovery Plan upon disruption report</span>
          </label>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {savedMessage ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings successfully committed!
            </span>
          ) : (
            <span className="text-slate-400">Settings persist to local session</span>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-xs transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
