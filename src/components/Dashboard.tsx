import { useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  House,
  Plus,
  ReceiptText,
  Settings,
  X,
} from 'lucide-react';
import { useHousehold } from '@/hooks/useHousehold';
import { useBills } from '@/hooks/useBills';
import { Sidebar } from '@/components/Sidebar';
import { AddBillModal } from '@/components/AddBillModal';
import { categoryLabels, categoryStyles, money } from '@/lib/bills';

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
  tone: 'dark' | 'mint' | 'white';
}) {
  const toneClass =
    tone === 'dark'
      ? 'border-[#18352c] bg-[#18352c] text-white'
      : tone === 'mint'
        ? 'border-[#c8e6d9] bg-[#e5f4ed]'
        : 'border-[#dfe6df] bg-white';
  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className={`text-sm font-semibold ${tone === 'dark' ? 'text-[#a9c7bb]' : 'text-[#6a7a73]'}`}>{label}</p>
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className={`mt-2 text-xs ${tone === 'dark' ? 'text-[#a9c7bb]' : 'text-[#75857d]'}`}>{note}</p>
    </div>
  );
}

function MobileNavButton({
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
      className={`flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold ${
        active ? 'text-[#1c694e]' : 'text-[#849088]'
      }`}
    >
      <Icon size={19} />
      {label}
    </button>
  );
}

export function Dashboard() {
  const { household } = useHousehold();
  const { bills, addBill, setPaid } = useBills(household?.id ?? null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    window.setTimeout(() => setNotice(''), 2600);
  }

  async function handleTogglePaid(billId: string, paid: boolean) {
    if (!household) return;
    await setPaid(household.id, billId, !paid);
    flash('Tudo certo! A conta foi atualizada.');
  }

  async function handleAddBill(bill: Parameters<typeof addBill>[1]) {
    if (!household) return;
    await addBill(household.id, bill);
    setIsModalOpen(false);
    flash('Nova conta adicionada. A gente te ajuda a lembrar.');
  }

  const today = dateFormatter.format(new Date());

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#18352c]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar />
        <section className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-8 lg:px-10 lg:py-8">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium capitalize text-[#708078]">{today}</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                Olá, vamos organizar a casa?
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#1c694e] px-4 text-sm font-bold text-white transition hover:bg-[#17583f]"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Adicionar conta</span>
            </button>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo financeiro">
            <Summary
              label="Falta pagar"
              value={money.format(totalPending)}
              note={`${pending.length} contas pendentes`}
              tone="dark"
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
              tone="white"
            />
            <div className="rounded-2xl border border-[#dfe6df] bg-white p-5">
              <div className="flex justify-between">
                <p className="text-sm font-semibold text-[#6a7a73]">Seu progresso</p>
                <span className="text-sm font-black text-[#1c694e]">{progress}%</span>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e7ece8]">
                <div
                  className="h-full rounded-full bg-[#54aa83] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-4 text-xs text-[#75857d]">Um passo de cada vez. Você está indo bem!</p>
            </div>
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="overflow-hidden rounded-2xl border border-[#dfe6df] bg-white shadow-[0_8px_30px_rgba(31,67,54,.05)]">
              <div className="flex items-center justify-between border-b border-[#e9ede9] px-5 py-5 sm:px-6">
                <div>
                  <h2 className="text-lg font-black">Próximas contas</h2>
                  <p className="mt-1 text-sm text-[#75857d]">Tudo que precisa da sua atenção.</p>
                </div>
              </div>
              <div className="divide-y divide-[#edf0ed]">
                {bills.length === 0 && (
                  <p className="px-6 py-10 text-center text-sm text-[#75857d]">
                    Nenhuma conta cadastrada ainda. Adicione a primeira acima.
                  </p>
                )}
                {bills.map((bill) => {
                  const Icon = categoryStyles[bill.category].icon;
                  return (
                    <article
                      key={bill.id}
                      className={`flex items-center gap-3 px-4 py-4 transition hover:bg-[#fafcf9] sm:gap-4 sm:px-6 ${
                        bill.paid ? 'opacity-55' : ''
                      }`}
                    >
                      <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${categoryStyles[bill.category].tone}`}>
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`truncate text-sm font-extrabold ${bill.paid ? 'line-through' : ''}`}>
                          {bill.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#79877f]">
                          Vence dia {bill.due} • {categoryLabels[bill.category]}
                        </p>
                      </div>
                      <p className="hidden text-sm font-black sm:block">{money.format(bill.value)}</p>
                      <button
                        type="button"
                        onClick={() => void handleTogglePaid(bill.id, bill.paid)}
                        aria-label={bill.paid ? `Marcar ${bill.name} como pendente` : `Marcar ${bill.name} como paga`}
                        className={`grid size-9 place-items-center rounded-full border ${
                          bill.paid
                            ? 'border-[#54aa83] bg-[#e1f1e9] text-[#1c694e]'
                            : 'border-[#d9e0da] text-transparent hover:text-[#54aa83]'
                        }`}
                      >
                        <Check size={17} />
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
            <aside className="space-y-5">
              <section className="rounded-2xl bg-[#fff4d6] p-5 text-[#4f411d]">
                <div className="flex justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-[#f8d97a]">
                    <Bell size={19} />
                  </div>
                  <span className="h-fit rounded-full bg-white/70 px-2 py-1 text-[10px] font-black uppercase">
                    Importante
                  </span>
                </div>
                <h2 className="mt-5 text-lg font-black">
                  {nextDue ? 'Sem sustos esta semana' : 'Tudo tranquilo por aqui'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#766630]">
                  {nextDue
                    ? `${nextDue.name} vence no dia ${nextDue.due}. Reserve ${money.format(nextDue.value)} para ficar tranquilo.`
                    : 'Nenhuma conta pendente no momento.'}
                </p>
                {nextDue && (
                  <button type="button" className="mt-4 flex items-center gap-1 text-sm font-black">
                    Ver detalhes <ChevronRight size={16} />
                  </button>
                )}
              </section>
            </aside>
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border border-[#dfe6df] bg-white/95 px-3 py-2 shadow-xl backdrop-blur lg:hidden">
        <MobileNavButton icon={House} label="Início" active />
        <MobileNavButton icon={ReceiptText} label="Contas" />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="-mt-8 grid size-14 place-items-center rounded-full border-4 border-[#f6f7f4] bg-[#1c694e] text-white"
          aria-label="Adicionar conta"
        >
          <Plus />
        </button>
        <MobileNavButton icon={CalendarDays} label="Agenda" />
        <MobileNavButton icon={Settings} label="Ajustes" />
      </nav>

      {notice && (
        <div role="status" className="fixed right-4 top-4 z-[60] flex items-center gap-3 rounded-xl bg-[#18352c] px-4 py-3 text-sm font-bold text-white shadow-xl">
          <span className="grid size-6 place-items-center rounded-full bg-[#54aa83]">
            <Check size={14} />
          </span>
          {notice}
          <button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">
            <X size={16} />
          </button>
        </div>
      )}

      <AddBillModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddBill} />
    </main>
  );
}
