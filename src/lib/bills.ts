import { Droplets, Lightbulb, ReceiptText, Smartphone, Wifi, type LucideIcon } from 'lucide-react';
import type { BillCategory } from '@/types';

export const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const categoryLabels: Record<BillCategory, string> = {
  Energia: 'Energia',
  Agua: 'Água',
  Internet: 'Internet',
  Telefone: 'Telefone',
  Outros: 'Outros',
};

export const categoryStyles: Record<BillCategory, { icon: LucideIcon; tone: string }> = {
  Energia: { icon: Lightbulb, tone: 'bg-amber-100 text-amber-700' },
  Agua: { icon: Droplets, tone: 'bg-sky-100 text-sky-700' },
  Internet: { icon: Wifi, tone: 'bg-violet-100 text-violet-700' },
  Telefone: { icon: Smartphone, tone: 'bg-rose-100 text-rose-700' },
  Outros: { icon: ReceiptText, tone: 'bg-stone-100 text-stone-700' },
};
