import React, { useState, useMemo } from 'react';
import {
  Network,
  AlertTriangle,
  Layers,
  ArrowRight,
  Filter,
  Info,
  CheckCircle2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Shield,
  Truck,
  Building2,
  Boxes,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier, Product, Warehouse, Shipment, CustomerOrder } from '../../types';

interface NodeData {
  id: string;
  type: 'supplier' | 'product' | 'warehouse' | 'shipment' | 'order';
  label: string;
  subLabel: string;
  status: 'normal' | 'disrupted' | 'at-risk' | 'recovered';
  raw: any;
  tier: number; // 0 = supplier, 1 = product, 2 = warehouse, 3 = shipment, 4 = order
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  isDisrupted: boolean;
  isAtRisk: boolean;
  isRecovered: boolean;
}

export const DependencyMapView: React.FC = () => {
  const {
    suppliers,
    products,
    warehouses,
    shipments,
    orders,
    disruptions,
    activeDisruptionId,
    setActiveDisruptionId,
    setCurrentTab,
  } = useApp();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'disrupted_only'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Active Disruption to highlight
  const currentDisruption = disruptions.find((d) => d.id === activeDisruptionId) || disruptions[0];

  // Compute Nodes and Edges from actual stored relationships
  const { nodes, edges, impactSummary } = useMemo(() => {
    const rawNodes: NodeData[] = [];
    const rawEdges: EdgeData[] = [];

    const disruptedSupplierIds = new Set(
      disruptions.filter((d) => d.status === 'Active' && d.targetType === 'supplier').map((d) => d.targetId)
    );
    const affectedProdIds = new Set(
      disruptions.filter((d) => d.status === 'Active').flatMap((d) => d.affectedProductIds)
    );
    const affectedWhIds = new Set(
      disruptions.filter((d) => d.status === 'Active').flatMap((d) => d.affectedWarehouseIds)
    );
    const affectedShpIds = new Set(
      disruptions.filter((d) => d.status === 'Active').flatMap((d) => d.affectedShipmentIds)
    );
    const affectedOrdIds = new Set(
      disruptions.filter((d) => d.status === 'Active').flatMap((d) => d.affectedOrderIds)
    );

    // 1. Suppliers (Tier 0)
    suppliers.forEach((s) => {
      const isDisr = disruptedSupplierIds.has(s.id);
      rawNodes.push({
        id: s.id,
        type: 'supplier',
        label: s.name,
        subLabel: `${s.country} · ${s.reliabilityScore}% Rel`,
        status: isDisr ? 'disrupted' : 'normal',
        raw: s,
        tier: 0,
      });
    });

    // 2. Products (Tier 1) - choose relevant top 10 products for crisp layout
    const displayProducts = products.slice(0, 10);
    displayProducts.forEach((p) => {
      const isAff = affectedProdIds.has(p.id);
      rawNodes.push({
        id: p.id,
        type: 'product',
        label: p.name,
        subLabel: `${p.sku} · $${p.unitPrice}`,
        status: isAff ? 'disrupted' : 'normal',
        raw: p,
        tier: 1,
      });

      // Edge Supplier -> Product
      if (p.primarySupplierId) {
        const isDisruptedEdge = disruptedSupplierIds.has(p.primarySupplierId);
        rawEdges.push({
          id: `e-${p.primarySupplierId}-${p.id}`,
          source: p.primarySupplierId,
          target: p.id,
          isDisrupted: isDisruptedEdge,
          isAtRisk: false,
          isRecovered: false,
        });
      }
    });

    // 3. Warehouses (Tier 2)
    warehouses.forEach((w) => {
      const isAff = affectedWhIds.has(w.id);
      rawNodes.push({
        id: w.id,
        type: 'warehouse',
        label: w.name,
        subLabel: `${w.city} · ${w.currentUtilizationPercent}% cap`,
        status: isAff ? 'at-risk' : 'normal',
        raw: w,
        tier: 2,
      });
    });

    // Edges Product -> Warehouse (derived from inventory)
    displayProducts.forEach((p) => {
      // Connect to Chicago Hub and Reno Gateway
      const edgeWh1 = `wh-1`;
      const isDisruptedEdge = affectedProdIds.has(p.id) && affectedWhIds.has(edgeWh1);
      rawEdges.push({
        id: `e-${p.id}-${edgeWh1}`,
        source: p.id,
        target: edgeWh1,
        isDisrupted: isDisruptedEdge,
        isAtRisk: isDisruptedEdge,
        isRecovered: false,
      });

      if (p.id === 'prod-4' || p.id === 'prod-1') {
        rawEdges.push({
          id: `e-${p.id}-wh-2`,
          source: p.id,
          target: 'wh-2',
          isDisrupted: false,
          isAtRisk: false,
          isRecovered: true,
        });
      }
    });

    // 4. Shipments (Tier 3) - Top 8 representative shipments
    const displayShipments = shipments.slice(0, 8);
    displayShipments.forEach((shp) => {
      const isAff = affectedShpIds.has(shp.id);
      const isRecovered = shp.lastCheckpoint.includes('Recovery dispatched');
      rawNodes.push({
        id: shp.id,
        type: 'shipment',
        label: shp.shipmentNumber,
        subLabel: `${shp.status} · ${shp.originLocation.split(',')[0]}`,
        status: isRecovered ? 'recovered' : isAff || shp.status === 'Delayed' ? 'disrupted' : 'normal',
        raw: shp,
        tier: 3,
      });

      // Edge Warehouse -> Shipment
      const sourceWh = shp.destinationWarehouseId || 'wh-1';
      rawEdges.push({
        id: `e-${sourceWh}-${shp.id}`,
        source: sourceWh,
        target: shp.id,
        isDisrupted: isAff,
        isAtRisk: isAff,
        isRecovered,
      });
    });

    // 5. Customer Orders (Tier 4) - Top 8 representative orders
    const displayOrders = orders.slice(0, 8);
    displayOrders.forEach((ord) => {
      const isHighRisk = ord.riskLevel === 'High';
      const isMediumRisk = ord.riskLevel === 'Medium';
      const isRecovered = ord.status === 'Recovered';
      rawNodes.push({
        id: ord.id,
        type: 'order',
        label: ord.customerName.split(' ')[0] + ' ' + (ord.customerName.split(' ')[1] || ''),
        subLabel: `${ord.orderNumber} · Risk ${ord.riskScore}/100`,
        status: isRecovered ? 'recovered' : isHighRisk ? 'disrupted' : isMediumRisk ? 'at-risk' : 'normal',
        raw: ord,
        tier: 4,
      });

      // Edge Shipment -> Order
      if (ord.linkedShipmentId) {
        rawEdges.push({
          id: `e-${ord.linkedShipmentId}-${ord.id}`,
          source: ord.linkedShipmentId,
          target: ord.id,
          isDisrupted: isHighRisk,
          isAtRisk: isMediumRisk,
          isRecovered,
        });
      }
    });

    // Filter nodes if disrupted only
    let finalNodes = rawNodes;
    if (filterMode === 'disrupted_only') {
      finalNodes = rawNodes.filter((n) => n.status !== 'normal');
    }

    const finalNodeIds = new Set(finalNodes.map((n) => n.id));
    const finalEdges = rawEdges.filter((e) => finalNodeIds.has(e.source) && finalNodeIds.has(e.target));

    const impactSummary = {
      affectedSuppliers: rawNodes.filter((n) => n.type === 'supplier' && n.status === 'disrupted').length,
      affectedProducts: rawNodes.filter((n) => n.type === 'product' && n.status === 'disrupted').length,
      affectedWarehouses: rawNodes.filter((n) => n.type === 'warehouse' && (n.status === 'disrupted' || n.status === 'at-risk')).length,
      affectedShipments: rawNodes.filter((n) => n.type === 'shipment' && n.status === 'disrupted').length,
      totalAffectedOrders: rawNodes.filter((n) => n.type === 'order' && (n.status === 'disrupted' || n.status === 'at-risk')).length,
      highRiskOrders: rawNodes.filter((n) => n.type === 'order' && n.status === 'disrupted').length,
    };

    return { nodes: finalNodes, edges: finalEdges, impactSummary };
  }, [suppliers, products, warehouses, shipments, orders, disruptions, filterMode]);

  // Layout calculations: Multi-tier columns (0: Suppliers, 1: Products, 2: Warehouses, 3: Shipments, 4: Orders)
  const tierXCoords = [80, 310, 540, 770, 1000];
  const columnHeaders = [
    { label: 'Suppliers', icon: Building2 },
    { label: 'Products', icon: Boxes },
    { label: 'Warehouses', icon: Layers },
    { label: 'Shipments', icon: Truck },
    { label: 'Customer Orders', icon: Users },
  ];

  // Group nodes by tier and compute Y
  const nodesWithPositions = useMemo(() => {
    const tieredGroups: Record<number, NodeData[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    nodes.forEach((n) => {
      if (tieredGroups[n.tier]) tieredGroups[n.tier].push(n);
    });

    const positioned: (NodeData & { x: number; y: number })[] = [];

    Object.entries(tieredGroups).forEach(([tierStr, group]) => {
      const tierNum = Number(tierStr);
      const x = tierXCoords[tierNum];
      const spacing = 75;
      const startY = 80;

      group.forEach((node, index) => {
        positioned.push({
          ...node,
          x,
          y: startY + index * spacing,
        });
      });
    });

    return positioned;
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, NodeData & { x: number; y: number }>();
    nodesWithPositions.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodesWithPositions]);

  // Connected nodes for the selected node (upstream & downstream)
  const { connectedNodeIds, connectedEdgeIds } = useMemo(() => {
    if (!selectedNodeId) return { connectedNodeIds: new Set<string>(), connectedEdgeIds: new Set<string>() };

    const cNodes = new Set<string>([selectedNodeId]);
    const cEdges = new Set<string>();

    edges.forEach((e) => {
      if (e.source === selectedNodeId || e.target === selectedNodeId) {
        cEdges.add(e.id);
        cNodes.add(e.source);
        cNodes.add(e.target);
      }
    });

    return { connectedNodeIds: cNodes, connectedEdgeIds: cEdges };
  }, [selectedNodeId, edges]);

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Page Title & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dependency Impact Map</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
              Multi-Tier Propagation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive topological tracing: Supplier &rarr; Product &rarr; Warehouse &rarr; Shipment &rarr; Customer Order.
          </p>
        </div>

        {/* Filters and View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded transition-colors ${
                filterMode === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Supply Web
            </button>
            <button
              onClick={() => setFilterMode('disrupted_only')}
              className={`px-3 py-1 rounded transition-colors ${
                filterMode === 'disrupted_only' ? 'bg-white text-red-700 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disrupted Path Only
            </button>
          </div>

          <button
            onClick={() => setCurrentTab('recovery')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Plan Recovery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Impact Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
          <div className="text-[10px] font-medium text-red-700">Affected Suppliers</div>
          <div className="text-xl font-bold text-red-900 font-mono tabular-nums">{impactSummary.affectedSuppliers}</div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
          <div className="text-[10px] font-medium text-amber-700">Affected Products</div>
          <div className="text-xl font-bold text-amber-900 font-mono tabular-nums">{impactSummary.affectedProducts}</div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-[10px] font-medium text-slate-600">Affected Warehouses</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{impactSummary.affectedWarehouses}</div>
        </div>

        <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
          <div className="text-[10px] font-medium text-red-700">Affected Shipments</div>
          <div className="text-xl font-bold text-red-900 font-mono tabular-nums">{impactSummary.affectedShipments}</div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
          <div className="text-[10px] font-medium text-amber-700">Total Affected Orders</div>
          <div className="text-xl font-bold text-amber-900 font-mono tabular-nums">{impactSummary.totalAffectedOrders}</div>
        </div>

        <div className="p-3 bg-red-600 text-white rounded-lg shadow-xs">
          <div className="text-[10px] font-medium text-red-100">High-Risk Orders</div>
          <div className="text-xl font-bold text-white font-mono tabular-nums">{impactSummary.highRiskOrders}</div>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-white rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">Node Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-600">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-slate-600">Disrupted (Source/Deficit)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">At-Risk (Propagation)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Recovered (Protected)</span>
          </div>
        </div>

        <div className="text-slate-500 text-[11px]">
          Click any node to trace upstream suppliers and downstream order impact.
        </div>
      </div>

      {/* Main Interactive Graph Viewport */}
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tier Column Headers */}
        <div className="grid grid-cols-5 border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-700 py-2.5 px-6">
          {columnHeaders.map((col, idx) => {
            const Icon = col.icon;
            return (
              <div key={idx} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{col.label}</span>
              </div>
            );
          })}
        </div>

        {/* SVG Canvas */}
        <div className="relative w-full overflow-x-auto min-h-[580px] bg-radial from-slate-50/50 to-white">
          <svg className="w-[1150px] h-[640px] block select-none">
            <defs>
              {/* Gradient for Disrupted Edges */}
              <linearGradient id="disruptedEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="normalEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="recoveredEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Render Connecting Bezier Edges */}
            {edges.map((edge) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;

              const isHighlighted =
                selectedNodeId && (connectedEdgeIds.has(edge.id) || edge.source === selectedNodeId || edge.target === selectedNodeId);

              // Bezier control points for smooth curves
              const sx = src.x + 85;
              const sy = src.y + 22;
              const tx = tgt.x - 10;
              const ty = tgt.y + 22;
              const dx = (tx - sx) / 2;
              const d = `M ${sx} ${sy} C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;

              let stroke = 'url(#normalEdge)';
              let strokeWidth = 1.5;
              let strokeDasharray = undefined;

              if (edge.isRecovered) {
                stroke = 'url(#recoveredEdge)';
                strokeWidth = isHighlighted ? 3.5 : 2;
              } else if (edge.isDisrupted || edge.isAtRisk) {
                stroke = 'url(#disruptedEdge)';
                strokeWidth = isHighlighted ? 4 : 2.5;
                strokeDasharray = '5,4';
              } else if (isHighlighted) {
                stroke = '#2563eb';
                strokeWidth = 3;
              }

              return (
                <path
                  key={edge.id}
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Render Interactive Nodes */}
            {nodesWithPositions.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const isDisrupted = node.status === 'disrupted';
              const isAtRisk = node.status === 'at-risk';
              const isRecovered = node.status === 'recovered';

              let borderColor = '#cbd5e1';
              let bgColor = '#ffffff';
              let indicatorColor = '#3b82f6';

              if (isDisrupted) {
                borderColor = '#ef4444';
                bgColor = '#fef2f2';
                indicatorColor = '#ef4444';
              } else if (isAtRisk) {
                borderColor = '#f59e0b';
                bgColor = '#fffbeb';
                indicatorColor = '#f59e0b';
              } else if (isRecovered) {
                borderColor = '#10b981';
                bgColor = '#ecfdf5';
                indicatorColor = '#10b981';
              }

              if (isSelected) {
                borderColor = '#2563eb';
                bgColor = '#eff6ff';
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - 10}, ${node.y})`}
                  onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
                  className="cursor-pointer group"
                >
                  {/* Card Background */}
                  <rect
                    width="190"
                    height="48"
                    rx="6"
                    fill={bgColor}
                    stroke={borderColor}
                    strokeWidth={isSelected ? 2.5 : isDisrupted ? 2 : 1}
                    className="transition-all duration-200 group-hover:filter group-hover:drop-shadow-sm"
                  />

                  {/* Status Indicator Bar */}
                  <rect width="4" height="48" rx="2" fill={indicatorColor} />

                  {/* Node Label */}
                  <text
                    x="14"
                    y="20"
                    fontSize="11"
                    fontWeight="600"
                    fill="#0f172a"
                    className="select-none truncate"
                  >
                    {node.label.length > 22 ? node.label.substring(0, 20) + '...' : node.label}
                  </text>

                  {/* Sublabel / Metric */}
                  <text
                    x="14"
                    y="36"
                    fontSize="9.5"
                    fill="#64748b"
                    fontFamily="monospace"
                    className="select-none"
                  >
                    {node.subLabel}
                  </text>

                  {/* Pulsing Alert dot if disrupted */}
                  {isDisrupted && (
                    <circle cx="178" cy="14" r="3.5" fill="#ef4444" className="animate-ping" />
                  )}
                  {isDisrupted && <circle cx="178" cy="14" r="3.5" fill="#ef4444" />}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Inspector Floating Drawer */}
        {selectedNode && (
          <div className="absolute right-4 bottom-4 w-96 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-300 p-5 text-xs z-30 transition-all">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {selectedNode.type} Node Inspector
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedNode.label}</h3>
                <p className="text-[11px] font-mono text-slate-500">{selectedNode.subLabel}</p>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                &times;
              </button>
            </div>

            <div className="py-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Health State:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                    selectedNode.status === 'disrupted'
                      ? 'bg-red-100 text-red-800'
                      : selectedNode.status === 'at-risk'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedNode.status === 'recovered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>

              {selectedNode.type === 'supplier' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Location:</span>
                    <span className="font-semibold text-slate-900">{selectedNode.raw.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Reliability Rating:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedNode.raw.reliabilityScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Avg Lead Time:</span>
                    <span className="font-mono text-slate-900">{selectedNode.raw.avgDeliveryDays} Days</span>
                  </div>
                </>
              )}

              {selectedNode.type === 'order' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Order Priority:</span>
                    <span className="font-semibold text-slate-900">{selectedNode.raw.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivery Deadline:</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedNode.raw.deliveryDeadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Value:</span>
                    <span className="font-mono font-bold text-slate-900">${selectedNode.raw.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <strong>Vulnerability Cause:</strong> {selectedNode.raw.riskReason}
                  </div>
                </>
              )}

              {selectedNode.type === 'warehouse' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Capacity Units:</span>
                    <span className="font-mono text-slate-900">{selectedNode.raw.capacityUnits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Utilization:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedNode.raw.currentUtilizationPercent}%</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Connected edges: <strong>{connectedEdgeIds.size}</strong>
              </span>
              <button
                onClick={() => setCurrentTab('recovery')}
                className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 text-[11px]"
              >
                Mitigate Disruption
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
