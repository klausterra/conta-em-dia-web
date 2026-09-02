import { useMemo } from 'react';
import type { Bill, BillCategory } from '@/types';
import { categoryLabels, money } from '@/lib/bills';
import { PieChart, BarChart3 } from 'lucide-react';

type EvolutionChartsProps = {
  bills: Bill[];
};

export function EvolutionCharts({ bills }: EvolutionChartsProps) {
  const stats = useMemo(() => {
    const total = bills.reduce((acc, b) => acc + b.value, 0);
    const paid = bills.filter((b) => b.paid).reduce((acc, b) => acc + b.value, 0);
    const pending = total - paid;
    const count = bills.length;
    const average = count > 0 ? total / count : 0;
    const highest = bills.reduce((max, b) => (b.value > max.value ? b : max), bills[0] || { name: '—', value: 0 });

    // Agrupamento por categoria
    const byCategory: Record<BillCategory, { total: number; count: number }> = {
      Energia: { total: 0, count: 0 },
      Agua: { total: 0, count: 0 },
      Internet: { total: 0, count: 0 },
      Telefone: { total: 0, count: 0 },
      Outros: { total: 0, count: 0 },
    };

    bills.forEach((b) => {
      if (byCategory[b.category]) {
        byCategory[b.category].total += b.value;
        byCategory[b.category].count += 1;
      }
    });

    const categoryList = (Object.keys(byCategory) as BillCategory[])
      .map((cat) => ({
        category: cat,
        label: categoryLabels[cat],
        total: byCategory[cat].total,
        count: byCategory[cat].count,
        percent: total > 0 ? Math.round((byCategory[cat].total / total) * 100) : 0,
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);

    // Distribuição por períodos do mês (Semanas 1-7, 8-14, 15-21, 22+)
    const periods = [
      { label: 'Dias 1 a 7', total: 0, paid: 0 },
      { label: 'Dias 8 a 14', total: 0, paid: 0 },
      { label: 'Dias 15 a 21', total: 0, paid: 0 },
      { label: 'Dias 22+', total: 0, paid: 0 },
    ];

    bills.forEach((b) => {
      const idx = b.due <= 7 ? 0 : b.due <= 14 ? 1 : b.due <= 21 ? 2 : 3;
      periods[idx].total += b.value;
      if (b.paid) periods[idx].paid += b.value;
    });

    const maxPeriodVal = Math.max(...periods.map((p) => p.total), 1);

    return { total, paid, pending, count, average, highest, categoryList, periods, maxPeriodVal };
  }, [bills]);

  // Cores para o Donut chart
  const categoryColors: Record<BillCategory, string> = {
    Energia: '#f59e0b', // amber-500
    Agua: '#0ea5e9', // sky-500
    Internet: '#8b5cf6', // violet-500
    Telefone: '#f43f5e', // rose-500
    Outros: '#71717a', // zinc-500
  };

  // Cálculo dos segmentos SVG do Donut
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="space-y-6">
      {/* 4 Cards de Métricas Principais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#223d32] bg-[#14231d] p-5">
          <p className="text-xs font-semibold text-zinc-400">Total do mês</p>
          <p className="mt-2 text-2xl font-black text-white">{money.format(stats.total)}</p>
          <p className="mt-1 text-xs text-zinc-400">{stats.count} contas cadastradas</p>
        </div>
        <div className="rounded-2xl border border-[#223d32] bg-[#14231d] p-5">
          <p className="text-xs font-semibold text-emerald-400">Já quitado</p>
          <p className="mt-2 text-2xl font-black text-emerald-400">{money.format(stats.paid)}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}% das despesas pagas
          </p>
        </div>
        <div className="rounded-2xl border border-[#223d32] bg-[#14231d] p-5">
          <p className="text-xs font-semibold text-amber-400">Pendente no mês</p>
          <p className="mt-2 text-2xl font-black text-amber-400">{money.format(stats.pending)}</p>
          <p className="mt-1 text-xs text-zinc-400">Falta pagar</p>
        </div>
        <div className="rounded-2xl border border-[#223d32] bg-[#14231d] p-5">
          <p className="text-xs font-semibold text-zinc-400">Maior conta</p>
          <p className="mt-2 text-2xl font-black text-white">{money.format(stats.highest.value)}</p>
          <p className="mt-1 truncate text-xs text-zinc-400">{stats.highest.name}</p>
        </div>
      </div>

      {/* Grid com Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico 1: Evolução das Despesas por Período */}
        <section className="rounded-2xl border border-[#223d32] bg-[#14231d] p-6 shadow-[0_8px_30px_rgba(0,0,0,.2)]">
          <div className="flex items-center justify-between border-b border-[#1f372c] pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-black text-white">
                <BarChart3 size={18} className="text-emerald-400" />
                Vencimentos ao longo do mês
              </h2>
              <p className="text-xs text-zinc-400">Volume financeiro distribuído por semanas</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="size-2.5 rounded-sm bg-emerald-500" /> Pago
              </span>
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="size-2.5 rounded-sm bg-zinc-600" /> Pendente
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {stats.periods.map((p, idx) => {
              const totalPct = Math.round((p.total / stats.maxPeriodVal) * 100);
              const paidPct = p.total > 0 ? Math.round((p.paid / p.total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-300">{p.label}</span>
                    <span className="text-white">{money.format(p.total)}</span>
                  </div>
                  <div className="relative h-6 w-full overflow-hidden rounded-lg bg-[#0b1411]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg bg-zinc-700/60 transition-all duration-500"
                      style={{ width: `${totalPct}%` }}
                    >
                      <div
                        className="h-full rounded-lg bg-emerald-500 transition-all duration-500"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gráfico 2: Distribuição por Categoria (Donut SVG) */}
        <section className="rounded-2xl border border-[#223d32] bg-[#14231d] p-6 shadow-[0_8px_30px_rgba(0,0,0,.2)]">
          <div className="border-b border-[#1f372c] pb-4">
            <h2 className="flex items-center gap-2 text-base font-black text-white">
              <PieChart size={18} className="text-emerald-400" />
              Gastos por Categoria
            </h2>
            <p className="text-xs text-zinc-400">Proporção do seu orçamento em cada tipo de despesa</p>
          </div>

          {stats.categoryList.length === 0 ? (
            <p className="py-12 text-center text-xs text-zinc-500">Nenhuma conta cadastrada ainda.</p>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              {/* Donut SVG */}
              <div className="relative size-40 shrink-0">
                <svg className="size-full -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#1a2e25"
                    strokeWidth="20"
                  />
                  {stats.categoryList.map((item, idx) => {
                    const strokeDash = (item.total / stats.total) * circumference;
                    const offset = accumulatedOffset;
                    accumulatedOffset += strokeDash;
                    return (
                      <circle
                        key={idx}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={categoryColors[item.category]}
                        strokeWidth="20"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-700 hover:opacity-80"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Total</span>
                  <span className="text-sm font-black text-white">{money.format(stats.total)}</span>
                </div>
              </div>

              {/* Legenda de categorias */}
              <div className="flex-1 space-y-2.5 w-full">
                {stats.categoryList.map((item) => (
                  <div key={item.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: categoryColors[item.category] }}
                      />
                      <span className="font-bold text-zinc-200">{item.label}</span>
                      <span className="text-zinc-500">({item.count})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-zinc-400">{item.percent}%</span>
                      <span className="font-black text-white">{money.format(item.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
