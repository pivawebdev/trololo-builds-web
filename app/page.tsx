"use client";

import { createClient } from '@/lib/supabase/client';   // crie esse arquivo se não tiver

export default function HomePage() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error(error);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ... seu conteúdo atual ... */}

      <div className="text-center mt-12">
        <button
          onClick={handleLogin}
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-8 py-4 rounded-2xl text-lg flex items-center gap-3 mx-auto transition"
        >
          🔑 Entrar com Discord
        </button>
        <p className="text-zinc-500 mt-3 text-sm">Apenas membros da guilda terão acesso completo</p>
      </div>
    </div>
  );
}
