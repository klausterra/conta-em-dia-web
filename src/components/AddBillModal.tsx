import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/Modal';
import type { Bill, BillCategory, NewBill, ScannedBillData } from '@/types';

type AddBillModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (bill: NewBill) => Promise<void> | void;
  initialData?: ScannedBillData | null;
  editingBill?: Bill | null;
};

const categories: BillCategory[] = ['Energia', 'Agua', 'Internet', 'Telefone', 'Outros'];

function parseCurrency(raw: string): number {
  const clean = raw.replace(/[^\d.,]/g, '').trim();
  if (!clean) return NaN;
  if (clean.includes(',')) {
    return Number(clean.replace(/\./g, '').replace(',', '.'));
  }
  const parts = clean.split('.');
  if (parts.length > 2) {
    return Number(clean.replace(/\./g, ''));
  }
  if (parts.length === 2 && parts[1].length === 3) {
    return Number(clean.replace('.', ''));
  }
  return Number(clean);
}

export function AddBillModal({
  open,
  onClose,
  onSubmit,
  initialData,
  editingBill = null,
}: AddBillModalProps) {
  const isEditing = Boolean(editingBill);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [due, setDue] = useState('');
  const [category, setCategory] = useState<BillCategory>('Outros');
  const [barcode, setBarcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setErrorMessage('');
    setIsSubmitting(false);
    if (!open) return;

    if (editingBill) {
      setName(editingBill.name);
      setValue(String(editingBill.value).replace('.', ','));
      setDue(String(editingBill.due));
      setCategory(editingBill.category);
      setBarcode(editingBill.barcode || '');
      return;
    }

    if (initialData) {
      setName(initialData.name || '');
      setValue(initialData.value ? String(initialData.value).replace('.', ',') : '');
      setDue(initialData.due ? String(initialData.due) : '');
      setCategory(initialData.category || 'Outros');
      setBarcode(initialData.barcode || '');
      return;
    }

    setName('');
    setValue('');
    setDue('');
    setCategory('Outros');
    setBarcode('');
  }, [editingBill, initialData, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    const parsedValue = parseCurrency(value);
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      setErrorMessage('Informe um valor válido.');
      return;
    }
    const parsedDue = parseInt(due, 10);
    if (!Number.isFinite(parsedDue) || parsedDue < 1 || parsedDue > 31) {
      setErrorMessage('Dia de vencimento deve ser entre 1 e 31.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        category,
        value: parsedValue,
        due: parsedDue,
        paid: editingBill?.paid ?? false,
        barcode: barcode.trim() || undefined,
        notes: editingBill?.notes,
      });
      onClose();
    } catch {
      setErrorMessage('Erro ao salvar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar conta' : 'Adicionar nova conta'}
      description={
        isEditing
          ? 'Ajuste o valor, vencimento ou outros dados desta conta.'
          : 'Cadastre uma vez. A gente organiza e lembra você.'
      }
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
              autoFocus={isEditing}
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

        {errorMessage && (
          <p className="rounded-lg bg-rose-950/60 border border-rose-900/80 p-2.5 text-center text-xs font-semibold text-rose-300">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-11 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar conta'}
        </button>
      </form>
    </Modal>
  );
}
