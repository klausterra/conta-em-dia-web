import { useMemo, useState } from 'react';
import {
  Bell,
  Camera,
  Check,
  LineChart,
  Plus,
  ReceiptText,
  Users,
  X,
} from 'lucide-react';
import { useHousehold } from '@/hooks/useHousehold';
import { useBills } from '@/hooks/useBills';
import { useNotifications } from '@/hooks/useNotifications';
import { Sidebar } from '@/components/Sidebar';
import { AddBillModal } from '@/components/AddBillModal';
import { ScanBillModal } from '@/components/ScanBillModal';
import { HouseholdMembersModal } from '@/components/HouseholdMembersModal';
import { EvolutionCharts } from '@/components/EvolutionCharts';
import { categoryLabels, categoryStyles, money } from '@/lib/bills';
import type { ScannedBillData } from '@/types';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function Summary({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: 'primary' | 'mint' | 'surface';
}) {
  const toneClass =
    tone === 'primary'
      ? 'border-emerald-800/60 bg-[#122c20] text-white'
      : tone === 'mint'
        ? 'border-[#223d32] bg-[#14231d] text-emerald-300'
        : 'border-[#223d32] bg-[#14231d] text-white';

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs font-semibold text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{note}</p>
    </div>
  );
}

export function Dashboard() {
  const { household } = useHousehold();
  const { bills, addBill, setPaid } = useBills(household?.id ?? null);
  useNotifications(bills); // verifica contas e notifica se vencendo hoje

  const [activeTab, setActiveTab] = useState<'overview' | 'charts'>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedBillData | null>(null);
  const [notice, setNotice] = useState('');

  const pending = useMemo(() => bills.filter((bill) => !bill.paid), [bills]);
  const totalPending = useMemo(() => pending.reduce((sum, bill) => sum + bill.value, 0), [pending]);
  const totalPaid = useMemo(
    () => bills.filter((bill) => bill.paid).reduce((sum, bill) => sum + bill.value, 0),
    [bills],
  );
  const progress = bills.length > 0 ? Math.round((bills.filter((bill) => bill.paid).length / bills.length) * 100) : 0;
  const nextDue = pending[0];

  function flash(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 2800);
  }

  async function handleTogglePaid(billId: string, paid: boolean) {
    if (!household) return;
    await setPaid(household.id, billId, !paid);
    flash('Tudo certo! A conta foi atualizada.');
  }

  async function handleAddBill(bill: Parameters<typeof addBill>[1]) {
    if (!household) return;
    await addBill(household.id, bill);
    setIsAddModalOpen(false);
    setScannedData(null);
    flash('Nova conta adicionada. A gente te ajuda a lembrar.');
  }

  function handleScannedCode(data: ScannedBillData) {
    setScannedData(data);
    setIsScanModalOpen(false);
    setIsAddModalOpen(true);
  }

  const today = dateFormatter.format(new Date());

  return (
    <main className="min-h-screen bg-[#08100d] text-[#f1f5f3]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenMembers={() => setIsMembersModalOpen(true)}
        />

        <section className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-8 lg:px-10 lg:py-8">
          {/* Cabeçalho */}
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold capitalize text-emerald-400">{today}</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl text-white">
                Olá, vamos organizar a casa?
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Botão Escanear */}
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className="flex h-11 items-center gap-2 rounded-xl border border-[#264436] bg-[#14231d] px-4 text-xs font-bold text-emerald-300 transition hover:bg-[#1a3127]"
              >
                <Camera size={17} />
                <span>Escanear conta</span>
              </button>

              {/* Botão Adicionar */}
              <button
                type="button"
                onClick={() => {
                  setScannedData(null);
                  setIsAddModalOpen(true);
                }}
                className="flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
              >
                <Plus size={18} />
                <span>Adicionar conta</span>
              </button>
            </div>
          </header>

          {/* Abas de Navegação no Topo (Visão Geral vs Evolução) */}
          <div className="mb-6 flex gap-2 border-b border-[#1a2e25] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-[#183126] text-emerald-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ReceiptText size={16} />
              <span>Contas & Resumo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeTab === 'charts'
                  ? 'bg-[#183126] text-emerald-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LineChart size={16} />
              <span>Evolução & Gráficos</span>
            </button>
          </div>

          {activeTab === 'charts' ? (
            <EvolutionCharts bills={bills} />
          ) : (
            <>
              {/* Resumo Financeiro 4 Cards */}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo financeiro">
                <Summary
                  label="Falta pagar"
                  value={money.format(totalPending)}
                  note={`${pending.length} contas pendentes`}
                  tone="primary"
                />
                <Summary
                  label="Próximo vencimento"
                  value={nextDue ? `Dia ${nextDue.due}` : '—'}
                  note={nextDue ? nextDue.name : 'Nenhuma conta pendente'}
                  tone="mint"
                />
                <Summary
                  label="Já pago no mês"
                  value={money.format(totalPaid)}
                  note={`${progress}% das contas resolvidas`}
                  tone="surface"
                />
                <div className="rounded-2xl border border-[#223d32] bg-[#14231d] p-5">
                  <div className="flex justify-between">
                    <p className="text-xs font-semibold text-zinc-400">Seu progresso</p>
                    <span className="text-xs font-black text-emerald-400">{progress}%</span>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#0b1411]">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-[11px] text-zinc-400">
                    {progress === 100
                      ? 'Parabéns! Todas as contas do mês estão pagas.'
                      : 'Um passo de cada vez. Mantenha a casa em dia!'}
                  </p>
                </div>
              </section>

              {/* Lista de Contas e Dicas */}
              <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <section className="overflow-hidden rounded-2xl border border-[#223d32] bg-[#14231d] shadow-[0_8px_30px_rgba(0,0,0,.2)]">
                  <div className="flex items-center justify-between border-b border-[#1f372c] px-5 py-5 sm:px-6">
                    <div>
                      <h2 className="text-base font-black text-white">Próximas contas</h2>
                      <p className="mt-0.5 text-xs text-zinc-400">Tudo que precisa da sua atenção.</p>
                    </div>
                  </div>

                  <div className="divide-y divide-[#1b3127]">
                    {bills.length === 0 && (
                      <p className="px-6 py-12 text-center text-xs text-zinc-500">
                        Nenhuma conta cadastrada ainda. Use os botões acima para escanear ou adicionar.
                      </p>
                    )}
                    {bills.map((bill) => {
                      const Icon = categoryStyles[bill.category].icon;
                      return (
                        <article
                          key={bill.id}
                          className={`flex items-center gap-3 px-4 py-4 transition hover:bg-[#182a23] sm:gap-4 sm:px-6 ${
                            bill.paid ? 'opacity-45' : ''
                          }`}
                        >
                          <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${categoryStyles[bill.category].tone}`}>
                            <Icon size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className={`truncate text-sm font-extrabold text-white ${bill.paid ? 'line-through text-zinc-400' : ''}`}>
                              {bill.name}
                            </h3>
                            <p className="mt-0.5 text-xs text-zinc-400">
                              Vence dia {bill.due} • {categoryLabels[bill.category]}
                            </p>
                          </div>
                          <p className="text-sm font-black text-white">{money.format(bill.value)}</p>
                          <button
                            type="button"
                            onClick={() => void handleTogglePaid(bill.id, bill.paid)}
                            aria-label={bill.paid ? `Marcar ${bill.name} como pendente` : `Marcar ${bill.name} como paga`}
                            className={`grid size-9 place-items-center rounded-full border transition ${
                              bill.paid
                                ? 'border-emerald-500 bg-emerald-950 text-emerald-400'
                                : 'border-zinc-700 text-transparent hover:border-emerald-500 hover:text-emerald-400'
                            }`}
                          >
                            <Check size={16} />
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <aside className="space-y-5">
                  <section className="rounded-2xl border border-amber-900/40 bg-amber-950/30 p-5 text-amber-200">
                    <div className="flex justify-between">
                      <div className="grid size-10 place-items-center rounded-xl bg-amber-900/60 text-amber-300">
                        <Bell size={18} />
                      </div>
                      <span className="h-fit rounded-full bg-amber-900/50 border border-amber-700/50 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300">
                        Lembrete
                      </span>
                    </div>
                    <h2 className="mt-4 text-base font-black text-amber-100">
                      {nextDue ? 'Sem sustos esta semana' : 'Tudo tranquilo por aqui'}
                    </h2>
                    <p className="mt-1.5 text-xs leading-relaxed text-amber-300/80">
                      {nextDue
                        ? `${nextDue.name} vence no dia ${nextDue.due}. Reserve ${money.format(nextDue.value)} para ficar tranquilo.`
                        : 'Nenhuma conta pendente no momento.'}
                    </p>
                  </section>
                </aside>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Navegação Inferior Móvel */}
      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border border-[#1f372c] bg-[#0c1511]/95 px-3 py-2 shadow-2xl backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'overview' ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          <ReceiptText size={18} />
          Início
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charts')}
          className={`flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold ${
            activeTab === 'charts' ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          <LineChart size={18} />
          Evolução
        </button>

        {/* Botão Central de Escanear */}
        <button
          type="button"
          onClick={() => setIsScanModalOpen(true)}
          className="-mt-7 grid size-13 place-items-center rounded-full border-4 border-[#08100d] bg-emerald-600 text-white shadow-lg"
          aria-label="Escanear conta"
        >
          <Camera size={22} />
        </button>

        <button
          type="button"
          onClick={() => setIsMembersModalOpen(true)}
          className="flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold text-zinc-500"
        >
          <Users size={18} />
          Moradores
        </button>

        <button
          type="button"
          onClick={() => {
            setScannedData(null);
            setIsAddModalOpen(true);
          }}
          className="flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold text-zinc-500"
        >
          <Plus size={18} />
          Nova conta
        </button>
      </nav>

      {notice && (
        <div
          role="status"
          className="fixed right-4 top-4 z-[60] flex items-center gap-3 rounded-xl border border-emerald-800 bg-[#122c20] px-4 py-3 text-xs font-bold text-white shadow-2xl"
        >
          <span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-black">
            <Check size={12} strokeWidth={3} />
          </span>
          {notice}
          <button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Modais */}
      <AddBillModal
        open={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setScannedData(null);
        }}
        onSubmit={handleAddBill}
        initialData={scannedData}
      />

      <ScanBillModal
        open={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanned={handleScannedCode}
      />

      <HouseholdMembersModal
        open={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
      />
    </main>
  );
}
