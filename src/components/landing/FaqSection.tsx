import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Preciso baixar o app pela App Store ou Google Play?',
      a: 'Não! O Conta em Dia é um PWA (Progressive Web App) de última geração. Basta abrir o site no navegador do celular (Chrome ou Safari) e clicar em "Instalar" ou "Adicionar à Tela de Início". Ele funciona como um app nativo, não ocupa memória e abre instantaneamente em tela cheia.',
    },
    {
      q: 'Como convido meu parceiro(a) ou quem mora comigo?',
      a: 'É muito simples! Dentro do painel da casa, você pode convidar digitando o e-mail dele(a) ou clicando no botão de compartilhar via WhatsApp com o código exclusivo da sua casa. Ao entrar com a conta Google, ele(a) já estará na mesma casa.',
    },
    {
      q: 'Como funciona o leitor de boletos com a câmera?',
      a: 'Basta tocar no botão "Escanear conta" e apontar a câmera do celular para o código de barras ou linha digitável da sua fatura (água, luz, gás, condomínio ou telecom). O sistema decodifica as regras Febraban, preenchendo automaticamente o valor, o dia de vencimento e a categoria.',
    },
    {
      q: 'As notificações funcionam mesmo com o app fechado?',
      a: 'Sim! Com as notificações PWA ativadas, o navegador do seu celular ou computador envia lembretes pontuais antes e no dia do vencimento para garantir que nenhuma conta passe batida.',
    },
    {
      q: 'O aplicativo faz pagamentos direto da minha conta bancária?',
      a: 'Não. Por máxima segurança, o Conta em Dia é uma ferramenta de gestão, conferência e controle de despesas compartilhadas. Nós nunca solicitamos senhas de banco ou dados de cartão de crédito para movimentações.',
    },
  ];

  return (
    <section id="faq" className="relative py-20 md:py-28 border-t border-[#1f372c]/80 bg-[#08100d]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-400">
            <HelpCircle size={13} />
            <span>DÚVIDAS FREQUENTES</span>
          </div>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Tudo o que você precisa saber
          </h2>
          <p className="mt-2 text-xs text-zinc-400 sm:text-sm">
            Ficou com alguma dúvida? Confira as respostas para as perguntas mais comuns.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-[#1f372c] bg-[#122019] transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-xs font-bold text-white transition hover:text-emerald-300 sm:text-sm"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-zinc-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-[#1c3328] px-5 pb-5 pt-3 text-xs leading-relaxed text-zinc-300 sm:text-sm">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
