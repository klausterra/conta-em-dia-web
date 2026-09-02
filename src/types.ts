export type BillCategory = 'Energia' | 'Agua' | 'Internet' | 'Telefone' | 'Outros';

export type Bill = {
  id: string;
  name: string;
  category: BillCategory;
  value: number;
  due: number;
  paid: boolean;
  barcode?: string;
  notes?: string;
};

export type NewBill = Omit<Bill, 'id'>;

export type HouseholdMember = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isOwner?: boolean;
};

export type HouseholdInvite = {
  id: string;
  email: string;
  invitedBy: string;
  createdAt: string;
};

export type Household = {
  id: string;
  name: string;
  members: string[];
  ownerUid?: string;
  invites?: HouseholdInvite[];
  memberProfiles?: HouseholdMember[];
};

export type ScannedBillData = {
  name?: string;
  category?: BillCategory;
  value?: number;
  due?: number;
  barcode?: string;
};

