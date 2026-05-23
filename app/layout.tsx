import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trololo Builds - Albion Style",
  description: "Planeje e compartilhe seus loadouts e builds de Albion Online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#110e0c] text-[#d5c3a6] font-sans flex flex-col antialiased selection:bg-[#e6a817]/30 selection:text-white">
        
        {/* Navbar Estilo Albion (Madeira escura / Detalhes em Bronze) */}
        <header className="border-b-2 border-[#2d2319] bg-[#1a1410] shadow-2xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            <div className="flex items-center gap-10">
              {/* Logo estilizado */}
              <Link href="/" className="group flex flex-col">
                <span className="text-2xl font-black tracking-widest text-[#e6a817] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-[#ffca4b] transition-colors">
                  TROLOLO BUILDS
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#846f5b] font-bold -mt-1">
                  Albion Tools
                </span>
              </Link>
              // Dentro do nav, adicione:
<Link href="/builds" className="text-[#a08871] hover:text-[#e6a817] transition-colors">
  Builds
</Link>
              
              <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider">
                <Link href="/" className="text-[#e6a817] border-b-2 border-[#e6a817] pb-1">Painel Inicial</Link>
                <Link href="/create" className="text-[#a08871] hover:text-[#e6a817] transition-colors">Criar Build</Link>
                <Link href="#" className="text-[#a08871] hover:text-[#e6a817] transition-colors">Calculadora de Fama</Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <input 
                  type="text" 
                  placeholder="Buscar equipamentos, itens..." 
                  className="bg-[#0f0b09] border border-[#3e3124] rounded-sm pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-[#e6a817] text-[#e1d5c1] placeholder-[#5c4937] w-64 transition-all"
                />
                <span className="absolute right-3 top-2.5 opacity-40">🔍</span>
              </div>
              
              <Link href="/create" className="relative group overflow-hidden bg-[#801c1c] border-2 border-[#a83232] text-[#fcd7d7] text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-sm shadow-[0_4px_10px_rgba(0,0,0,0.5)] active:translate-y-0.5 transition-all">
                <span className="absolute inset-0 bg-[#b83232] opacity-0 group-hover:opacity-20 transition-opacity" />
                Forjar Build
              </Link>
            </div>
            
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#1a1410] bg-[#0c0908] py-8 text-center text-xs text-[#5c4937] tracking-wide">
          <p>© {new Date().getFullYear()} Trololo Builds. Não afiliado ao Sandbox Interactive GmbH.</p>
        </footer>
        
      </body>
    </html>
  );
}
