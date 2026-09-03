import { useState } from 'react';
import { Menu, X, Sparkles, ArrowRight } from 'lucide-react';

type NavbarProps = {
  onOpenLogin: () => void;
};

export function Navbar({ onOpenLogin }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1f372c]/80 bg-[#08100d]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <img
            src="/app-logo.png"
            alt="Conta em Dia Logo"
            className="size-10 rounded-xl object-cover shadow-lg shadow-emerald-950 transition group-hover:scale-105"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white sm:text-lg">Conta em Dia</span>
              <span className="rounded-full border border-emerald-800/60 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                PRO
              </span>
            </div>
            <p className="hidden text-[10px] text-zinc-400 sm:block">Gestão de contas descomplicada</p>
          </div>
        </a>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-8 md:flex text-xs font-bold text-zinc-300">
          <a href="#recursos" className="transition hover:text-emerald-400">
            Recursos
          </a>
          <a href="#como-funciona" className="transition hover:text-emerald-400">
            Como Funciona
          </a>
          <a href="#comparativo" className="transition hover:text-emerald-400">
            Por que nós?
          </a>
          <a href="#planos" className="transition hover:text-emerald-400">
            Planos
          </a>
          <a href="#faq" className="transition hover:text-emerald-400">
            Dúvidas
          </a>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 sm:flex">
          <button
            type="button"
            onClick={onOpenLogin}
            className="rounded-xl border border-[#244535] bg-[#122019] px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-[#192f25] hover:text-white"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
          >
            <Sparkles size={14} />
            <span>Começar Grátis</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menu"
          className="rounded-lg p-2 text-zinc-400 hover:text-white md:hidden"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#1f372c] bg-[#0c1612] px-4 py-6 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-bold text-zinc-300">
            <a
              href="#recursos"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-zinc-200 hover:text-emerald-400"
            >
              Recursos
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-zinc-200 hover:text-emerald-400"
            >
              Como Funciona
            </a>
            <a
              href="#comparativo"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-zinc-200 hover:text-emerald-400"
            >
              Por que nós?
            </a>
            <a
              href="#planos"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-zinc-200 hover:text-emerald-400"
            >
              Planos
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-zinc-200 hover:text-emerald-400"
            >
              Dúvidas
            </a>
          </nav>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full rounded-xl border border-[#244535] bg-[#122019] py-3 text-center text-xs font-bold text-zinc-200"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-center text-xs font-bold text-white shadow-lg shadow-emerald-950/50"
            >
              <span>Começar Grátis</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
