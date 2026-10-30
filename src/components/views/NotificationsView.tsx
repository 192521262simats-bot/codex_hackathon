import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Boxes,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    setCurrentTab,
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filterSeverity === 'all') return true;
    return n.severity === filterSeverity;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Supply Chain Alert Feeds</h1>
            {unreadCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational alerts for supplier delays, warehouse shortages, customer SLA risks, and recovery dispatches.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        {(['all', 'critical', 'warning', 'info', 'success'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
              filterSeverity === sev
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {sev === 'all' ? 'All Alerts' : sev}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No alerts matching current filter.
          </div>
        ) : (
          filteredNotifs.map((n) => {
            return (
              <div
                key={n.id}
                className={`p-4 transition-colors hover:bg-slate-50 flex items-start justify-between gap-4 text-xs ${
                  !n.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      n.severity === 'critical'
                        ? 'bg-red-100 text-red-600'
                        : n.severity === 'warning'
                        ? 'bg-amber-100 text-amber-600'
                        : n.severity === 'success'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {n.severity === 'critical' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : n.severity === 'warning' ? (
                      <Boxes className="w-4 h-4" />
                    ) : n.severity === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{n.title}</h3>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-400 font-mono mt-1.5">{n.timestamp}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.linkToTab && (
                    <button
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        setCurrentTab(n.linkToTab!);
                      }}
                      className="px-2.5 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded font-medium flex items-center gap-1 text-[11px]"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}

                  {!n.read && (
                    <button
                      onClick={() => markNotificationAsRead(n.id)}
                      title="Mark as read"
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => clearNotification(n.id)}
                    title="Dismiss"
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
