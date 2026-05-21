'use client';

import Link from 'next/link';
import { Sword, Users, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="mb-16">
          <h1 className="text-7xl font-bold mb-6">
            🛠️ <span className="text-yellow-400">Trololo Builds</span>
          </h1>
          <p className="text-2xl text-zinc-400 max-w-2xl mx-auto">
            O melhor criador de builds de Albion Online
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-zinc-900 p-10 rounded-3xl">
            <Sword className="mx-auto mb-6 text-6xl text-yellow-400" />
            <h3 className="text-2xl font-bold mb-3">Monte sua Build</h3>
            <p className="text-zinc-400">Equipamentos, habilidades e muito mais</p>
          </div>
          <div className="bg-zinc-900 p-10 rounded-3xl">
            <Trophy className="mx-auto mb-6 text-6xl text-yellow-400" />
            <h3 className="text-2xl font-bold mb-3">Salve no Banco</h3>
            <p className="text-zinc-400">Todas builds ficam salvas no Supabase</p>
          </div>
          <div className="bg-zinc-900 p-10 rounded-3xl">
            <Users className="mx-auto mb-6 text-6xl text-yellow-400" />
            <h3 className="text-2xl font-bold mb-3">Compartilhe</h3>
            <p className="text-zinc-400">Em breve builds públicas</p>
          </div>
        </div>

        <Link
          href="/create"
          className="inline-block bg-green-600 hover:bg-green-700 px-20 py-7 rounded-2xl text-3xl font-bold transition transform hover:scale-105"
        >
          CRIAR MINHA BUILD →
        </Link>

        <p className="mt-12 text-zinc-500">Deploy no Vercel • Versão Beta</p>
      </div>
    </div>
  );
}
