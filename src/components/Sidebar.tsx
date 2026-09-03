import { useState } from 'react';
import {
  BellRing,
  Check,
  CircleDollarSign,
  Copy,
  LineChart,
  LogOut,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useNotifications } from '@/hooks/useNotifications';

type SidebarProps = {
  activeTab: 'overview' | 'charts';
  onSelectTab: (tab: 'overview' | 'charts') => void;
  onOpenMembers: () => void;
};

export function Sidebar({ activeTab, onSelectTab, onOpenMembers }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { household } = useHousehold();
  const { isGranted, enableNotifications, sendTestNotification } = useNotifications();
  const [copied, setCopied] = useState(false);

  async function handleCopyInvite() {
    if (!household) return;
    await navigator.clipboard.writeText(household.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[#1a2e25] bg-[#0c1511] px-5 py-7 lg:flex">
      {/* Topo / Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <img
          src="/app-logo.png"
          alt="Logo"
          className="size-10 rounded-xl object-cover shadow-lg shadow-emerald-950"
        />
        <div className="min-w-0">
          <p className="truncate font-extrabold text-white leading-tight">{household?.name ?? 'Conta em Dia'}</p>
          <p className="text-[11px] text-zinc-400">Casa leve, cabeça leve.</p>
        </div>
      </div>

      {/* Menu Principal */}
      <nav className="space-y-1.5" aria-label="Menu principal">
        <button
          type="button"
          onClick={() => onSelectTab('overview')}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-bold transition ${
            activeTab === 'overview'
              ? 'bg-[#183126] text-emerald-400 shadow-sm'
              : 'text-zinc-400 hover:bg-[#12221b] hover:text-zinc-200'
          }`}
        >
          <CircleDollarSign size={18} />
          <span>Visão geral</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('charts')}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-xs font-bold transition ${
            activeTab === 'charts'
              ? 'bg-[#183126] text-emerald-400 shadow-sm'
              : 'text-zinc-400 hover:bg-[#12221b] hover:text-zinc-200'
          }`}
        >
          <LineChart size={18} />
          <span>Evolução & Gráficos</span>
        </button>

        <button
          type="button"
          onClick={onOpenMembers}
          className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-xs font-bold text-zinc-400 transition hover:bg-[#12221b] hover:text-zinc-200"
        >
          <span className="flex items-center gap-3">
            <Users size={18} />
            <span>Moradores</span>
          </span>
          <span className="rounded-full bg-[#183126] px-2 py-0.5 text-[10px] font-black text-emerald-400">
            {household?.members.length ?? 1}
          </span>
        </button>
      </nav>

      {/* Cartão de Convite */}
      {household && (
        <button
          type="button"
          onClick={() => void handleCopyInvite()}
          className="mt-5 flex items-center justify-between gap-2 rounded-xl border border-dashed border-[#234334] bg-[#101e18] px-3.5 py-2.5 text-left transition hover:border-emerald-700/60"
        >
          <span className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              {copied ? 'Código copiado!' : 'Convidar morador'}
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-zinc-200">{household.id}</span>
          </span>
          {copied ? <Check size={16} className="text-emerald-400 shrink-0" /> : <Copy size={16} className="shrink-0 text-zinc-400" />}
        </button>
      )}

      {/* Box de Notificações PWA / Push */}
      <div className="mt-auto rounded-2xl border border-[#1f372c] bg-[#14231d] p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <BellRing size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Alertas</span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
              isGranted ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {isGranted ? 'Ativadas' : 'Desativadas'}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-300">
          Receba avisos no seu celular ou PC antes do vencimento para nunca pagar juros.
        </p>
        <div className="mt-3 flex gap-2">
          {!isGranted ? (
            <button
              type="button"
              onClick={() => void enableNotifications()}
              className="flex-1 rounded-xl bg-emerald-600 py-2 text-center text-xs font-bold text-white transition hover:bg-emerald-500"
            >
              Ativar avisos
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void sendTestNotification()}
              className="flex-1 rounded-xl border border-[#264436] py-1.5 text-center text-[11px] font-bold text-emerald-300 hover:bg-[#1c3328]"
            >
              Testar alerta
            </button>
          )}
        </div>
      </div>

      {/* Usuário / Logout */}
      <div className="mt-4 flex items-center justify-between border-t border-[#1a2e25] pt-4 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="size-7 rounded-full object-cover border border-[#223d32]"
            />
          ) : (
            <div className="grid size-7 place-items-center rounded-full bg-[#183126] font-bold text-xs text-emerald-300">
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate text-xs font-bold text-zinc-300">
            {user?.displayName ?? user?.email}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          title="Sair da conta"
          className="flex items-center gap-1.5 rounded-lg border border-[#244535] bg-[#14261e] px-2.5 py-1.5 text-xs font-bold text-zinc-300 hover:border-rose-900/60 hover:bg-rose-950/40 hover:text-rose-300 transition shrink-0"
        >
          <LogOut size={14} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
