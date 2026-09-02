import { type FormEvent } from 'react';
import { Modal } from '@/components/Modal';
import type { BillCategory, NewBill } from '@/types';

type AddBillModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (bill: NewBill) => void;
};

const categories: BillCategory[] = ['Energia', 'Agua', 'Internet', 'Telefone', 'Outros'];

export function AddBillModal({ open, onClose, onSubmit }: AddBillModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit({
      name: String(formData.get('name')),
      category: formData.get('category') as BillCategory,
      value: Number(String(formData.get('value')).replace(',', '.')),
      due: Number(formData.get('due')),
      paid: false,
    });
    event.currentTarget.reset();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adicionar nova conta"
      description="Cadastre uma vez. A gente organiza o resto para você."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-bold">
          Nome da conta
          <input
            name="name"
            required
            placeholder="Ex.: Condomínio"
            className="mt-2 h-11 w-full rounded-lg border border-[#d9e0da] bg-white px-3 text-sm outline-none focus-visible:border-[#54aa83] focus-visible:ring-3 focus-visible:ring-[#54aa83]/30"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-bold">
            Valor
            <input
              name="value"
              required
              inputMode="decimal"
              placeholder="0,00"
              className="mt-2 h-11 w-full rounded-lg border border-[#d9e0da] bg-white px-3 text-sm outline-none focus-visible:border-[#54aa83] focus-visible:ring-3 focus-visible:ring-[#54aa83]/30"
            />
          </label>
          <label className="block text-sm font-bold">
            Dia do vencimento
            <input
              name="due"
              required
              type="number"
              min="1"
              max="31"
              placeholder="10"
              className="mt-2 h-11 w-full rounded-lg border border-[#d9e0da] bg-white px-3 text-sm outline-none focus-visible:border-[#54aa83] focus-visible:ring-3 focus-visible:ring-[#54aa83]/30"
            />
          </label>
        </div>
        <label className="block text-sm font-bold">
          Categoria
          <select
            name="category"
            className="mt-2 h-11 w-full rounded-lg border border-[#d9e0da] bg-white px-3 text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'Agua' ? 'Água' : category}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-[#1c694e] text-sm font-bold text-white transition hover:bg-[#17583f]"
        >
          Salvar conta
        </button>
      </form>
    </Modal>
  );
}
