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

function billsCollection(uid: string) {
  return collection(db, 'users', uid, 'bills');
}

export function useBills(uid: string | null) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setBills([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const billsQuery = query(billsCollection(uid), orderBy('due', 'asc'));
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
          } satisfies Bill;
        }),
      );
      setIsLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  const actions = useMemo(
    () => ({
      async addBill(uid: string, bill: NewBill) {
        await addDoc(billsCollection(uid), { ...bill, createdAt: serverTimestamp() });
      },
      async setPaid(uid: string, billId: string, paid: boolean) {
        await updateDoc(doc(db, 'users', uid, 'bills', billId), { paid });
      },
      async removeBill(uid: string, billId: string) {
        await deleteDoc(doc(db, 'users', uid, 'bills', billId));
      },
    }),
    [],
  );

  return { bills, isLoading, ...actions };
}
