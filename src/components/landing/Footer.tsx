export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1f372c] bg-[#070e0b] py-12 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <img
              src="/app-logo.png"
              alt="Conta em Dia Logo"
              className="size-9 rounded-xl object-cover"
            />
            <div>
              <p className="text-sm font-black text-white">Conta em Dia</p>
              <p className="text-[10px] text-zinc-500">Casa leve, cabeça leve.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-zinc-400">
            <a href="#recursos" className="hover:text-emerald-400 transition">
              Recursos
            </a>
            <a href="#como-funciona" className="hover:text-emerald-400 transition">
              Como Funciona
            </a>
            <a href="#planos" className="hover:text-emerald-400 transition">
              Planos
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition">
              FAQ
            </a>
          </div>

          <p className="text-xs text-zinc-500">
            © {currentYear} Conta em Dia SaaS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
