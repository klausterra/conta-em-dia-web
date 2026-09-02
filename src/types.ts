export type BillCategory = 'Energia' | 'Agua' | 'Internet' | 'Telefone' | 'Outros';

export type Bill = {
  id: string;
  name: string;
  category: BillCategory;
  value: number;
  due: number;
  paid: boolean;
};

export type NewBill = Omit<Bill, 'id'>;

export type Household = {
  id: string;
  name: string;
  members: string[];
};
