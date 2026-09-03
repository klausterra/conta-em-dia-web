import { AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type LoginScreenProps = {
  onClose?: () => void;
  isModal?: boolean;
};

export function LoginScreen({ onClose, isModal = false }: LoginScreenProps) {
  const { signInWithGoogle, isAuthenticating, authError, clearError } = useAuth();

  const content = (
    <div className="relative w-full max-w-sm rounded-3xl border border-[#1f372c] bg-[#122019] p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,.6)]">
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-xl text-zinc-400 hover:bg-[#1a3126] hover:text-white transition"
        >
          <X size={18} />
        </button>
      )}

      <img
        src="/app-logo.png"
        alt="Conta em Dia"
        className="mx-auto size-14 rounded-2xl object-cover shadow-xl shadow-emerald-950"
      />
      <h1 className="mt-4 text-xl font-black text-white tracking-tight">Conta em Dia</h1>
      <p className="mt-1 text-xs text-zinc-400">Casa leve, cabeça leve. Suas contas sem confusão.</p>

      {authError && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3.5 text-left text-xs text-rose-300"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">{authError}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          clearError();
          void signInWithGoogle();
        }}
        disabled={isAuthenticating}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-75 shadow-lg shadow-emerald-950/50"
      >
        {isAuthenticating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Conectando ao Google…</span>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="size-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Entrar com o Google</span>
          </div>
        )}
      </button>
      <p className="mt-4 text-[11px] text-zinc-500">
        Acesso seguro e instantâneo. Sem senhas adicionais.
      </p>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#08100d] px-4 text-[#f1f5f3]">
      {content}
    </main>
  );
}
