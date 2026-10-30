import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Boxes,
  Building2,
  AlertTriangle,
  Network,
  ShieldAlert,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  Bell,
  BarChart3,
  Database,
  Settings,
  LogOut,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const {
    currentTab,
    setCurrentTab,
    disruptions,
    orders,
    recoveryPlans,
    notifications,
    currentUser,
    setCurrentUserRole,
    userProfiles,
  } = useApp();

  const activeDisruptionsCount = disruptions.filter((d) => d.status === 'Active').length;
  const highRiskOrdersCount = orders.filter((o) => o.riskLevel === 'High').length;
  const pendingApprovalsCount = recoveryPlans.filter((p) => p.status === 'Pending').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'shipments', label: 'Shipments', icon: Truck },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'suppliers', label: 'Suppliers', icon: Building2 },
    { id: 'disruptions', label: 'Disruption Center', icon: AlertTriangle, count: activeDisruptionsCount, countType: 'critical' },
    { id: 'dependencies', label: 'Dependency Map', icon: Network, highlight: true },
    { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert, count: highRiskOrdersCount, countType: 'warning' },
    { id: 'recovery', label: 'Recovery Planner', icon: BrainCircuit },
    { id: 'simulator', label: 'Recovery Simulator', icon: Sliders },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle2, count: pendingApprovalsCount, countType: 'info' },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifsCount, countType: 'neutral' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B1528] text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              <span>RippleGuard</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-medium bg-blue-500/20 text-blue-400">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">One Disruption. All Protected.</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Supply Chain Control
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                    item.countType === 'critical'
                      ? 'bg-red-500 text-white'
                      : item.countType === 'warning'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : item.countType === 'info'
                      ? 'bg-blue-500/30 text-blue-200'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Role Switcher & Profile */}
      <div className="p-3 border-t border-slate-800 bg-[#080F1E]">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Active Role</span>
          <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            Online
          </span>
        </div>
        
        {/* Quick Role Selector */}
        <div className="grid grid-cols-3 gap-1 mb-3">
          {userProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setCurrentUserRole(profile.role)}
              title={profile.role}
              className={`py-1 px-1 text-[10px] truncate text-center rounded border transition-colors ${
                currentUser.role === profile.role
                  ? 'bg-blue-600/30 border-blue-500 text-white font-medium'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {profile.role === 'Logistics Manager' ? 'Manager' : profile.role === 'Warehouse Operator' ? 'Operator' : 'Approver'}
            </button>
          ))}
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name[0]}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser.role}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out to demo login"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
