import { Modal } from '@/components/Modal';
import { Smartphone, Share2, MoreVertical, CheckCircle2 } from 'lucide-react';

type InstallPromptModalProps = {
  open: boolean;
  onClose: () => void;
  isIOS?: boolean;
};

export function InstallPromptModal({ open, onClose, isIOS = false }: InstallPromptModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Instalar Conta em Dia">
      <div className="space-y-5 text-zinc-300">
        {/* Topo com Logo e Destaque */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
          <img
            src="/app-logo.png"
            alt="Conta em Dia"
            className="size-12 rounded-xl object-cover shadow-lg border border-emerald-700/50"
          />
          <div>
            <h3 className="text-sm font-black text-white">Instalar na Tela Inicial</h3>
            <p className="text-xs text-emerald-400 font-semibold">
              Acesso rápido com 1 toque, sem gastar memória da Play Store.
            </p>
          </div>
        </div>

        {/* Instruções passo a passo */}
        {isIOS ? (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Como instalar no iPhone / iPad (Safari):
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 rounded-xl border border-[#223d32] bg-[#14231d] p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#183126] text-emerald-400">
                  <Share2 size={14} />
                </span>
                <div>
                  <p className="font-bold text-white">1. Toque em Compartilhar</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    No rodapé do Safari, clique no ícone quadrado com uma seta para cima.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#223d32] bg-[#14231d] p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#183126] text-emerald-400">
                  <Smartphone size={14} />
                </span>
                <div>
                  <p className="font-bold text-white">2. Adicionar à Tela de Início</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Role as opções e toque em <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Como instalar no Android (Chrome / Edge / Samsung):
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 rounded-xl border border-[#223d32] bg-[#14231d] p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#183126] text-emerald-400">
                  <MoreVertical size={14} />
                </span>
                <div>
                  <p className="font-bold text-white">1. Abra o menu do navegador</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Toque nos três pontinhos <strong>(⋮)</strong> no canto superior direito do seu navegador.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-[#223d32] bg-[#14231d] p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#183126] text-emerald-400">
                  <Smartphone size={14} />
                </span>
                <div>
                  <p className="font-bold text-white">2. Instalar aplicativo</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dica importante para quem já tinha o app antigo */}
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3.5 text-xs text-amber-300 flex items-start gap-2.5">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <p className="text-[11px] leading-relaxed">
            <strong>Dica do novo ícone:</strong> Se você já tinha o atalho antigo na tela inicial do celular, remova o atalho anterior antes de instalar novamente para que o novo ícone escuro seja aplicado imediatamente!
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-emerald-600 py-3 text-center text-xs font-black text-white hover:bg-emerald-500 transition shadow-lg"
        >
          Entendi
        </button>
      </div>
    </Modal>
  );
}
