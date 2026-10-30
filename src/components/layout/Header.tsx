import React, { useState } from 'react';
import {
  Bell,
  Search,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    loadScenarioA,
    loadScenarioB,
    resetToDefaultData,
    currentUser,
    dataProvenance,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabLabels: Record<string, string> = {
    dashboard: 'Control Tower Dashboard',
    data: 'Data Management & Ingestion',
    shipments: 'Shipment Tracking & Logistics',
    inventory: 'Inventory & Warehouse Levels',
    suppliers: 'Supplier Directory & Reliability',
    disruptions: 'Disruption Detection Center',
    dependencies: 'Dependency Impact Map',
    risk: 'Order Risk Analysis Engine',
    recovery: 'AI Recovery Strategy Planner',
    simulator: 'What-If Recovery Simulator',
    approvals: 'Manager Authorization & Approvals',
    notifications: 'Supply Chain Alerts & Feeds',
    reports: 'Logistics Performance & Reports',
    settings: 'System Configuration & Roles',
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-6 z-20 shrink-0">
      {/* Zone 1: Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap min-w-0">
        <span className="font-semibold text-slate-900">RippleGuard AI</span>
        <span>/</span>
        <span className="text-slate-600">Operations</span>
        <span>/</span>
        <span className="text-blue-600 font-medium truncate">{tabLabels[currentTab] || 'Workspace'}</span>
      </div>

      {/* Zone 2: Scenario Quick Switchers & Environment Mode */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200 text-xs font-medium">
          <button
            onClick={loadScenarioA}
            className="px-2.5 py-1 rounded text-slate-700 hover:text-blue-700 hover:bg-white transition-colors flex items-center gap-1.5"
            title="Scenario A: NH 48 corridor delay at SIPCOT High-Tech Semiconductors (Sriperumbudur)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Scenario A: Supplier Delay</span>
          </button>
          <button
            onClick={loadScenarioB}
            className="px-2.5 py-1 rounded text-slate-700 hover:text-blue-700 hover:bg-white transition-colors flex items-center gap-1.5"
            title="Scenario B: Stock deficit at Chennai Oragadam Hub vs Coimbatore Peelamedu surplus"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Scenario B: Stock Transfer</span>
          </button>
          <button
            onClick={resetToDefaultData}
            className="px-2 py-1 rounded text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
            title="Reset system to default demonstration state"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>PostgreSQL Live</span>
        </div>
      </div>

      {/* Zone 3: Actions & Notifications */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Map Link */}
        <button
          onClick={() => setCurrentTab('dependencies')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-md border border-slate-200 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Dependency Graph</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-900">Recent Alerts ({unreadCount} unread)</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationAsRead(n.id);
                      if (n.linkToTab) setCurrentTab(n.linkToTab);
                      setShowNotifMenu(false);
                    }}
                    className={`p-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                      !n.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setCurrentTab('notifications');
                    setShowNotifMenu(false);
                  }}
                  className="text-blue-600 hover:underline font-medium text-[11px]"
                >
                  View all in Notification Center
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {currentUser.name[0]}
          </div>
          <div className="hidden xl:block text-left text-xs">
            <div className="font-medium text-slate-900 leading-none">{currentUser.name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-none">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
