import { AlertCircle, House, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function LoginScreen() {
  const { signInWithGoogle, isAuthenticating, authError, clearError } = useAuth();

  return (
    <main className="grid min-h-screen place-items-center bg-[#08100d] px-4 text-[#f1f5f3]">
      <div className="w-full max-w-sm rounded-2xl border border-[#1f372c] bg-[#122019] p-8 text-center shadow-[0_12px_40px_rgba(0,0,0,.5)]">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-950">
          <House size={24} />
        </div>
        <h1 className="mt-4 text-xl font-black text-white tracking-tight">Conta em Dia</h1>
        <p className="mt-1 text-xs text-zinc-400">Casa leve, cabeça leve.</p>

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
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-75 shadow-lg shadow-emerald-950/50"
        >
          {isAuthenticating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Conectando ao Google…</span>
            </>
          ) : (
            'Entrar com o Google'
          )}
        </button>
      </div>
    </main>
  );
}
