import { useState } from 'react';
import { Bell, CalendarDays, CircleDollarSign, Copy, House, LogOut, ReceiptText, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof House;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${
        active ? 'bg-[#e1f1e9] font-bold text-[#17583f]' : 'font-medium text-[#61736c] hover:bg-white'
      }`}
    >
      <Icon size={19} />
      {label}
    </button>
  );
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { household } = useHousehold();
  const [copied, setCopied] = useState(false);

  async function handleCopyInvite() {
    if (!household) return;
    await navigator.clipboard.writeText(household.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#dfe6df] bg-[#fbfcfa] px-5 py-7 lg:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="grid size-10 place-items-center rounded-xl bg-[#1c694e] text-white">
          <House size={20} />
        </div>
        <div>
          <p className="font-extrabold leading-tight">{household?.name ?? 'Conta em Dia'}</p>
          <p className="text-xs text-[#6c7f77]">Casa leve, cabeça leve.</p>
        </div>
      </div>
      <nav className="space-y-2" aria-label="Menu principal">
        <NavItem icon={CircleDollarSign} label="Visão geral" active />
        <NavItem icon={ReceiptText} label="Minhas contas" />
        <NavItem icon={CalendarDays} label="Calendário" />
        <NavItem icon={Bell} label="Lembretes" />
      </nav>
      {household && (
        <button
          type="button"
          onClick={() => void handleCopyInvite()}
          className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-dashed border-[#c8d4cb] px-3 py-2.5 text-left hover:bg-white"
        >
          <span className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8a978f]">
              {copied ? 'Código copiado!' : 'Convidar para a casa'}
            </span>
            <span className="text-xs font-bold tracking-widest text-[#18352c]">{household.id}</span>
          </span>
          <Copy size={16} className="shrink-0 text-[#61736c]" />
        </button>
      )}
      <div className="mt-auto rounded-2xl bg-[#18352c] p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9fc9b8]">Dica rápida</p>
        <p className="mt-2 text-sm leading-relaxed">
          Ative os lembretes 3 dias antes e nunca mais pague juros por esquecimento.
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm text-[#61736c]">
          <Settings size={18} />
          <span className="truncate">{user?.displayName ?? user?.email}</span>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          aria-label="Sair"
          className="grid size-8 shrink-0 place-items-center rounded-full text-[#61736c] hover:bg-white"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
