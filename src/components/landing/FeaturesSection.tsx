import {
  Camera,
  Users,
  BellRing,
  PieChart,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Camera,
      title: 'Scanner Inteligente de Boletos & PIX',
      description:
        'Aponte a câmera do celular para o código de barras ou fatura. O sistema decodifica o padrão Febraban, calcula vencimento, valor e categoria automaticamente.',
      badge: 'Economiza 10 min por conta',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: Users,
      title: 'Moradores e Família Sincronizados',
      description:
        'Convide seu parceiro(a), filhos ou colegas por e-mail ou WhatsApp. Todo mundo vê o que já foi pago e o que ainda falta pagar, sem cobranças chatas.',
      badge: 'Zero atritos na casa',
      color: 'from-teal-500/20 to-cyan-500/10 text-teal-400 border-teal-500/30',
    },
    {
      icon: BellRing,
      title: 'Alertas no Celular Antes do Vencimento',
      description:
        'Notificações nativas no seu smartphone ou computador no dia do vencimento e na véspera. Diga adeus aos juros e multas por esquecimento.',
      badge: 'Economia real de dinheiro',
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30',
    },
    {
      icon: PieChart,
      title: 'Gráficos de Evolução e Categorias',
      description:
        'Visualização visual em gráficos de rosca e barras por semanas. Descubra facilmente se a conta de luz subiu ou se a internet está pesando no orçamento.',
      badge: 'Clareza financeira total',
      color: 'from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: Smartphone,
      title: 'App PWA Instalável em 1 Toque',
      description:
        'Funciona como um aplicativo nativo no iOS e Android. Abre em tela cheia, super leve, sem precisar baixar gigabytes da App Store ou Play Store.',
      badge: 'Rápido e sem downloads pesados',
      color: 'from-violet-500/20 to-indigo-500/10 text-violet-400 border-violet-500/30',
    },
    {
      icon: ShieldCheck,
      title: 'Privacidade & Login com Conta Google',
      description:
        'Acesso seguro sem precisar criar novas senhas difíceis. Dados criptografados e salvos com alta disponibilidade na nuvem do Google Firebase.',
      badge: '100% Seguro e Confiável',
      color: 'from-sky-500/20 to-blue-500/10 text-sky-400 border-sky-500/30',
    },
  ];

  return (
    <section id="recursos" className="relative py-20 md:py-28 border-t border-[#1f372c]/80 bg-[#0a130f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-400">
            <Sparkles size={13} />
            <span>RECURSOS COMPLETOS</span>
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Tudo o que sua casa precisa em um único lugar
          </h2>
          <p className="mt-3 text-sm text-zinc-400 sm:text-base">
            Desenvolvido para simplificar a rotina financeira de quem divide despesas. Sem enrolação.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-[#1f372c] bg-[#122019] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
              >
                <div
                  className={`inline-grid size-12 place-items-center rounded-xl border bg-gradient-to-br ${item.color} mb-5`}
                >
                  <Icon size={22} />
                </div>
                <div className="mb-2">
                  <span className="rounded-md border border-[#264837] bg-[#0c1612] px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
