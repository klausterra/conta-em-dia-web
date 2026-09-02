import { useState, type FormEvent } from 'react';
import { Users } from 'lucide-react';
import { useHousehold } from '@/hooks/useHousehold';

type Mode = 'choose' | 'create' | 'join';

export function HouseholdSetup() {
  const { createHousehold, joinHousehold } = useHousehold();
  const [mode, setMode] = useState<Mode>('choose');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const name = String(new FormData(event.currentTarget).get('name'));
    try {
      await createHousehold(name);
    } catch {
      setError('Não deu para criar a casa. Tenta de novo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const code = String(new FormData(event.currentTarget).get('code'));
    try {
      await joinHousehold(code);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Não foi possível entrar na casa.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#08100d] px-4 text-[#f1f5f3]">
      <div className="w-full max-w-sm rounded-2xl border border-[#1f372c] bg-[#122019] p-8 shadow-[0_12px_40px_rgba(0,0,0,.5)]">
        {mode === 'choose' && (
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-950">
              <Users size={24} />
            </div>
            <h1 className="mt-4 text-xl font-black text-white">Quase lá!</h1>
            <p className="mt-1 text-xs text-zinc-400">Crie a sua casa ou entre em uma que já existe.</p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setMode('create')}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
              >
                Criar minha casa
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                className="w-full rounded-xl border border-[#234334] bg-[#162720] px-4 py-3 text-sm font-bold text-zinc-200 transition hover:bg-[#1c3328]"
              >
                Já tenho um código
              </button>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            <h1 className="text-xl font-black text-white">Dar um nome pra casa</h1>
            <input
              name="name"
              required
              placeholder="Ex.: Nossa casa"
              className="h-11 w-full rounded-xl border border-[#223d32] bg-[#0c1612] px-3 text-sm text-white outline-none focus:border-emerald-500"
            />
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-60 shadow-lg shadow-emerald-950/50"
            >
              Criar casa
            </button>
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="w-full text-center text-xs font-bold text-zinc-400 hover:text-zinc-200 transition"
            >
              Voltar
            </button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <h1 className="text-xl font-black text-white">Entrar com o código</h1>
            <p className="text-xs text-zinc-400">Peça o código de convite para quem já cadastrou a casa.</p>
            <input
              name="code"
              required
              placeholder="Ex.: 7K9QXPZ"
              className="h-11 w-full rounded-xl border border-[#223d32] bg-[#0c1612] px-3 text-center text-sm uppercase tracking-widest text-white outline-none focus:border-emerald-500 font-mono font-bold"
            />
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-60 shadow-lg shadow-emerald-950/50"
            >
              Entrar na casa
            </button>
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="w-full text-center text-xs font-bold text-zinc-400 hover:text-zinc-200 transition"
            >
              Voltar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
