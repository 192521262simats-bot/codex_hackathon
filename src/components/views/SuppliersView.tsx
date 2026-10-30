import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  ShieldCheck,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Boxes,
  MapPin,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';

export const SuppliersView: React.FC = () => {
  const { suppliers, products, setCurrentTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductLookup, setSelectedProductLookup] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProduct =
        selectedProductLookup === 'all' || s.productsSupplied.includes(selectedProductLookup);

      return matchSearch && matchProduct;
    });
  }, [suppliers, searchQuery, selectedProductLookup]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Supplier Directory & Performance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Vendor reliability benchmarking, lead time variability, and pre-vetted alternative sources.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('recovery')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start"
        >
          <span>Find Alternative Suppliers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplier, country, region..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 font-medium">Filter by Product Line:</span>
          <select
            value={selectedProductLookup}
            onChange={(e) => setSelectedProductLookup(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
          >
            <option value="all">All Products Supplied</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Supplier Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => {
          const suppliedProds = products.filter((p) => supplier.productsSupplied.includes(p.id));
          const isDisrupted = supplier.status === 'Disrupted';

          return (
            <div
              key={supplier.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isDisrupted
                  ? 'border-red-300 bg-red-50/20 ring-1 ring-red-200'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{supplier.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{supplier.supplierNumber}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{supplier.location}, {supplier.country}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isDisrupted
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {supplier.status}
                  </span>
                </div>

                {/* Score & Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500">Reliability</div>
                    <div className={`text-base font-bold font-mono tabular-nums ${
                      supplier.reliabilityScore >= 90 ? 'text-emerald-600' : supplier.reliabilityScore >= 80 ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      {supplier.reliabilityScore}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500">Avg Lead Time</div>
                    <div className="text-base font-bold font-mono tabular-nums text-slate-800">
                      {supplier.avgDeliveryDays}d
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500">Lead Variance</div>
                    <div className="text-base font-bold font-mono tabular-nums text-slate-800">
                      &plusmn;{supplier.leadTimeVarianceDays}d
                    </div>
                  </div>
                </div>

                {/* Products Supplied */}
                <div className="text-xs mb-3">
                  <span className="text-[11px] font-semibold text-slate-700 block mb-1">Supplied Components:</span>
                  <div className="flex flex-wrap gap-1">
                    {suppliedProds.map((p) => (
                      <span
                        key={p.id}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {p.sku} ({p.name.split(' ')[0]})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] font-mono truncate">{supplier.contactEmail}</span>
                <button
                  onClick={() => setSelectedSupplier(supplier)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-[11px] flex items-center gap-0.5"
                >
                  <span>Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplier Profile Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-slate-400 text-[10px] uppercase">{selectedSupplier.supplierNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedSupplier.name}</h3>
                <p className="text-slate-500">{selectedSupplier.location}, {selectedSupplier.country}</p>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-slate-500">Reliability Score:</span>
                  <div className="text-lg font-bold font-mono text-blue-600">{selectedSupplier.reliabilityScore}%</div>
                </div>
                <div>
                  <span className="text-slate-500">Quality Inspection Rating:</span>
                  <div className="text-lg font-bold font-mono text-emerald-600">{selectedSupplier.qualityRating} / 5.0</div>
                </div>
                <div>
                  <span className="text-slate-500">Average Transit Lead Time:</span>
                  <div className="font-mono text-slate-900 font-semibold">{selectedSupplier.avgDeliveryDays} Days</div>
                </div>
                <div>
                  <span className="text-slate-500">Operational Status:</span>
                  <div className="font-semibold text-slate-900">{selectedSupplier.status}</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">Contracted Product Catalog</span>
                <div className="space-y-1.5">
                  {products
                    .filter((p) => selectedSupplier.productsSupplied.includes(p.id))
                    .map((p) => (
                      <div key={p.id} className="p-2 border border-slate-200 rounded flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.sku} · {p.category}</div>
                        </div>
                        <div className="font-mono text-slate-800 font-bold">${p.unitPrice}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
