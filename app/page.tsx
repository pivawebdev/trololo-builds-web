"use client";

import Link from "next/link";
import { Sword, Users, Trophy, List } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-7xl font-bold mb-6">
          🛠️ <span className="text-yellow-400">Trololo Builds</span>
        </h1>
        <p className="text-2xl text-zinc-400 mb-16">
          Crie, salve e gerencie suas builds de Albion Online
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link
            href="/create"
            className="bg-zinc-900 p-8 rounded-3xl hover:scale-105 transition group"
          >
            <Sword className="mx-auto mb-6 text-5xl text-yellow-400 group-hover:rotate-12 transition" />
            <h3 className="text-2xl font-bold mb-2">Criar Build</h3>
            <p className="text-zinc-400">Monte sua build completa</p>
          </Link>

          <Link
            href="/itens"
            className="bg-zinc-900 p-8 rounded-3xl hover:scale-105 transition group"
          >
            <List className="mx-auto mb-6 text-5xl text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2">Lista de Itens</h3>
            <p className="text-zinc-400">Ver todos os itens do banco</p>
          </Link>

          <div className="bg-zinc-900 p-8 rounded-3xl opacity-70">
            <Users className="mx-auto mb-6 text-5xl text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2">Minhas Builds</h3>
            <p className="text-zinc-400">Em breve</p>
          </div>

          <div className="bg-zinc-900 p-8 rounded-3xl opacity-70">
            <Trophy className="mx-auto mb-6 text-5xl text-yellow-400" />
            <h3 className="text-2xl font-bold mb-2">Builds Públicas</h3>
            <p className="text-zinc-400">Em breve</p>
          </div>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-2xl transition text-lg"
        >
          COMEÇAR AGORA →
        </Link>
      </div>
    </div>
  );
}
