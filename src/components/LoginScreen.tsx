import { House } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f4] px-4 text-[#18352c]">
      <div className="w-full max-w-sm rounded-2xl border border-[#dfe6df] bg-white p-8 text-center shadow-[0_8px_30px_rgba(31,67,54,.05)]">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-[#1c694e] text-white">
          <House size={24} />
        </div>
        <h1 className="mt-4 text-xl font-black">Conta em Dia</h1>
        <p className="mt-1 text-sm text-[#6c7f77]">Casa leve, cabeça leve.</p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c694e] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#17583f]"
        >
          Entrar com o Google
        </button>
      </div>
    </main>
  );
}
