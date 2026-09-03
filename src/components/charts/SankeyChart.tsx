import { useState, useMemo } from 'react';
import type { Bill } from '@/types';
import { money } from '@/lib/bills';
import { Sparkles, Info } from 'lucide-react';

type SankeyChartProps = {
  bills: Bill[];
};

type SankeyNode = {
  id: string;
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type SankeyLink = {
  sourceId: string;
  targetId: string;
  value: number;
  color: string;
  gradientId: string;
  path: string;
  sourceLabel: string;
  targetLabel: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  Energia: '#f59e0b', // amber
  Agua: '#0ea5e9',    // sky
  Internet: '#8b5cf6',// violet
  Telefone: '#f43f5e',// rose
  Outros: '#10b981',  // emerald
};

export function SankeyChart({ bills }: SankeyChartProps) {
  const [hoveredLink, setHoveredLink] = useState<SankeyLink | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { nodes, links, grandTotal, paidTotal, pendingTotal } = useMemo(() => {
    const total = bills.reduce((sum, b) => sum + b.value, 0);
    const paid = bills.filter((b) => b.paid).reduce((sum, b) => sum + b.value, 0);
    const pending = total - paid;

    if (total === 0) {
      return { nodes: [], links: [], grandTotal: 0, paidTotal: 0, pendingTotal: 0 };
    }

    // Agrupar por categoria
    const categoryTotals: Record<string, { total: number; paid: number; pending: number }> = {};
    bills.forEach((b) => {
      const cat = b.category || 'Outros';
      const val = Number(b.value) || 0;
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { total: 0, paid: 0, pending: 0 };
      }
      categoryTotals[cat].total += val;
      if (b.paid) {
        categoryTotals[cat].paid += val;
      } else {
        categoryTotals[cat].pending += val;
      }
    });

    const activeCategories = Object.keys(categoryTotals).sort(
      (a, b) => categoryTotals[b].total - categoryTotals[a].total,
    );

    // Dimensões SVG
    const svgHeight = 420;
    const paddingY = 40;
    const availableHeight = svgHeight - paddingY * 2;
    const nodeWidth = 22;

    const columnX = {
      total: 30,
      category: 380,
      status: 730,
    };

    // 1. Nó Origem (Total)
    const totalNodeHeight = availableHeight;
    const totalNode: SankeyNode = {
      id: 'total',
      label: 'Total Despesas',
      value: total,
      color: '#10b981',
      x: columnX.total,
      y: paddingY,
      width: nodeWidth,
      height: totalNodeHeight,
    };

    // 2. Nós de Categorias (Coluna do meio)
    const gapCategory = 14;
    const totalCatGaps = (activeCategories.length - 1) * gapCategory;
    const catAvailableHeight = availableHeight - totalCatGaps;

    let currentCatY = paddingY;
    const categoryNodes: Record<string, SankeyNode> = {};

    activeCategories.forEach((cat) => {
      const catVal = categoryTotals[cat].total;
      const h = Math.max(18, (catVal / total) * catAvailableHeight);
      categoryNodes[cat] = {
        id: `cat_${cat}`,
        label: cat,
        value: catVal,
        color: CATEGORY_COLORS[cat] || '#10b981',
        x: columnX.category,
        y: currentCatY,
        width: nodeWidth,
        height: h,
      };
      currentCatY += h + gapCategory;
    });

    // 3. Nós de Status (Coluna da direita: Pago vs Pendente)
    const gapStatus = 24;
    const statusAvailableHeight = availableHeight - gapStatus;
    const paidHeight = paid > 0 ? Math.max(20, (paid / total) * statusAvailableHeight) : 0;
    const pendingHeight = pending > 0 ? Math.max(20, (pending / total) * statusAvailableHeight) : 0;

    const statusNodes: Record<string, SankeyNode> = {};
    if (paid > 0) {
      statusNodes['paid'] = {
        id: 'status_paid',
        label: 'Quitado ✓',
        value: paid,
        color: '#10b981',
        x: columnX.status,
        y: paddingY,
        width: nodeWidth,
        height: paidHeight,
      };
    }
    if (pending > 0) {
      statusNodes['pending'] = {
        id: 'status_pending',
        label: 'Pendente',
        value: pending,
        color: '#f59e0b',
        x: columnX.status,
        y: paddingY + paidHeight + (paid > 0 ? gapStatus : 0),
        width: nodeWidth,
        height: pendingHeight,
      };
    }

    // Gerar conexões (Links)
    // A. Total -> Categorias
    let runningTotalSourceY = paddingY;
    const linksList: SankeyLink[] = [];

    activeCategories.forEach((cat) => {
      const catNode = categoryNodes[cat];
      const linkVal = catNode.value;
      const linkHeightSource = (linkVal / total) * totalNodeHeight;

      const y0_top = runningTotalSourceY;
      const y0_bottom = runningTotalSourceY + linkHeightSource;
      const y1_top = catNode.y;
      const y1_bottom = catNode.y + catNode.height;

      const x0 = totalNode.x + totalNode.width;
      const x1 = catNode.x;
      const midX = (x0 + x1) / 2;

      const path = `M ${x0} ${y0_top} C ${midX} ${y0_top}, ${midX} ${y1_top}, ${x1} ${y1_top} L ${x1} ${y1_bottom} C ${midX} ${y1_bottom}, ${midX} ${y0_bottom}, ${x0} ${y0_bottom} Z`;

      linksList.push({
        sourceId: totalNode.id,
        targetId: catNode.id,
        value: linkVal,
        color: catNode.color,
        gradientId: `grad_${totalNode.id}_${catNode.id}`,
        path,
        sourceLabel: totalNode.label,
        targetLabel: catNode.label,
      });

      runningTotalSourceY += linkHeightSource;
    });

    // B. Categorias -> Status (Pago / Pendente)
    let runningPaidTargetY = statusNodes['paid']?.y ?? paddingY;
    let runningPendingTargetY = statusNodes['pending']?.y ?? paddingY;

    activeCategories.forEach((cat) => {
      const catNode = categoryNodes[cat];
      const data = categoryTotals[cat];

      const x0 = catNode.x + catNode.width;
      const x1 = columnX.status;
      const midX = (x0 + x1) / 2;

      let catRunningY = catNode.y;

      // Link para Pago
      if (data.paid > 0 && statusNodes['paid']) {
        const linkHeightCat = (data.paid / data.total) * catNode.height;
        const linkHeightStatus = (data.paid / paid) * statusNodes['paid'].height;

        const y0_top = catRunningY;
        const y0_bottom = catRunningY + linkHeightCat;
        const y1_top = runningPaidTargetY;
        const y1_bottom = runningPaidTargetY + linkHeightStatus;

        const path = `M ${x0} ${y0_top} C ${midX} ${y0_top}, ${midX} ${y1_top}, ${x1} ${y1_top} L ${x1} ${y1_bottom} C ${midX} ${y1_bottom}, ${midX} ${y0_bottom}, ${x0} ${y0_bottom} Z`;

        linksList.push({
          sourceId: catNode.id,
          targetId: statusNodes['paid'].id,
          value: data.paid,
          color: '#10b981',
          gradientId: `grad_${catNode.id}_paid`,
          path,
          sourceLabel: catNode.label,
          targetLabel: 'Já Quitado',
        });

        catRunningY += linkHeightCat;
        runningPaidTargetY += linkHeightStatus;
      }

      // Link para Pendente
      if (data.pending > 0 && statusNodes['pending']) {
        const linkHeightCat = (data.pending / data.total) * catNode.height;
        const linkHeightStatus = (data.pending / pending) * statusNodes['pending'].height;

        const y0_top = catRunningY;
        const y0_bottom = catRunningY + linkHeightCat;
        const y1_top = runningPendingTargetY;
        const y1_bottom = runningPendingTargetY + linkHeightStatus;

        const path = `M ${x0} ${y0_top} C ${midX} ${y0_top}, ${midX} ${y1_top}, ${x1} ${y1_top} L ${x1} ${y1_bottom} C ${midX} ${y1_bottom}, ${midX} ${y0_bottom}, ${x0} ${y0_bottom} Z`;

        linksList.push({
          sourceId: catNode.id,
          targetId: statusNodes['pending'].id,
          value: data.pending,
          color: '#f59e0b',
          gradientId: `grad_${catNode.id}_pending`,
          path,
          sourceLabel: catNode.label,
          targetLabel: 'Pendente',
        });

        runningPendingTargetY += linkHeightStatus;
      }
    });

    const allNodes: SankeyNode[] = [
      totalNode,
      ...Object.values(categoryNodes),
      ...Object.values(statusNodes),
    ];

    return {
      nodes: allNodes,
      links: linksList,
      grandTotal: total,
      paidTotal: paid,
      pendingTotal: pending,
    };
  }, [bills]);

  if (bills.length === 0) {
    return (
      <div className="rounded-2xl border border-[#223d32] bg-[#14231d] p-8 text-center text-zinc-400">
        <p className="text-xs">Cadastre ou escaneie contas para visualizar o fluxo Sankey.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#223d32] bg-[#14231d] p-5 shadow-xl shadow-black/40">
      {/* Cabeçalho do Diagrama */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#1c3328] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              <Sparkles size={14} />
            </span>
            <h2 className="text-sm font-black text-white">Fluxo Financeiro Sankey</h2>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Visualize para onde cada real da sua casa flui: do total às categorias e quitação.
          </p>
        </div>

        {/* Indicadores rápidos */}
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Mês</span>
            <p className="font-black text-white">{money.format(grandTotal)}</p>
          </div>
          <div className="h-6 w-px bg-[#223d32]" />
          <div>
            <span className="text-[10px] text-emerald-400 uppercase font-bold">Quitado</span>
            <p className="font-black text-emerald-400">{money.format(paidTotal)}</p>
          </div>
          <div className="h-6 w-px bg-[#223d32]" />
          <div>
            <span className="text-[10px] text-amber-400 uppercase font-bold">Pendente</span>
            <p className="font-black text-amber-400">{money.format(pendingTotal)}</p>
          </div>
        </div>
      </div>

      {/* Tooltip Dinâmico de Hover */}
      <div className="mt-3 flex items-center justify-between min-h-7 px-1 text-xs">
        {hoveredLink ? (
          <div className="flex items-center gap-2 font-bold text-emerald-300 animate-in fade-in">
            <span className="rounded bg-emerald-950 px-2 py-0.5 border border-emerald-800/40">
              {hoveredLink.sourceLabel} ➔ {hoveredLink.targetLabel}
            </span>
            <span className="text-white">{money.format(hoveredLink.value)}</span>
            <span className="text-[11px] text-zinc-400">
              ({Math.round((hoveredLink.value / grandTotal) * 100)}% do orçamento)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Info size={13} />
            <span>Passe o mouse ou toque sobre as faixas do diagrama para inspecionar os valores</span>
          </div>
        )}
      </div>

      {/* Container SVG Responsivo com Scroll Horizontal suave se necessário */}
      <div className="mt-2 overflow-x-auto">
        <svg
          viewBox="0 0 800 420"
          className="w-full min-w-[680px] h-[360px] select-none"
        >
          <defs>
            {links.map((link) => (
              <linearGradient
                key={link.gradientId}
                id={link.gradientId}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={link.color} stopOpacity={0.65} />
                <stop offset="100%" stopColor={link.color} stopOpacity={0.35} />
              </linearGradient>
            ))}
          </defs>

          {/* Rótulos das Colunas no Topo */}
          <text x="30" y="24" fill="#9ca3af" fontSize="11" fontWeight="700" textAnchor="start">
            TOTAL (100%)
          </text>
          <text x="390" y="24" fill="#9ca3af" fontSize="11" fontWeight="700" textAnchor="middle">
            CATEGORIAS DE DESPESA
          </text>
          <text x="740" y="24" fill="#9ca3af" fontSize="11" fontWeight="700" textAnchor="middle">
            STATUS DE PAGAMENTO
          </text>

          {/* Faixas / Ribbons do Sankey */}
          <g>
            {links.map((link, idx) => {
              const isHovered = hoveredLink === link;
              return (
                <path
                  key={idx}
                  d={link.path}
                  fill={`url(#${link.gradientId})`}
                  stroke={link.color}
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  strokeOpacity={isHovered ? 0.9 : 0.3}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredLink(link)}
                  onMouseLeave={() => setHoveredLink(null)}
                />
              );
            })}
          </g>

          {/* Nós / Blocos Verticais */}
          <g>
            {nodes.map((node) => {
              const isTotal = node.id === 'total';
              const isStatus = node.id.startsWith('status_');

              return (
                <g key={node.id} className="cursor-pointer">
                  {/* Barra do nó com cantos arredondados */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={6}
                    fill={node.color}
                    fillOpacity={0.9}
                    stroke="#ffffff"
                    strokeWidth={hoveredNode === node.id ? 2 : 0}
                    className="transition-all duration-200"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  />

                  {/* Rótulo de texto ao lado do nó */}
                  <text
                    x={isStatus ? node.x - 10 : isTotal ? node.x + node.width + 10 : node.x + node.width + 10}
                    y={node.y + Math.min(16, node.height / 2 + 4)}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="800"
                    textAnchor={isStatus ? 'end' : 'start'}
                  >
                    {node.label}
                  </text>

                  {/* Subtexto com valor em reais */}
                  <text
                    x={isStatus ? node.x - 10 : isTotal ? node.x + node.width + 10 : node.x + node.width + 10}
                    y={node.y + Math.min(30, node.height / 2 + 18)}
                    fill="#9ca3af"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor={isStatus ? 'end' : 'start'}
                  >
                    {money.format(node.value)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
