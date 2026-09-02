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
  Energia: { icon: Lightbulb, tone: 'bg-amber-950/50 text-amber-400 border border-amber-800/40' },
  Agua: { icon: Droplets, tone: 'bg-sky-950/50 text-sky-400 border border-sky-800/40' },
  Internet: { icon: Wifi, tone: 'bg-violet-950/50 text-violet-400 border border-violet-800/40' },
  Telefone: { icon: Smartphone, tone: 'bg-rose-950/50 text-rose-400 border border-rose-800/40' },
  Outros: { icon: ReceiptText, tone: 'bg-zinc-800/60 text-zinc-300 border border-zinc-700/40' },
};

