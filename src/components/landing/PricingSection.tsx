import { Check, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { SUBSCRIPTION } from '@/lib/subscription';

type PricingSectionProps = {
  onOpenLogin: () => void;
};

export function PricingSection({ onOpenLogin }: PricingSectionProps) {
  return (
    <section id="planos" className="relative py-20 md:py-28 border-t border-[#1f372c]/80 bg-[#0a130f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            PLANOS TRANSPARENTES
          </span>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-4xl">
            Menos que um cafezinho para nunca mais pagar multas
          </h2>
          <p className="mt-3 text-sm text-zinc-400 sm:text-base">
            {SUBSCRIPTION.trialDays} dias grátis para testar o Pro. Depois só {SUBSCRIPTION.amountLabel}/mês.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-4xl mx-auto items-stretch">
          <div className="flex flex-col justify-between rounded-3xl border border-[#1f372c] bg-[#122019] p-8 transition hover:border-[#2a4d3e]">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Essencial Grátis</h3>
                <span className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] font-bold text-zinc-300">
                  Para Sempre
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                Ideal para testar e começar a controlar os vencimentos básicos da casa.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">R$ 0</span>
                <span className="text-xs text-zinc-400">/mês</span>
              </div>

              <ul className="mt-8 space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400" />
                  <span>1 casa cadastrada</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400" />
                  <span>Até 2 moradores conectados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400" />
                  <span>Cadastro e conferência de contas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400" />
                  <span>Visão do total e status de quitação</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-500">
                  <span>Scanner inteligente de boletos Febraban</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-500">
                  <span>Alertas automáticos push no celular</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onOpenLogin}
              className="mt-8 w-full rounded-2xl border border-[#234334] bg-[#172b22] py-3.5 text-xs font-bold text-zinc-200 transition hover:bg-[#1f3a2e] hover:text-white"
            >
              Começar Grátis Agora
            </button>
          </div>

          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-emerald-500/80 bg-gradient-to-b from-[#14261e] to-[#0f1d16] p-8 shadow-2xl shadow-emerald-950/60">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                <Sparkles size={12} />
                <span>Mais Popular para Casais</span>
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">{SUBSCRIPTION.planName}</h3>
                <span className="rounded-full bg-emerald-950 px-3 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-800/40">
                  Completo
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-300">
                Paz de espírito total, scanner com câmera, gráficos e alertas de vencimento no celular.
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{SUBSCRIPTION.amountLabel}</span>
                <span className="text-xs text-zinc-400">/mês</span>
              </div>
              <p className="mt-1 text-xs font-bold text-emerald-300">
                {SUBSCRIPTION.trialDays} dias grátis no cartão
              </p>

              <ul className="mt-8 space-y-3.5 text-xs text-zinc-200">
                <li className="flex items-center gap-2.5 font-bold">
                  <Check size={16} className="text-emerald-400" />
                  <span>Scanner de boletos ilimitado com a câmera</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold">
                  <Check size={16} className="text-emerald-400" />
                  <span>Alertas automáticos PWA no celular e PC</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400" />
                  <span>Moradores ilimitados na mesma casa</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400" />
                  <span>Envio de convites oficiais por e-mail e WhatsApp</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400" />
                  <span>Gráficos de evolução semanal e por categoria</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-emerald-400" />
                  <span>Instalação PWA offline-first</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 space-y-2">
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-xs font-black text-white transition hover:bg-emerald-500 shadow-xl shadow-emerald-950/70 hover:scale-[1.02]"
              >
                <span>Experimentar {SUBSCRIPTION.trialDays} Dias Grátis</span>
                <ArrowRight size={14} />
              </button>
              <p className="text-center text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                <Shield size={12} className="text-emerald-400" />
                <span>Cancele a qualquer momento. Sem pegadinhas.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
