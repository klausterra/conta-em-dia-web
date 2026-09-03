import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { HouseholdProvider, useHousehold } from '@/hooks/useHousehold';
import { LoginScreen } from '@/components/LoginScreen';
import { HouseholdSetup } from '@/components/HouseholdSetup';
import { Dashboard } from '@/components/Dashboard';

if (typeof window !== 'undefined') {
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    try {
      localStorage.setItem('conta_em_dia_invite_code', code.trim().toUpperCase());
    } catch {
      // ignore
    }
  }
}

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#08100d] text-emerald-400 font-bold text-sm">
      Carregando…
    </main>
  );
}

function HouseholdGate() {
  const { household, isLoading } = useHousehold();

  if (isLoading) return <LoadingScreen />;
  return household ? <Dashboard /> : <HouseholdSetup />;
}

function Gate() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;

  return (
    <HouseholdProvider>
      <HouseholdGate />
    </HouseholdProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
