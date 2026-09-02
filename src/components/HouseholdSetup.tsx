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
    <main className="grid min-h-screen place-items-center bg-[#f6f7f4] px-4 text-[#18352c]">
      <div className="w-full max-w-sm rounded-2xl border border-[#dfe6df] bg-white p-8 shadow-[0_8px_30px_rgba(31,67,54,.05)]">
        {mode === 'choose' && (
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-[#1c694e] text-white">
              <Users size={24} />
            </div>
            <h1 className="mt-4 text-xl font-black">Quase lá!</h1>
            <p className="mt-1 text-sm text-[#6c7f77]">Crie a sua casa ou entre em uma que já existe.</p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setMode('create')}
                className="w-full rounded-xl bg-[#1c694e] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#17583f]"
              >
                Criar minha casa
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                className="w-full rounded-xl border border-[#d9e0da] px-4 py-3 text-sm font-bold text-[#18352c] transition hover:bg-[#f2f4f2]"
              >
                Já tenho um código
              </button>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
            <h1 className="text-xl font-black">Dar um nome pra casa</h1>
            <input
              name="name"
              required
              placeholder="Ex.: Nossa casa"
              className="h-11 w-full rounded-lg border border-[#d9e0da] bg-white px-3 text-sm outline-none focus-visible:border-[#54aa83] focus-visible:ring-3 focus-visible:ring-[#54aa83]/30"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-[#1c694e] text-sm font-bold text-white transition hover:bg-[#17583f] disabled:opacity-60"
            >
              Criar casa
            </button>
            <button type="button" onClick={() => setMode('choose')} className="w-full text-center text-sm font-bold text-[#6c7f77]">
              Voltar
            </button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <h1 className="text-xl font-black">Entrar com o código</h1>
            <p className="text-sm text-[#6c7f77]">Peça o código de convite para quem já cadastrou a casa.</p>
            <input
              name="code"
              required
              placeholder="Ex.: 7K9QXPZ"
              className="h-11 w-full rounded-lg border border-[#d9e0da] bg-white px-3 text-center text-sm uppercase tracking-widest outline-none focus-visible:border-[#54aa83] focus-visible:ring-3 focus-visible:ring-[#54aa83]/30"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-[#1c694e] text-sm font-bold text-white transition hover:bg-[#17583f] disabled:opacity-60"
            >
              Entrar na casa
            </button>
            <button type="button" onClick={() => setMode('choose')} className="w-full text-center text-sm font-bold text-[#6c7f77]">
              Voltar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
