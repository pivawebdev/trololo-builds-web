"use client";

import Link from "next/link";
import { Sword, Users, Trophy, List, Database, Shield, Sparkles } from "lucide-react";
import { getSupabaseClient } from '@/lib/supabaseClient';   // ← Adicionado

export default function HomePage() {
  const supabase = getSupabaseClient();

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
      {/* ... todo seu conteúdo atual (cards) ... */}

      {/* Botão de Login */}
      <div className="text-center mt-16 pb-20">
        <button
          onClick={handleLogin}
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-10 py-5 rounded-2xl text-xl flex items-center gap-4 mx-auto transition-all shadow-lg"
        >
          🔑 Entrar com Discord
        </button>
        <p className="text-zinc-500 mt-4">Acesso exclusivo para membros da guilda</p>
      </div>
    </div>
  );
}
