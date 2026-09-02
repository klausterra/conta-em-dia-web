import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateInviteCode } from '@/lib/inviteCode';
import { useAuth } from '@/hooks/useAuth';
import type { Household } from '@/types';

type HouseholdContextValue = {
  household: Household | null;
  isLoading: boolean;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (code: string) => Promise<void>;
};

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHouseholdId(null);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      setHouseholdId((snapshot.data()?.householdId as string | undefined) ?? null);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!householdId) {
      setHousehold(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = onSnapshot(doc(db, 'households', householdId), (snapshot) => {
      const data = snapshot.data();
      setHousehold(data ? { id: snapshot.id, name: data.name, members: data.members } : null);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [householdId]);

  async function createHousehold(name: string) {
    if (!user) return;
    const code = generateInviteCode();
    await setDoc(doc(db, 'households', code), {
      name,
      members: [user.uid],
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'users', user.uid), { householdId: code }, { merge: true });
  }

  async function joinHousehold(code: string) {
    if (!user) return;
    const normalizedCode = code.trim().toUpperCase();
    const householdSnapshot = await getDoc(doc(db, 'households', normalizedCode));
    if (!householdSnapshot.exists()) {
      throw new Error('Código inválido. Confira com quem te convidou.');
    }
    await updateDoc(doc(db, 'households', normalizedCode), {
      members: arrayUnion(user.uid),
    });
    await setDoc(doc(db, 'users', user.uid), { householdId: normalizedCode }, { merge: true });
  }

  return (
    <HouseholdContext.Provider value={{ household, isLoading, createHousehold, joinHousehold }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold(): HouseholdContextValue {
  const context = useContext(HouseholdContext);
  if (!context) throw new Error('useHousehold must be used within HouseholdProvider');
  return context;
}
