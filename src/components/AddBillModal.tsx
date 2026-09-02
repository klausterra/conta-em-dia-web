import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/Modal';
import type { BillCategory, NewBill, ScannedBillData } from '@/types';

type AddBillModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (bill: NewBill) => void;
  initialData?: ScannedBillData | null;
};

const categories: BillCategory[] = ['Energia', 'Agua', 'Internet', 'Telefone', 'Outros'];

export function AddBillModal({ open, onClose, onSubmit, initialData }: AddBillModalProps) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [due, setDue] = useState('');
  const [category, setCategory] = useState<BillCategory>('Outros');
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setValue(initialData.value ? String(initialData.value).replace('.', ',') : '');
      setDue(initialData.due ? String(initialData.due) : '');
      setCategory(initialData.category || 'Outros');
      setBarcode(initialData.barcode || '');
    } else {
      setName('');
      setValue('');
      setDue('');
      setCategory('Outros');
      setBarcode('');
    }
  }, [initialData, open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name,
      category,
      value: Number(value.replace(',', '.')),
      due: Number(due),
      paid: false,
      barcode: barcode || undefined,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar nova conta"
      description="Cadastre uma vez. A gente organiza e lembra você."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-xs font-bold text-zinc-300">
          Nome da conta
          <input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Conta de Luz"
            className="mt-1.5 h-11 w-full rounded-xl border border-[#223d32] bg-[#122019] px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-bold text-zinc-300">
            Valor (R$)
            <input
              name="value"
              required
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0,00"
              className="mt-1.5 h-11 w-full rounded-xl border border-[#223d32] bg-[#122019] px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </label>
          <label className="block text-xs font-bold text-zinc-300">
            Dia do vencimento
            <input
              name="due"
              required
              type="number"
              min="1"
              max="31"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="10"
              className="mt-1.5 h-11 w-full rounded-xl border border-[#223d32] bg-[#122019] px-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </label>
        </div>

        <label className="block text-xs font-bold text-zinc-300">
          Categoria
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as BillCategory)}
            className="mt-1.5 h-11 w-full rounded-xl border border-[#223d32] bg-[#122019] px-3 text-sm text-white outline-none focus:border-emerald-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#122019] text-white">
                {cat === 'Agua' ? 'Água' : cat}
              </option>
            ))}
          </select>
        </label>

        {barcode && (
          <div className="rounded-xl border border-[#1f372c] bg-[#0c1612] p-2.5">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Código escaneado</span>
            <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400">{barcode}</p>
          </div>
        )}

        <button
          type="submit"
          className="mt-2 h-11 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          Salvar conta
        </button>
      </form>
    </Modal>
  );
}
