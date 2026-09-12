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
  deleteField,
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
import type { User } from 'firebase/auth';

type MemberProfileMap = Record<string, Omit<HouseholdMember, 'uid' | 'isOwner'>>;

function profileFromUser(user: User): Omit<HouseholdMember, 'uid' | 'isOwner'> {
  const profile: Omit<HouseholdMember, 'uid' | 'isOwner'> = {
    displayName: user.displayName?.trim() || user.email?.split('@')[0] || 'Morador',
    email: (user.email || '').trim().toLowerCase(),
  };
  // Firestore rejeita `undefined` — só inclui photoURL se existir
  if (user.photoURL) {
    profile.photoURL = user.photoURL;
  }
  return profile;
}

function buildMemberProfiles(
  membersList: string[],
  ownerUid: string,
  stored: MemberProfileMap | undefined,
  currentUser: User | null | undefined,
): HouseholdMember[] {
  return membersList.map((uid) => {
    const fromHouse = stored?.[uid];
    const isSelf = uid === currentUser?.uid;
    return {
      uid,
      displayName:
        fromHouse?.displayName ||
        (isSelf ? currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Você' : null) ||
        'Morador',
      email: fromHouse?.email || (isSelf ? currentUser?.email || '' : ''),
      photoURL: fromHouse?.photoURL || (isSelf ? currentUser?.photoURL || undefined : undefined),
      isOwner: uid === ownerUid,
    };
  });
}

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
  updateMemberName: (memberUid: string, displayName: string) => Promise<void>;
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
      const storedProfiles = (data.memberProfiles ?? {}) as MemberProfileMap;

      // Perfis ficam na própria casa (denormalizados) — evita ler users/{outroUid}
      // que as regras do Firestore costumam bloquear.
      let memberProfiles = buildMemberProfiles(membersList, ownerUid, storedProfiles, user);

      // Garante que o usuário atual esteja gravado na casa com nome/e-mail atualizados
      if (user && membersList.includes(user.uid)) {
        const mine = profileFromUser(user);
        const existing = storedProfiles[user.uid];
        const needsSync =
          !existing ||
          existing.displayName !== mine.displayName ||
          existing.email !== mine.email ||
          (existing.photoURL || '') !== (mine.photoURL || '');

        if (needsSync) {
          try {
            await updateDoc(doc(db, 'households', householdId), {
              [`memberProfiles.${user.uid}`]: mine,
            });
          } catch (err) {
            console.error('Falha ao sincronizar perfil na casa:', err);
          }
          memberProfiles = buildMemberProfiles(
            membersList,
            ownerUid,
            { ...storedProfiles, [user.uid]: mine },
            user,
          );
        }
      }

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
    const profile = profileFromUser(user);
    await setDoc(doc(db, 'households', code), {
      name,
      members: [user.uid],
      ownerUid: user.uid,
      invites: [],
      memberProfiles: { [user.uid]: profile },
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
    const profile = profileFromUser(user);
    const data = householdSnapshot.data();
    const invites = ((data?.invites as HouseholdInvite[]) ?? []).filter(
      (invite) => invite.email.toLowerCase() !== (user.email || '').toLowerCase(),
    );

    // Join em 2 passos: regras só permitem append de `members` para quem ainda não é membro.
    // Depois, já sendo membro, grava o perfil (nome/e-mail) na casa.
    const alreadyMember = ((data?.members as string[]) ?? []).includes(user.uid);
    if (!alreadyMember) {
      await updateDoc(doc(db, 'households', normalizedCode), {
        members: arrayUnion(user.uid),
      });
    }
    await updateDoc(doc(db, 'households', normalizedCode), {
      [`memberProfiles.${user.uid}`]: profile,
      invites,
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
      [`memberProfiles.${memberUid}`]: deleteField(),
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

  async function updateMemberName(memberUid: string, displayName: string) {
    if (!household || !user) return;
    const clean = displayName.trim();
    if (!clean) return;
    const existing = household.memberProfiles?.find((m) => m.uid === memberUid);
    await updateDoc(doc(db, 'households', household.id), {
      [`memberProfiles.${memberUid}`]: {
        displayName: clean,
        email: existing?.email || '',
        ...(existing?.photoURL ? { photoURL: existing.photoURL } : {}),
      },
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
        updateMemberName,
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

