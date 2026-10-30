import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecoverySimulatorView: React.FC = () => {
  const { runWhatIfSimulation, activeDisruptionId, disruptions, setCurrentTab } = useApp();

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationDelayOffset, setSimulationDelayOffset] = useState<number>(0);
  const [freightPremiumPct, setFreightPremiumPct] = useState<number>(100); // 100% = normal
  const [hasRun, setHasRun] = useState(true);

  const currentDisruption = disruptions.find((d) => d.id === activeDisruptionId) || disruptions[0];

  // Base simulation
  const results = runWhatIfSimulation(currentDisruption?.id);

  // Apply custom interactive parameters to simulation
  const adjustedResults = results.map((res) => {
    let delay = res.expectedDeliveryDelayDays + simulationDelayOffset;
    let cost = Math.round(res.additionalCost * (freightPremiumPct / 100));
    return {
      ...res,
      expectedDeliveryDelayDays: Math.max(0, delay),
      additionalCost: cost,
    };
  });

  const bestOption = adjustedResults.find((r) => r.isRecommended) || adjustedResults[1];

  const handleRunAnalysis = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setHasRun(true);
    }, 400);
  };

  const handleResetParameters = () => {
    setSimulationDelayOffset(0);
    setFreightPremiumPct(100);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">What-if Recovery Simulator</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              Non-Destructive Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Model operational tradeoffs between cost, SLA transit penalties, and order rescue velocity.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isSimulating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md text-xs font-semibold shadow-xs transition-all flex items-center gap-2 self-start"
        >
          <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Calculating Tradeoffs...' : 'Run Scenario Analysis'}</span>
        </button>
      </div>

      {/* Parameter Adjustment Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600" />
            Hypothetical Parameter Simulation (Sandbox Mode)
          </span>
          <button
            onClick={handleResetParameters}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-600 mb-1">
              <span>Port / Customs Additional Delay</span>
              <span className="font-mono font-bold text-slate-900">+{simulationDelayOffset} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={simulationDelayOffset}
              onChange={(e) => setSimulationDelayOffset(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-600 mb-1">
              <span>Spot Freight Market Surge Multiplier</span>
              <span className="font-mono font-bold text-slate-900">{freightPremiumPct}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="200"
              step="10"
              value={freightPremiumPct}
              onChange={(e) => setFreightPremiumPct(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Best Option Highlight Banner */}
      <div className="p-5 rounded-xl bg-blue-600 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-blue-200">
            Algorithmic Recommendation
          </span>
          <h2 className="text-lg font-bold mt-0.5">{bestOption.name}</h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">{bestOption.description}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="bg-white/10 p-3 rounded-lg text-center backdrop-blur-xs">
            <div className="text-[10px] text-blue-200">ADDITIONAL COST</div>
            <div className="text-xl font-bold">${bestOption.additionalCost.toLocaleString()}</div>
          </div>
          <div className="bg-white/10 p-3 rounded-lg text-center backdrop-blur-xs">
            <div className="text-[10px] text-blue-200">ORDERS RESCUED</div>
            <div className="text-xl font-bold">{bestOption.ordersRecovered} Orders</div>
          </div>
          <div className="bg-white/10 p-3 rounded-lg text-center backdrop-blur-xs">
            <div className="text-[10px] text-blue-200">REMAINING RISK</div>
            <div className="text-xl font-bold">{bestOption.remainingRiskScore}/100</div>
          </div>
        </div>
      </div>

      {/* Comparative Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adjustedResults.map((option, idx) => {
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                option.isRecommended
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">{option.name}</h3>
                  {option.isRecommended && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0">
                      OPTIMAL
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mb-4 line-clamp-2">{option.description}</p>

                {/* Quantitative Comparisons */}
                <div className="space-y-3 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Delivery Delay:</span>
                      <span className="font-mono font-bold text-slate-900">
                        +{option.expectedDeliveryDelayDays} {option.expectedDeliveryDelayDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, option.expectedDeliveryDelayDays * 16)}%` }}
                        className={`h-full ${option.expectedDeliveryDelayDays > 4 ? 'bg-red-500' : 'bg-blue-600'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Additional Cost:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ${option.additionalCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (option.additionalCost / 12000) * 100)}%` }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Orders Recovered:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {option.ordersRecovered} Orders
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Remaining Risk:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {option.remainingRiskScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3">
                <button
                  onClick={() => setCurrentTab('approvals')}
                  className={`w-full py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                    option.isRecommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Authorize Strategy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
