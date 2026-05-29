'use client';

import { createClient } from '@/lib/supabaseClient';   // ← Import corrigido

export default function LoginButton() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login com Discord');
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-[#5865F2] hover:bg-[#4752C4] px-8 py-4 rounded-xl text-white font-semibold flex items-center gap-3 mx-auto transition-all"
    >
      🔑 Entrar com Discord
    </button>
  );
}
