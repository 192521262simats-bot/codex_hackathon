import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Database,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  FileJson,
  Trash2,
  Plus,
  Edit2,
  Search,
  ExternalLink,
  RefreshCw,
  FileUp,
  ClipboardPaste,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { parseCSVToRawRows, detectColumnMapping } from '../../lib/dataIngestion';

type SupportedTable = 'orders' | 'suppliers' | 'products' | 'shipments' | 'inventory';

export const DataManagementView: React.FC = () => {
  const {
    orders: appOrders,
    shipments: appShipments,
    inventory: appInventory,
    suppliers: appSuppliers,
    products: appProducts,
    dataProvenance,
    exportDataJSON,
    exportEntityCSV,
    clearAllData,
    clearTable,
    deleteRecord,
    ingestDataset,
    setCurrentTab,
  } = useApp();

  const [activeTable, setActiveTable] = useState<SupportedTable>('orders');
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File Ingestion / Dropzone states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);
  const [pastedContent, setPastedContent] = useState<string>('');
  const [previewData, setPreviewData] = useState<{
    fileName: string;
    rowCount: number;
    headers: string[];
    mapping: Record<string, string>;
    sampleRows: any[];
    rawRows: any[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [clearMode, setClearMode] = useState<'table' | 'all'>('table');

  // Form data for creating
  const [formData, setFormData] = useState<Record<string, any>>({});

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Fetch records prioritizing Supabase client, then backend API, then AppContext state
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // If active table or all data has been cleared, strictly return empty array
    if (
      localStorage.getItem('rippleguard_data_cleared') === 'true' ||
      localStorage.getItem(`rippleguard_cleared_${activeTable}`) === 'true'
    ) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Try querying Supabase client directly
      const { data, error } = await supabase.from(activeTable).select('*');

      if (!error && Array.isArray(data) && data.length > 0) {
        setRecords(data);
        setIsLoading(false);
        return;
      }

      // 2. Query Cloud SQL PostgreSQL backend
      const apiRes = await fetch(`/api/${activeTable}`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (Array.isArray(apiData)) {
          // If backend returns array (even 0 length), respect it directly!
          setRecords(apiData);
          setIsLoading(false);
          return;
        }
      }

      // 3. Fallback to AppContext in-memory / LocalStorage state
      const appRecords =
        activeTable === 'orders'
          ? appOrders
          : activeTable === 'shipments'
          ? appShipments
          : activeTable === 'inventory'
          ? appInventory
          : activeTable === 'suppliers'
          ? appSuppliers
          : appProducts;

      setRecords(appRecords || []);
    } catch (err: any) {
      console.warn('Fetch note:', err);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTable, appOrders, appShipments, appInventory, appSuppliers, appProducts]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Process raw text (from CSV file or pasted content)
  const processRawText = (text: string, sourceName: string) => {
    try {
      let parsedRows: any[] = [];
      let detectedHeaders: string[] = [];

      const trimmed = text.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        // JSON format
        const json = JSON.parse(trimmed);
        parsedRows = Array.isArray(json) ? json : json[activeTable] || json.records || json.data || [];
        if (parsedRows.length > 0) {
          detectedHeaders = Object.keys(parsedRows[0]);
        }
      } else {
        // CSV / TSV format
        const { headers, rows } = parseCSVToRawRows(trimmed);
        detectedHeaders = headers;
        parsedRows = rows;
      }

      if (parsedRows.length === 0) {
        showNotification('No data rows found. Please check your CSV/JSON file formatting.', true);
        return;
      }

      const mapping = detectColumnMapping(detectedHeaders);

      setPreviewData({
        fileName: sourceName,
        rowCount: parsedRows.length,
        headers: detectedHeaders,
        mapping,
        sampleRows: parsedRows.slice(0, 3),
        rawRows: parsedRows,
      });
    } catch (err: any) {
      showNotification(`File parse error: ${err.message}`, true);
    }
  };

  // Handle file selection via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processRawText(content, file.name);
      // Reset input value so re-selecting the same file fires onChange again
      if (e.target) e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processRawText(content, file.name);
    };
    reader.readAsText(file);
  };

  // Commit previewed data into application & database
  const handleCommitIngestion = async () => {
    if (!previewData || previewData.rawRows.length === 0) return;

    setIsLoading(true);
    try {
      const res = await ingestDataset(previewData.rawRows, activeTable, previewData.fileName);

      if (res.success) {
        showNotification(
          `Successfully ingested ${res.count} records from ${previewData.fileName} into ${res.table}! Dashboards and risk models are now running on your data.`
        );
        setPreviewData(null);
        setPastedContent('');
        setShowPasteBox(false);
        fetchRecords();
      } else {
        showNotification(`Ingestion failed: ${res.errors.join('; ')}`, true);
      }
    } catch (err: any) {
      showNotification(`Ingestion error: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct manual record creation
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newRecordId = formData.id || `${activeTable.slice(0, 3)}-${Date.now()}`;
    const newRecord = {
      ...formData,
      id: newRecordId,
    };

    try {
      await ingestDataset([newRecord], activeTable, 'Manual Entry');
      showNotification(`Record ${newRecordId} created successfully in ${activeTable}!`);
      setShowAddModal(false);
      setFormData({});
      fetchRecords();
    } catch (err: any) {
      showNotification(`Failed to insert record: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing record
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setIsLoading(true);

    try {
      // Update in Supabase
      await supabase.from(activeTable).update(editingRecord).eq('id', editingRecord.id);

      // Update in Cloud SQL
      await fetch(`/api/${activeTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRecord),
      });

      // Update in LocalStorage
      try {
        const stored = localStorage.getItem(`rippleguard_data_${activeTable}`);
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.map((item: any) => (item.id === editingRecord.id ? editingRecord : item));
          localStorage.setItem(`rippleguard_data_${activeTable}`, JSON.stringify(updated));
        }
      } catch (e) {}

      showNotification(`Record ${editingRecord.id} updated successfully!`);
      setEditingRecord(null);
      fetchRecords();
    } catch (err: any) {
      showNotification(`Failed to update record: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete record
  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteRecord(activeTable, id);
      setRecords((prev) => prev.filter((item) => item.id !== id));
      showNotification(`Record ${id} removed.`);
    } catch (err: any) {
      showNotification(`Failed to delete record: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Wipe entire active table
  const handleClearTable = async () => {
    setIsLoading(true);
    try {
      await clearTable(activeTable);
      setRecords([]);
      showNotification(`All records in ${activeTable} wiped. Table is now completely empty.`);
      setShowClearConfirm(false);
    } catch (err: any) {
      showNotification(`Failed to clear table: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Wipe all system tables (Everything to 0)
  const handleClearAllData = async () => {
    setIsLoading(true);
    try {
      await clearAllData();
      setRecords([]);
      showNotification(`All datasets wiped across all modules. Everything is now 0 and ready for your data.`);
      setShowClearConfirm(false);
    } catch (err: any) {
      showNotification(`Failed to wipe all data: ${err.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered view
  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    return JSON.stringify(r).toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dataset Ingestion & Management</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              Custom Data Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your collected logistics datasets. Automatic column matching, relational graph linking, and live storage.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Dataset File</span>
          </button>

          <button
            onClick={() => {
              setFormData({});
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Manual Entry</span>
          </button>

          <button
            onClick={() => {
              setClearMode('table');
              setShowClearConfirm(true);
            }}
            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            title={`Wipe all records from ${activeTable}`}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Clear Table ({activeTable})</span>
          </button>

          <button
            onClick={() => {
              setClearMode('all');
              setShowClearConfirm(true);
            }}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            title="Wipe all datasets across entire application and reset all counters to 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Everything to 0</span>
          </button>

          <button
            onClick={fetchRecords}
            disabled={isLoading}
            className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dataset Upload Dropzone & Ingestion Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`bg-white rounded-xl border-2 transition-all p-5 shadow-xs ${
          isDragging
            ? 'border-blue-500 bg-blue-50/40 ring-4 ring-blue-50'
            : 'border-dashed border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Upload Your Collected Logistics Dataset</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Target: {activeTable}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Drop your CSV, TSV, or JSON file here, or click to browse. Automatically detects column headers (e.g.{' '}
                <span className="font-mono text-slate-700">Customer Name, Product, Quantity, Due Date</span>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.json,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browse File (.csv / .json)</span>
            </button>
            <button
              onClick={() => setShowPasteBox(!showPasteBox)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-slate-600" />
              <span>{showPasteBox ? 'Hide Paste' : 'Paste Rows'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Paste Box */}
        {showPasteBox && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Paste table rows from Excel, Google Sheets, or CSV:</span>
              <span className="text-[11px] text-slate-400">First line should contain column headers</span>
            </div>
            <textarea
              rows={4}
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Customer Name,Product ID,Quantity,Unit Price,Delivery Deadline&#10;Stark Logistics,MCU-900,120,45,2026-11-20"
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPastedContent('')}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
              <button
                onClick={() => processRawText(pastedContent, 'Pasted Data')}
                disabled={!pastedContent.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-medium"
              >
                Parse & Ingest Pasted Rows
              </button>
            </div>
          </div>
        )}

        {/* Live File Preview Confirmation Card */}
        {previewData && (
          <div className="mt-4 p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900">
                  Ready to Ingest: {previewData.rowCount} records from &ldquo;{previewData.fileName}&rdquo;
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-semibold">
                  Target: {activeTable}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewData(null)}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommitIngestion}
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Run RippleGuard on Dataset</span>
                </button>
              </div>
            </div>

            {/* Detected Header Mapping Badges */}
            <div>
              <div className="text-[11px] font-semibold text-slate-700 mb-1">Detected Column Mappings:</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(previewData.mapping).map(([raw, mapped]) => (
                  <span
                    key={raw}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-blue-200 rounded font-mono text-[10px] text-slate-800"
                  >
                    <span className="text-slate-500">{raw}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-blue-500" />
                    <span className="font-bold text-blue-700">{mapped}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Supabase & Storage Status Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Supabase & Cloud SQL Storage</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                {isSupabaseConfigured ? 'Remote Supabase Configured' : 'Live Sync Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Active Table: <strong className="font-mono text-slate-800">{activeTable}</strong> · Loaded User Records:{' '}
              <strong className="font-mono text-slate-900">{records.length}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>View Control Tower</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => exportEntityCSV(activeTable as any)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {(['orders', 'suppliers', 'products', 'shipments', 'inventory'] as const).map((tbl) => {
          const count =
            tbl === 'orders'
              ? appOrders.length
              : tbl === 'shipments'
              ? appShipments.length
              : tbl === 'inventory'
              ? appInventory.length
              : tbl === 'suppliers'
              ? appSuppliers.length
              : appProducts.length;

          return (
            <button
              key={tbl}
              onClick={() => setActiveTable(tbl)}
              className={`px-3.5 py-1.5 rounded-md font-medium capitalize transition-colors flex items-center gap-2 ${
                activeTable === tbl
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tbl}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  activeTable === tbl ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${records.length} records in ${activeTable}...`}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Showing {filteredRecords.length} of {records.length} records
        </div>
      </div>

      {/* Live Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-3">
            <Database className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-semibold text-slate-700 text-sm">No records in {activeTable} yet</div>
            <p className="text-slate-400 max-w-md mx-auto text-xs">
              Zero simulated or artificial records exist. Select your collected dataset file above to upload it, or enter records manually.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700 inline-flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload {activeTable} Dataset</span>
              </button>
              <button
                onClick={() => {
                  setFormData({});
                  setShowAddModal(true);
                }}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 rounded font-medium text-xs hover:bg-slate-50 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Create Manually</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  {Object.keys(filteredRecords[0] || {}).slice(0, 7).map((key) => (
                    <th key={key} className="py-2.5 px-4 capitalize font-mono text-[11px]">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    {Object.keys(filteredRecords[0] || {}).slice(0, 7).map((key) => (
                      <td key={key} className="py-2.5 px-4 text-slate-800 font-mono text-[11px] truncate max-w-xs">
                        {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '')}
                      </td>
                    ))}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingRecord({ ...row })}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                          title="Edit row"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-1 text-slate-500 hover:text-red-600 rounded hover:bg-slate-100"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Add Record to {activeTable}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 mt-4">
              {activeTable === 'orders' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Customer / Client Enterprise Name</label>
                    <input
                      type="text"
                      required
                      value={formData.customerName || ''}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="e.g. Lockheed Aviation Logistics"
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Customer Tier</label>
                      <select
                        value={formData.customerTier || 'Tier 1 Enterprise'}
                        onChange={(e) => setFormData({ ...formData, customerTier: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      >
                        <option value="Tier 1 Enterprise">Tier 1 Enterprise</option>
                        <option value="Critical Healthcare">Critical Healthcare</option>
                        <option value="Aerospace OEM">Aerospace OEM</option>
                        <option value="Standard">Standard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Product Component ID / SKU</label>
                      <input
                        type="text"
                        required
                        value={formData.productId || ''}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        placeholder="e.g. MCU-9400"
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.quantity || 100}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Unit Price ($)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.unitPrice || 150}
                        onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                      <select
                        value={formData.priority || 'High'}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Delivery Deadline</label>
                    <input
                      type="date"
                      required
                      value={formData.deliveryDeadline || '2026-11-20'}
                      onChange={(e) => setFormData({ ...formData, deliveryDeadline: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                </>
              )}

              {activeTable === 'suppliers' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Supplier Company Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Apex Industrial Sourcing"
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Country</label>
                      <input
                        type="text"
                        required
                        value={formData.country || 'United States'}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Location / Depot</label>
                      <input
                        type="text"
                        required
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Chicago Hub"
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Reliability Score (0-100)</label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={formData.reliabilityScore || 95}
                        onChange={(e) => setFormData({ ...formData, reliabilityScore: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Average Lead Time (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.avgDeliveryDays || 5}
                        onChange={(e) => setFormData({ ...formData, avgDeliveryDays: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'products' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Product Component Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Servo Electro-Hydraulic Actuator"
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">SKU Code</label>
                      <input
                        type="text"
                        required
                        value={formData.sku || ''}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g. ACT-2900"
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Unit Price ($)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.unitPrice || 100}
                        onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'shipments' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Product / SKU</label>
                      <input
                        type="text"
                        required
                        value={formData.productId || 'prod-1'}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Destination Location</label>
                      <input
                        type="text"
                        required
                        value={formData.destinationLocation || 'Chicago Central Logistics Hub'}
                        onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Status</label>
                      <select
                        value={formData.status || 'In Transit'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      >
                        <option value="In Transit">In Transit</option>
                        <option value="Processing">Processing</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Expected Delivery</label>
                      <input
                        type="date"
                        value={formData.expectedDelivery || '2026-11-15'}
                        onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTable === 'inventory' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Product ID / SKU</label>
                      <input
                        type="text"
                        required
                        value={formData.productId || 'prod-1'}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Warehouse Hub ID</label>
                      <input
                        type="text"
                        required
                        value={formData.warehouseId || 'wh-1'}
                        onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Available Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.availableQty || 500}
                        onChange={(e) => setFormData({ ...formData, availableQty: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Reorder Level</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reorderLevel || 150}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                        className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Edit Record: {editingRecord.id}</h3>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 mt-4">
              {Object.keys(editingRecord)
                .filter((k) => k !== 'id' && k !== 'createdAt' && k !== 'created_at')
                .slice(0, 8)
                .map((key) => (
                  <div key={key}>
                    <label className="block text-slate-700 font-semibold mb-1 capitalize font-mono text-[11px]">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type="text"
                      value={editingRecord[key] ?? ''}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                ))}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  Commit Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{clearMode === 'all' ? 'Reset Everything to 0?' : `Wipe ${activeTable} Table?`}</span>
            </div>
            <p className="text-slate-600 mb-4">
              {clearMode === 'all' ? (
                <>
                  This will completely clear <strong>all orders, shipments, inventory, suppliers, disruptions, and plans</strong> across the system. All counters, KPIs, and charts will drop to <strong>0</strong>. Your workspace will be completely empty and ready for fresh dataset entry.
                </>
              ) : (
                <>
                  This will remove all records in <strong className="font-mono text-slate-900">{activeTable}</strong> across Supabase, Cloud SQL, and memory. The table counter will drop to <strong>0</strong>.
                </>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={clearMode === 'all' ? handleClearAllData : handleClearTable}
                className="px-4 py-1.5 bg-red-600 text-white rounded font-medium hover:bg-red-700 shadow-xs"
              >
                {clearMode === 'all' ? 'Confirm Reset Everything to 0' : `Confirm Wipe ${activeTable}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
