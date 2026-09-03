import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BellRing,
  PieChart,
  Users,
} from 'lucide-react';

type HeroSectionProps = {
  onOpenLogin: () => void;
};

export function HeroSection({ onOpenLogin }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-emerald-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 -right-40 size-[400px] rounded-full bg-emerald-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur shadow-sm">
            <Zap size={14} className="text-emerald-400" />
            <span>O app definitivo para casais, famílias e repúblicas</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.15]">
            Nunca mais pague juros.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Organize as contas da casa a dois.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm leading-relaxed text-zinc-300 sm:text-base md:text-lg">
            Aponte a câmera pro boleto ou código de barras, receba lembretes no celular antes do vencimento
            e acompanhe em tempo real quem já pagou o quê. Sem planilhas chatas, sem discussões.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-sm font-extrabold text-white transition hover:bg-emerald-500 shadow-xl shadow-emerald-950/70 sm:w-auto hover:scale-[1.02]"
            >
              <span>Organizar Minha Casa Grátis</span>
              <ArrowRight size={16} />
            </button>
            <a
              href="#como-funciona"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#234334] bg-[#122019] px-6 py-4 text-sm font-bold text-zinc-200 transition hover:bg-[#182e23] hover:text-white sm:w-auto"
            >
              Ver demonstração
            </a>
          </div>

          {/* Micro trust indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs font-bold text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Instalação PWA em 1 toque</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Sincronização em tempo real</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>Seguro via Google Login</span>
            </div>
          </div>
        </div>

        {/* Interactive App UI Preview Mockup */}
        <div className="relative mt-14 sm:mt-18">
          <div className="relative mx-auto max-w-5xl rounded-3xl border border-[#234334] bg-[#0c1612] p-3 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            {/* Window bar */}
            <div className="mb-4 flex items-center justify-between border-b border-[#1c3328] pb-3 px-2">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-rose-500/80" />
                <div className="size-3 rounded-full bg-amber-500/80" />
                <div className="size-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[11px] font-mono text-zinc-500">conta-em-dia.app</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sincronizado a dois</span>
              </div>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Left Column: Summary and Alerts */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#223d32] bg-[#14231d] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-400">Total do Mês</p>
                    <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-800/40">
                      SETEMBRO
                    </span>
                  </div>
                  <p className="mt-2 text-3xl font-black text-white">R$ 2.450,80</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Progresso de quitação:</span>
                    <span className="font-bold text-emerald-400">68% pago</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#0a130f]">
                    <div className="h-full rounded-full bg-emerald-500 w-[68%]" />
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-br from-amber-950/30 to-[#14231d] p-4 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <BellRing size={16} />
                    <span>Lembrete de Vencimento</span>
                  </div>
                  <p className="mt-1 text-zinc-200">
                    <strong>Energia (Cemig)</strong> vence em 2 dias. Evite juros de atraso!
                  </p>
                </div>
              </div>

              {/* Middle Column: Bills list */}
              <div className="space-y-2 lg:col-span-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Contas Compartilhadas
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Camera size={13} />
                    <span>Leitor Febraban Ativo</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-[#1f372c] bg-[#14231d] p-3.5 transition hover:border-emerald-500/40">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40 font-bold text-xs">
                        ⚡
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Energia — Cemig</p>
                        <p className="text-[10px] text-zinc-400">Vence dia 10 • Morador: Klaus</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-white">R$ 184,50</p>
                      <span className="rounded bg-amber-950/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-800/40">
                        Pendente
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#1f372c] bg-[#14231d] p-3.5 transition hover:border-emerald-500/40">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-xl bg-sky-950/60 text-sky-400 border border-sky-800/40 font-bold text-xs">
                        💧
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Água — Codau</p>
                        <p className="text-[10px] text-zinc-400">Vence dia 15 • Moradora: Waniele</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-white">R$ 98,70</p>
                      <span className="rounded bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800/40">
                        Pago ✓
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[#1f372c] bg-[#14231d] p-3.5 transition hover:border-emerald-500/40">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-xl bg-violet-950/60 text-violet-400 border border-violet-800/40 font-bold text-xs">
                        📶
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Internet Fibra — Algar</p>
                        <p className="text-[10px] text-zinc-400">Vence dia 10 • Dividido 50/50</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-white">R$ 150,00</p>
                      <span className="rounded bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800/40">
                        Pago ✓
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini features pill bar */}
                <div className="mt-3 flex flex-wrap items-center justify-between rounded-xl border border-[#223d32] bg-[#0f1d16] px-4 py-2.5 text-[11px] font-bold text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Users size={13} />
                    <span>Moradores conectados</span>
                  </span>
                  <span className="flex items-center gap-1 text-teal-400">
                    <PieChart size={13} />
                    <span>Gráficos por categoria</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <BellRing size={13} />
                    <span>Alertas no celular</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
