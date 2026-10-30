import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  Clock,
  ShieldCheck,
  AlertTriangle,
  History,
  FileCheck,
  User,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlanStatus, RecoveryPlan } from '../../types';

export const ApprovalsView: React.FC = () => {
  const {
    recoveryPlans,
    approvePlan,
    rejectPlan,
    executePlan,
    auditLogs,
    currentUser,
    orders,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<PlanStatus | 'all'>('Pending');
  const [rejectModalPlan, setRejectModalPlan] = useState<RecoveryPlan | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredPlans = recoveryPlans.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.status === activeFilter;
  });

  const pendingCount = recoveryPlans.filter((p) => p.status === 'Pending').length;
  const approvedCount = recoveryPlans.filter((p) => p.status === 'Approved').length;
  const executedCount = recoveryPlans.filter((p) => p.status === 'Executed').length;
  const rejectedCount = recoveryPlans.filter((p) => p.status === 'Rejected').length;

  const handleApprove = (planId: string) => {
    approvePlan(planId);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalPlan) return;
    rejectPlan(rejectModalPlan.id, rejectReason || 'Alternative strategy chosen by management.');
    setRejectModalPlan(null);
    setRejectReason('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manager Approval & Execution</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              Chain of Custody
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal manager authorization workflow. Executing approved actions triggers live inventory transfer and order recovery.
          </p>
        </div>

        {/* Current Auth User Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shadow-xs self-start">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500">Sign-off Authority:</span>
          <strong className="text-slate-900">{currentUser.name}</strong>
          <span className="text-[10px] font-mono text-slate-400">({currentUser.role})</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveFilter('Pending')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeFilter === 'Pending'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Pending Authorization</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-white font-mono">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter('Approved')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeFilter === 'Approved'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Approved (Ready for Execution)</span>
          {approvedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-900 font-mono">
              {approvedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter('Executed')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
            activeFilter === 'Executed'
              ? 'bg-emerald-600 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Executed (Completed)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-mono">
            {executedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('Rejected')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeFilter === 'Rejected'
              ? 'bg-slate-800 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Rejected ({rejectedCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-slate-200 text-slate-900 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Plans ({recoveryPlans.length})
        </button>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            No recovery plans in <strong>{activeFilter}</strong> state.
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const isPending = plan.status === 'Pending';
            const isApproved = plan.status === 'Approved';
            const isExecuted = plan.status === 'Executed';
            const isRejected = plan.status === 'Rejected';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                  isExecuted
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : isApproved
                    ? 'border-blue-400 bg-blue-50/10 ring-1 ring-blue-300'
                    : isPending
                    ? 'border-amber-300 bg-amber-50/10'
                    : 'border-slate-200 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-slate-900">{plan.planNumber}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-800 text-xs">{plan.recoveryType}</span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isExecuted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isApproved
                          ? 'bg-blue-100 text-blue-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {plan.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    Requested: <strong>{plan.requestedAt}</strong> by {plan.requestedBy}
                  </div>
                </div>

                {/* Plan Action & Reason */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-3 space-y-1">
                  <div className="font-semibold text-slate-900">{plan.recommendedAction}</div>
                  <div className="text-slate-600 text-[11px]">{plan.reason}</div>
                  {plan.executionNotes && (
                    <div className="text-emerald-700 font-mono text-[11px] pt-1 border-t border-slate-200">
                      Audit Note: {plan.executionNotes}
                    </div>
                  )}
                </div>

                {/* Plan Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2.5 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block font-medium">Estimated Cost</span>
                    <span className="font-mono font-bold text-slate-900">${plan.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block font-medium">Recovery Window</span>
                    <span className="font-mono font-bold text-slate-900">{plan.expectedRecoveryDays} Days</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block font-medium">Risk Reduction</span>
                    <span className="font-mono font-bold text-emerald-600">-{plan.expectedRiskReductionPercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block font-medium">Protected Orders</span>
                    <span className="font-mono font-bold text-slate-900">{plan.affectedOrderIds.length} Orders</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-slate-500">
                    {isApproved && (
                      <span className="text-blue-700 font-medium">
                        Authorized by {plan.approvedBy} at {plan.approvedAt}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => setRejectModalPlan(plan)}
                          className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded font-medium flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(plan.id)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorize Plan</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => executePlan(plan.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded font-semibold shadow-xs flex items-center gap-1.5 animate-pulse"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Execute Approved Plan</span>
                      </button>
                    )}

                    {isExecuted && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Execution Committed to Fleet & Warehouses
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Audit Trail Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              Operational Audit Trail & Authorization Log
            </h2>
            <p className="text-[11px] text-slate-500">Immutable ledger of approvals, stock movements, and recovery executions</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{auditLogs.length} Events Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Authorized User</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-500">{log.timestamp}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{log.action}</td>
                  <td className="py-2 px-3 text-slate-900">{log.user}</td>
                  <td className="py-2 px-3 text-slate-500">{log.role}</td>
                  <td className="py-2 px-3 text-slate-600 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Reject Recovery Plan</h3>
            <p className="text-slate-500 mb-3">
              State the operational reason for rejecting plan {rejectModalPlan.planNumber}.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g. Cost exceeds threshold, alternative route prioritized..."
                className="w-full p-2 border border-slate-300 rounded text-xs text-slate-900"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalPlan(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white rounded font-medium hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
