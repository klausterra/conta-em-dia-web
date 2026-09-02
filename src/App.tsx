import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LoginScreen } from '@/components/LoginScreen';
import { Dashboard } from '@/components/Dashboard';

function Gate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <main className="grid min-h-screen place-items-center bg-[#f6f7f4] text-[#6c7f77]">Carregando…</main>;
  }

  return user ? <Dashboard /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
