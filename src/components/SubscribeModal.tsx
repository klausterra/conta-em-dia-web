import { Check, Loader2, Sparkles } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { SUBSCRIPTION } from '@/lib/subscription';

type SubscribeModalProps = {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  isStarting?: boolean;
  error?: string | null;
  /** true = checkout via Google Play Billing (TWA) */
  playBilling?: boolean;
};

const benefits = [
  'Scanner de boletos ilimitado com a câmera',
  'Alertas automáticos de vencimento',
  'Moradores ilimitados na mesma casa',
  'Gráficos de evolução e categorias',
];

export function SubscribeModal({
  open,
  onClose,
  onSubscribe,
  isStarting = false,
  error = null,
  playBilling = false,
}: SubscribeModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${SUBSCRIPTION.planName}`}
      description={
        playBilling
          ? `${SUBSCRIPTION.trialDays} dias grátis via Google Play, depois ${SUBSCRIPTION.amountLabel}/mês.`
          : `${SUBSCRIPTION.trialDays} dias grátis, depois ${SUBSCRIPTION.amountLabel}/mês. Cancele quando quiser.`
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-800/50 bg-emerald-950/30 p-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{SUBSCRIPTION.amountLabel}</span>
            <span className="text-xs text-zinc-400">/mês</span>
          </div>
          <p className="mt-1 text-xs font-bold text-emerald-300">
            Trial de {SUBSCRIPTION.trialDays} dias — sem cobrança agora
          </p>
          {playBilling && (
            <p className="mt-2 text-[11px] text-zinc-400">
              Pagamento seguro pela Google Play neste dispositivo.
            </p>
          )}
        </div>

        <ul className="space-y-2.5">
          {benefits.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-xs text-zinc-200">
              <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {error && (
          <p className="rounded-xl border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={isStarting}
          onClick={onSubscribe}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {isStarting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Abrindo pagamento…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {playBilling
                ? `Assinar com Google Play`
                : `Começar ${SUBSCRIPTION.trialDays} dias grátis`}
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
