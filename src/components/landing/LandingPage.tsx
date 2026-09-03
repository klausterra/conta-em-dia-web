import { useState, useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { Footer } from '@/components/landing/Footer';
import { LoginScreen } from '@/components/LoginScreen';
import { MailCheck } from 'lucide-react';

export function LandingPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [inviteCodeBanner, setInviteCodeBanner] = useState<string | null>(null);

  useEffect(() => {
    try {
      const code = localStorage.getItem('conta_em_dia_invite_code');
      if (code) {
        setInviteCodeBanner(code);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#08100d] text-[#f1f5f3] selection:bg-emerald-500 selection:text-white">
      {/* Banner de convite caso tenha chegado por link de convite */}
      {inviteCodeBanner && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 px-4 py-2.5 text-center text-xs font-bold text-emerald-200 border-b border-emerald-800/60 flex items-center justify-center gap-2">
          <MailCheck size={16} className="text-emerald-400" />
          <span>Você recebeu um convite para entrar em uma casa (Código: <strong>{inviteCodeBanner}</strong>)!</span>
          <button
            type="button"
            onClick={() => setLoginModalOpen(true)}
            className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-extrabold text-black hover:bg-emerald-400 transition ml-2"
          >
            Entrar Agora
          </button>
        </div>
      )}

      {/* Barra de navegação */}
      <Navbar onOpenLogin={() => setLoginModalOpen(true)} />

      {/* Conteúdo Principal da Landing Page */}
      <main>
        <HeroSection onOpenLogin={() => setLoginModalOpen(true)} />
        <FeaturesSection />
        <ComparisonSection />
        <PricingSection onOpenLogin={() => setLoginModalOpen(true)} />
        <FaqSection />
      </main>

      {/* Rodapé */}
      <Footer />

      {/* Modal de Login */}
      {loginModalOpen && (
        <LoginScreen isModal onClose={() => setLoginModalOpen(false)} />
      )}
    </div>
  );
}
