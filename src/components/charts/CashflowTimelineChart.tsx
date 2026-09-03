import { useState, useMemo } from 'react';
import type { Bill } from '@/types';
import { money } from '@/lib/bills';
import { Calendar, TrendingUp } from 'lucide-react';

type CashflowTimelineChartProps = {
  bills: Bill[];
};

export function CashflowTimelineChart({ bills }: CashflowTimelineChartProps) {
  const [activeDay, setActiveDay] = useState<number | null>(null);

  // Mapear gastos por dia de vencimento (dias 1 a 31)
  const { dailyData, maxDailyValue, peakDay, firstHalfTotal } = useMemo(() => {
    const days: { day: number; total: number; bills: Bill[] }[] = Array.from(
      { length: 31 },
      (_, i) => ({ day: i + 1, total: 0, bills: [] }),
    );

    let peak = 1;
    let peakVal = 0;
    let firstHalf = 0;

    bills.forEach((b) => {
      const day = Math.min(31, Math.max(1, Number(b.due) || 1));
      const val = Number(b.value) || 0;
      days[day - 1].total += val;
      days[day - 1].bills.push(b);

      if (day <= 15) {
        firstHalf += val;
      }
    });

    days.forEach((d) => {
      if (d.total > peakVal) {
        peakVal = d.total;
        peak = d.day;
      }
    });

    return {
      dailyData: days,
      maxDailyValue: Math.max(100, peakVal),
      peakDay: peak,
      firstHalfTotal: firstHalf,
    };
  }, [bills]);

  // Coordenadas SVG
  const width = 760;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Gerar caminho SVG suave (Curva Catmull-Rom ou Bezier)
  const points = dailyData.map((d, i) => {
    const x = paddingX + (i / 30) * chartWidth;
    const y = paddingY + chartHeight - (d.total / maxDailyValue) * chartHeight;
    return { x, y, day: d.day, total: d.total, bills: d.bills };
  });

  // Criar SVG Path com bezier suave
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    pathD += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  // Área preenchida até a base
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;

  const selectedPoint = activeDay !== null ? points.find((p) => p.day === activeDay) : null;

  return (
    <div className="rounded-2xl border border-[#223d32] bg-[#14231d] p-5 shadow-xl shadow-black/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1c3328] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-teal-950 text-teal-400 border border-teal-800/40">
              <Calendar size={14} />
            </span>
            <h2 className="text-sm font-black text-white">Curva de Concentração de Vencimentos</h2>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Descubra em quais dias do mês o caixa da casa mais sofre com saídas.
          </p>
        </div>

        {/* Badges de inteligência de fluxo */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/40 px-3 py-1 text-[11px] font-bold text-emerald-300">
            Pico no Dia {peakDay}: {money.format(dailyData[peakDay - 1]?.total || 0)}
          </div>
          <div className="rounded-xl border border-[#244535] bg-[#0c1612] px-3 py-1 text-[11px] font-bold text-zinc-300">
            1ª Quinzena: {money.format(firstHalfTotal)}
          </div>
        </div>
      </div>

      {/* Tooltip do dia selecionado */}
      <div className="mt-3 min-h-7 flex items-center justify-between text-xs px-1">
        {selectedPoint && selectedPoint.total > 0 ? (
          <div className="flex flex-wrap items-center gap-2 font-bold text-emerald-300 animate-in fade-in">
            <span className="rounded bg-emerald-950 px-2 py-0.5 border border-emerald-800/40">
              Dia {selectedPoint.day}: {money.format(selectedPoint.total)}
            </span>
            <span className="text-zinc-300 text-[11px]">
              Contas: {selectedPoint.bills.map((b) => b.name).join(', ')}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
            <TrendingUp size={13} />
            <span>Passe o cursor sobre a curva para ver os vencimentos de cada dia</span>
          </div>
        )}
      </div>

      {/* SVG da Curva */}
      <div className="mt-2 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[640px] h-[190px] select-none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Linhas de grade horizontais */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#1c3328"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingY + chartHeight / 2}
            stroke="#1c3328"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + chartHeight}
            x2={width - paddingX}
            y2={paddingY + chartHeight}
            stroke="#234334"
          />

          {/* Área preenchida */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Linha da curva */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Pontos nos dias com contas */}
          {points.map((p) => {
            if (p.total === 0) return null;
            const isHovered = activeDay === p.day;

            return (
              <g
                key={p.day}
                className="cursor-pointer"
                onMouseEnter={() => setActiveDay(p.day)}
                onMouseLeave={() => setActiveDay(null)}
              >
                {/* Halo pulsante nos picos */}
                {p.day === peakDay && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="12"
                    fill="#10b981"
                    fillOpacity="0.2"
                    className="animate-ping"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 4.5}
                  fill="#08100d"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Marcações de dias na base */}
          {[1, 5, 10, 15, 20, 25, 30].map((d) => {
            const x = paddingX + ((d - 1) / 30) * chartWidth;
            return (
              <text
                key={d}
                x={x}
                y={height - 8}
                fill="#6b7280"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                Dia {d}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
