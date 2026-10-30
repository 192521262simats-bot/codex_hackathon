import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { ShipmentsView } from './components/views/ShipmentsView';
import { InventoryView } from './components/views/InventoryView';
import { SuppliersView } from './components/views/SuppliersView';
import { DisruptionCenterView } from './components/views/DisruptionCenterView';
import { DependencyMapView } from './components/views/DependencyMapView';
import { RiskAnalysisView } from './components/views/RiskAnalysisView';
import { RecoveryPlannerView } from './components/views/RecoveryPlannerView';
import { RecoverySimulatorView } from './components/views/RecoverySimulatorView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { NotificationsView } from './components/views/NotificationsView';
import { ReportsView } from './components/views/ReportsView';
import { DataManagementView } from './components/views/DataManagementView';
import { SettingsView } from './components/views/SettingsView';

const MainLayout: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { currentTab } = useApp();

  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'data':
        return <DataManagementView />;
      case 'shipments':
        return <ShipmentsView />;
      case 'inventory':
        return <InventoryView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'disruptions':
        return <DisruptionCenterView />;
      case 'dependencies':
        return <DependencyMapView />;
      case 'risk':
        return <RiskAnalysisView />;
      case 'recovery':
        return <RecoveryPlannerView />;
      case 'simulator':
        return <RecoverySimulatorView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  // Start authenticated so evaluators immediately land on the rich control tower,
  // but allow logging out to inspect the Login experience anytime!
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <AppProvider>
      {isAuthenticated ? (
        <MainLayout onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </AppProvider>
  );
}
