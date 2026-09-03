import { Check, X, Scan, Bell, UserCheck } from 'lucide-react';

export function ComparisonSection() {
  const steps = [
    {
      step: '01',
      icon: UserCheck,
      title: 'Crie sua casa e convide quem mora com você',
      description: 'Em 10 segundos sua casa está pronta. Compartilhe o link pelo WhatsApp ou convide por e-mail.',
    },
    {
      step: '02',
      icon: Scan,
      title: 'Aponte a câmera e cadastre os boletos',
      description: 'O scanner inteligente lê água, luz, internet e condomínio. O app descobre o valor e a data na hora.',
    },
    {
      step: '03',
      icon: Bell,
      title: 'Receba alertas e dê adeus aos atrasos',
      description: 'Lembretes automáticos no celular. Conforme forem pagando, marquem com 1 toque.',
    },
  ];

  return (
    <section id="como-funciona" className="relative py-20 md:py-28 border-t border-[#1f372c]/80 bg-[#08100d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Steps */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            SIMPLICIDADE NA PRÁTICA
          </span>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-4xl">
            Como funciona em 3 passos
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-[#1f372c] bg-[#122019] p-6 text-center sm:text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-black text-emerald-500/40">{s.step}</span>
                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                    <Icon size={20} />
                  </div>
                </div>
                <h3 className="mt-4 text-base font-black text-white">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{s.description}</p>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div id="comparativo" className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              POR QUE USAR O CONTA EM DIA?
            </span>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Chega de improviso com planilhas e mensagens perdidas
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#1f372c] bg-[#122019]">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-[#1f372c] bg-[#0c1612] text-zinc-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4 sm:p-5">Funcionalidade</th>
                  <th className="p-4 sm:p-5 text-zinc-500">Planilhas do Excel</th>
                  <th className="p-4 sm:p-5 text-zinc-500">Grupo de WhatsApp</th>
                  <th className="p-4 sm:p-5 text-emerald-400 font-black bg-emerald-950/30">Conta em Dia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c3328]">
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-white">Scanner de código de barras Febraban</td>
                  <td className="p-4 sm:p-5 text-rose-400/80"><X size={16} /></td>
                  <td className="p-4 sm:p-5 text-rose-400/80"><X size={16} /></td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-950/20"><Check size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-white">Alertas automáticos antes do vencimento</td>
                  <td className="p-4 sm:p-5 text-rose-400/80"><X size={16} /></td>
                  <td className="p-4 sm:p-5 text-rose-400/80"><X size={16} /></td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-950/20"><Check size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-white">Sincronização em tempo real entre moradores</td>
                  <td className="p-4 sm:p-5 text-amber-400/80">Complicado</td>
                  <td className="p-4 sm:p-5 text-amber-400/80">Mensagens somem</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-950/20"><Check size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-white">App leve instalável no celular (PWA)</td>
                  <td className="p-4 sm:p-5 text-rose-400/80"><X size={16} /></td>
                  <td className="p-4 sm:p-5 text-rose-400/80"><X size={16} /></td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-950/20"><Check size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-white">Gráficos de evolução e categorias de gastos</td>
                  <td className="p-4 sm:p-5 text-amber-400/80">Precisa montar fórmulas</td>
                  <td className="p-4 sm:p-5 text-rose-400/80"><X size={16} /></td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-950/20"><Check size={18} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
