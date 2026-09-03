import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  arrayRemove,
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
import type { Household, HouseholdInvite, HouseholdMember } from '@/types';

type HouseholdContextValue = {
  household: Household | null;
  isLoading: boolean;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (code: string) => Promise<void>;
  inviteByEmail: (email: string) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  removeMember: (memberUid: string) => Promise<void>;
  leaveHousehold: () => Promise<void>;
  renameHousehold: (name: string) => Promise<void>;
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
    const unsubscribe = onSnapshot(doc(db, 'households', householdId), async (snapshot) => {
      const data = snapshot.data();
      if (!data) {
        setHousehold(null);
        setIsLoading(false);
        return;
      }

      const membersList: string[] = data.members ?? [];
      const invitesList: HouseholdInvite[] = data.invites ?? [];
      const ownerUid: string = data.ownerUid ?? membersList[0] ?? '';

      // Buscar os perfis dos membros em users/{uid}
      const memberProfiles: HouseholdMember[] = await Promise.all(
        membersList.map(async (uid) => {
          try {
            const userSnap = await getDoc(doc(db, 'users', uid));
            const userData = userSnap.data();
            return {
              uid,
              displayName: userData?.displayName || (uid === user?.uid ? user.displayName || 'Você' : 'Morador'),
              email: userData?.email || (uid === user?.uid ? user.email || '' : ''),
              photoURL: userData?.photoURL || (uid === user?.uid ? user.photoURL || undefined : undefined),
              isOwner: uid === ownerUid,
            };
          } catch {
            return {
              uid,
              displayName: uid === user?.uid ? 'Você' : 'Morador',
              email: '',
              isOwner: uid === ownerUid,
            };
          }
        }),
      );

      setHousehold({
        id: snapshot.id,
        name: data.name,
        members: membersList,
        ownerUid,
        invites: invitesList,
        memberProfiles,
      });
      setIsLoading(false);
    });
    return unsubscribe;
  }, [householdId, user]);

  async function createHousehold(name: string) {
    if (!user) return;
    const code = generateInviteCode();
    await setDoc(doc(db, 'households', code), {
      name,
      members: [user.uid],
      ownerUid: user.uid,
      invites: [],
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

  async function inviteByEmail(email: string) {
    if (!household || !user) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Insira um e-mail válido.');
    }

    // Verifica se já é membro
    const alreadyMember = household.memberProfiles?.some(
      (m) => m.email.toLowerCase() === cleanEmail,
    );
    if (alreadyMember) {
      throw new Error('Esta pessoa já faz parte da casa.');
    }

    const newInvite: HouseholdInvite = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      invitedBy: user.displayName || user.email || 'Morador',
      createdAt: new Date().toISOString(),
    };

    const currentInvites = household.invites ?? [];
    await updateDoc(doc(db, 'households', household.id), {
      invites: [...currentInvites.filter((i) => i.email !== cleanEmail), newInvite],
    });

    // Enviar e-mail de convite de verdade via API Resend
    try {
      await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          householdName: household.name,
          inviterName: user.displayName || user.email || 'Morador',
          inviteCode: household.id,
        }),
      });
    } catch (err) {
      console.warn('Aviso: falha de rede ao disparar o e-mail:', err);
    }
  }

  async function cancelInvite(inviteId: string) {
    if (!household) return;
    const currentInvites = household.invites ?? [];
    await updateDoc(doc(db, 'households', household.id), {
      invites: currentInvites.filter((i) => i.id !== inviteId),
    });
  }

  async function removeMember(memberUid: string) {
    if (!household) return;
    await updateDoc(doc(db, 'households', household.id), {
      members: arrayRemove(memberUid),
    });
    try {
      await updateDoc(doc(db, 'users', memberUid), {
        householdId: null,
      });
    } catch {
      // caso o usuário não tenha permissão de alterar doc de outro usuário nas rules
    }
  }

  async function leaveHousehold() {
    if (!household || !user) return;
    await updateDoc(doc(db, 'households', household.id), {
      members: arrayRemove(user.uid),
    });
    await setDoc(doc(db, 'users', user.uid), { householdId: null }, { merge: true });
  }

  async function renameHousehold(name: string) {
    if (!household) return;
    const cleanName = name.trim();
    if (!cleanName) return;
    await updateDoc(doc(db, 'households', household.id), {
      name: cleanName,
    });
  }

  return (
    <HouseholdContext.Provider
      value={{
        household,
        isLoading,
        createHousehold,
        joinHousehold,
        inviteByEmail,
        cancelInvite,
        removeMember,
        leaveHousehold,
        renameHousehold,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold(): HouseholdContextValue {
  const context = useContext(HouseholdContext);
  if (!context) throw new Error('useHousehold must be used within HouseholdProvider');
  return context;
}

