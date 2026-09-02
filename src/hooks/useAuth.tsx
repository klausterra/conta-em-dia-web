import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  clearError: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    void getRedirectResult(auth)
      .catch((err: unknown) => {
        const firebaseErr = err as { code?: string; message?: string };
        if (firebaseErr.code && firebaseErr.code !== 'auth/popup-closed-by-user') {
          setAuthError(firebaseErr.message ?? 'Falha ao concluir login.');
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
      if (nextUser) {
        void setDoc(
          doc(db, 'users', nextUser.uid),
          {
            displayName: nextUser.displayName ?? nextUser.email?.split('@')[0] ?? 'Morador',
            email: nextUser.email ?? '',
            photoURL: nextUser.photoURL ?? '',
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      }
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch {
          setAuthError('O bloqueador de pop-ups impediu o login. Permita pop-ups no seu navegador.');
        }
      } else if (firebaseErr.code === 'auth/popup-closed-by-user') {
        setAuthError(null);
      } else if (firebaseErr.code === 'auth/unauthorized-domain') {
        setAuthError('Este domínio ainda não foi autorizado no Firebase Authentication.');
      } else {
        setAuthError(firebaseErr.message ?? 'Não foi possível conectar com o Google. Tente novamente.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  function clearError() {
    setAuthError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticating,
        authError,
        clearError,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

