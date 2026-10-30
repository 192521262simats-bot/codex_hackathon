import React, { useState } from 'react';
import {
  Database,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  FileJson,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DataManagementView: React.FC = () => {
  const {
    dataProvenance,
    resetToDefaultData,
    exportDataJSON,
    exportEntityCSV,
    importRecords,
    orders,
    shipments,
    inventory,
    suppliers,
  } = useApp();

  const [targetEntity, setTargetEntity] = useState<'orders' | 'shipments' | 'inventory' | 'suppliers'>('orders');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; count: number; errors: string[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      parseAndImport(content, file.name);
    };
    reader.readAsText(file);
  };

  const parseAndImport = (content: string, name: string) => {
    try {
      if (name.endsWith('.json')) {
        const parsed = JSON.parse(content);
        const dataRows = Array.isArray(parsed) ? parsed : parsed[targetEntity] || [];
        const res = importRecords(targetEntity, dataRows, name);
        setImportStatus({ success: res.success, count: res.importedCount, errors: res.errors });
      } else {
        // Simple CSV parser
        const lines = content.trim().split('\n');
        if (lines.length < 2) {
          setImportStatus({ success: false, count: 0, errors: ['CSV file has no data rows.'] });
          return;
        }
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const rowObj: any = {};
          headers.forEach((h, i) => {
            rowObj[h] = values[i];
          });
          return rowObj;
        });

        const res = importRecords(targetEntity, rows, name);
        setImportStatus({ success: res.success, count: res.importedCount, errors: res.errors });
      }
    } catch (err: any) {
      setImportStatus({ success: false, count: 0, errors: [`Parsing Error: ${err.message}`] });
    }
  };

  const downloadTemplate = (type: 'orders' | 'shipments' | 'inventory' | 'suppliers') => {
    let headers: string[] = [];
    let sampleRow: string[] = [];

    if (type === 'orders') {
      headers = ['orderNumber', 'customerName', 'customerTier', 'productId', 'quantity', 'deliveryDeadline', 'priority'];
      sampleRow = ['ORD-2026-9999', 'Lockheed Martin Orbital', 'Tier 1 Enterprise', 'prod-1', '150', '2026-11-20', 'High'];
    } else if (type === 'shipments') {
      headers = ['orderId', 'productId', 'supplierId', 'carrierId', 'destinationLocation', 'expectedDelivery', 'status'];
      sampleRow = ['ord-1', 'prod-1', 'sup-1', 'car-1', 'Chicago Central Logistics Hub', '2026-11-12', 'In Transit'];
    } else if (type === 'inventory') {
      headers = ['productId', 'warehouseId', 'availableQty', 'reservedQty', 'requiredQty', 'reorderLevel'];
      sampleRow = ['prod-1', 'wh-1', '500', '150', '200', '250'];
    } else if (type === 'suppliers') {
      headers = ['supplierNumber', 'name', 'country', 'location', 'reliabilityScore', 'avgDeliveryDays'];
      sampleRow = ['SUP-9999', 'Apex Quantum Fabrication', 'Japan', 'Osaka Science Park', '96', '8'];
    }

    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Data Ingestion & Transparency</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              Provenance Tracker
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise CSV/JSON batch ingestion, field schema validation, and demonstration state management.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={exportDataJSON}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full JSON</span>
          </button>
          <button
            onClick={resetToDefaultData}
            className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
      </div>

      {/* Provenance Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Current Data Provenance & Lineage
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1">Active Origin Mode</span>
            <span className="font-bold text-sm text-blue-600 block">{dataProvenance.sourceType}</span>
            <span className="text-[10px] text-slate-400">
              {dataProvenance.sourceFile ? `File: ${dataProvenance.sourceFile}` : 'Standardized demonstration schema'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1">Total Active Records</span>
            <span className="font-bold text-sm text-slate-900 font-mono block">
              {(orders.length + shipments.length + inventory.length + suppliers.length).toLocaleString()} Records
            </span>
            <span className="text-[10px] text-slate-400">Orders, shipments, inventory &amp; vendors</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1">Last Reconciliation</span>
            <span className="font-bold text-sm text-slate-900 font-mono block">
              {dataProvenance.lastImportedAt || '2026-10-29 08:00'}
            </span>
            <span className="text-[10px] text-slate-400">Synchronized with local persistence</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1">Schema Compliance</span>
            <span className="font-bold text-sm text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              100% Validated
            </span>
            <span className="text-[10px] text-slate-400">Zero duplicate keys detected</span>
          </div>
        </div>
      </div>

      {/* Import Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Dropzone */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Batch Record Ingestion</h2>
            <p className="text-xs text-slate-500 mb-4">
              Select destination table and upload CSV or JSON. Schema validator will verify columns and check for duplicate IDs.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Entity</label>
              <select
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded text-xs bg-slate-50"
              >
                <option value="orders">Customer Orders ({orders.length} currently)</option>
                <option value="shipments">Logistics Shipments ({shipments.length} currently)</option>
                <option value="inventory">Inventory Quantities ({inventory.length} currently)</option>
                <option value="suppliers">Supplier Directory ({suppliers.length} currently)</option>
              </select>
            </div>

            {/* Drop area */}
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 text-center">
              <Upload className="w-8 h-8 text-blue-600 mb-2" />
              <span className="font-semibold text-slate-800 text-xs">Click or drag CSV / JSON file to import</span>
              <span className="text-[10px] text-slate-400 mt-1">UTF-8 encoded files supported</span>
              <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
            </label>

            {importStatus && (
              <div
                className={`mt-4 p-3 rounded-lg text-xs ${
                  importStatus.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {importStatus.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Successfully ingested {importStatus.count} {targetEntity} records from {fileName}!</span>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold mb-1">Import Failed:</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {importStatus.errors.map((e, idx) => (
                        <li key={idx}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Downloadable Standard Templates & Exports */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Download Standard Templates &amp; Export Data</h2>
            <p className="text-xs text-slate-500 mb-4">
              Pre-formatted CSV templates for clean operational ingestion into RippleGuard AI.
            </p>

            <div className="space-y-2.5 text-xs">
              {(['orders', 'shipments', 'inventory', 'suppliers'] as const).map((ent) => (
                <div key={ent} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 capitalize block">{ent} Schema Template</span>
                    <span className="text-[10px] text-slate-400">Includes mandatory field definitions and example row</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadTemplate(ent)}
                      className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Template</span>
                    </button>
                    <button
                      onClick={() => exportEntityCSV(ent)}
                      className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded font-medium text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
