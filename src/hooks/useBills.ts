import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Bill, NewBill } from '@/types';

function billsCollection(householdId: string) {
  return collection(db, 'households', householdId, 'bills');
}

export function useBills(householdId: string | null) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setBills([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const billsQuery = query(billsCollection(householdId), orderBy('due', 'asc'));
    const unsubscribe = onSnapshot(billsQuery, (snapshot) => {
      setBills(
        snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            name: data.name,
            category: data.category,
            value: data.value,
            due: data.due,
            paid: data.paid,
            barcode: data.barcode,
            notes: data.notes,
          } satisfies Bill;
        }),
      );
      setIsLoading(false);
    });
    return unsubscribe;
  }, [householdId]);

  const actions = useMemo(
    () => ({
      async addBill(householdId: string, bill: NewBill) {
        const data: Record<string, unknown> = {
          name: bill.name,
          category: bill.category,
          value: bill.value,
          due: bill.due,
          paid: bill.paid ?? false,
          createdAt: serverTimestamp(),
        };
        if (bill.barcode) data.barcode = bill.barcode;
        if (bill.notes) data.notes = bill.notes;
        await addDoc(billsCollection(householdId), data);
      },
      async updateBill(householdId: string, billId: string, bill: NewBill) {
        const data: Record<string, unknown> = {
          name: bill.name,
          category: bill.category,
          value: bill.value,
          due: bill.due,
          paid: bill.paid ?? false,
        };
        data.barcode = bill.barcode || null;
        data.notes = bill.notes || null;
        await updateDoc(doc(db, 'households', householdId, 'bills', billId), data);
      },
      async setPaid(householdId: string, billId: string, paid: boolean) {
        await updateDoc(doc(db, 'households', householdId, 'bills', billId), { paid });
      },
      async removeBill(householdId: string, billId: string) {
        await deleteDoc(doc(db, 'households', householdId, 'bills', billId));
      },
    }),
    [],
  );

  return { bills, isLoading, ...actions };
}
