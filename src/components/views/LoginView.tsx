import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { setCurrentUserRole, userProfiles } = useApp();
  const [email, setEmail] = useState('elena.rostova@rippleguard.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to matching profile or Logistics Manager
    const match = userProfiles.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (match) {
      setCurrentUserRole(match.role);
    } else {
      setCurrentUserRole('Logistics Manager');
    }
    onLoginSuccess();
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    setCurrentUserRole(role);
    const profile = userProfiles.find((p) => p.role === role);
    if (profile) {
      setEmail(profile.email);
    }
    onLoginSuccess();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 font-sans">
      {/* Background Logistics Image with measured scrim */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <img
          src="/src/assets/images/warehouse_logistics_bg_1793337557755.jpg"
          alt="RippleGuard Automated Logistics Distribution Center"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 filter brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/80 to-[#0B1528]/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Brand Kicker Header */}
        <div className="bg-[#0B1528] px-8 pt-8 pb-6 text-white text-center border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30 mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">RippleGuard AI</h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">One Disruption. All Orders Protected.</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your credentials to access the logistics control tower.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@rippleguard.ai"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600">Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs rounded-md shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Control Tower</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Access for Hackathon Judges */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Judge & Evaluator Demo Accounts
              </span>
              <span className="text-[10px] text-blue-600 font-mono">1-Click Launch</span>
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Logistics Manager')}
                className="w-full p-2 text-left rounded-md border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-blue-700">Elena Rostova</div>
                  <div className="text-[10px] text-slate-500">Logistics Manager · Full Operational & Approval Authority</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Warehouse Operator')}
                className="w-full p-2 text-left rounded-md border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-blue-700">Marcus Vance</div>
                  <div className="text-[10px] text-slate-500">Warehouse Operator · Stock & Fulfillment Authority</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Procurement Approver')}
                className="w-full p-2 text-left rounded-md border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between text-xs group"
              >
                <div>
                  <div className="font-semibold text-slate-900 group-hover:text-blue-700">David Chen</div>
                  <div className="text-[10px] text-slate-500">Procurement Approver · Vendor & Strategic Sourcing</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Secured Enterprise Supply Chain Platform · NIST SP 800-161 Compliant
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Reset Password</h3>
            <p className="text-slate-500 mb-4">
              Enter your enterprise email to receive recovery instructions.
            </p>
            {forgotSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-center mb-4">
                Password recovery link dispatched to {forgotEmail || email}.
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <input
                  type="email"
                  value={forgotEmail || email}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {!forgotSent && (
                <button
                  onClick={() => setForgotSent(true)}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Send Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
