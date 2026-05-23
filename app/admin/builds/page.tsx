'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Edit3, Trash2, Plus, Search } from 'lucide-react';

interface Build {
  id: number;
  build_name: string;
  guild_id: string;
  creator_id: string;
  category_id: number | null;
  created_at: string;
  build_categories?: {
    name: string;
    emoji: string;
  };
}

export default function AdminBuildsPage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadBuilds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/builds?limit=100');
      const response = await res.json();
      setBuilds(response.data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuilds();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deletar build "${name}"?`)) return;
    
    try {
      const res = await fetch(`/api/builds?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadBuilds();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const filteredBuilds = builds.filter(b =>
    b.build_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.creator_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold border-b-2 border-amber-700 pb-2">
            ⚔️ Gerenciar Builds
          </h1>
          <Link
            href="/create"
            className="bg-amber-700 hover:bg-amber-600 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Nova Build
          </Link>
        </div>

        {/* Busca */}
        <div className="bg-[#2c2118] p-4 rounded-lg border border-amber-800/40 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-amber-500" size={18} />
            <input
              type="text"
              placeholder="Buscar builds por nome ou criador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3d2c1f] border border-amber-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-[#2c2118] rounded-lg border border-amber-800/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#3d2c1f] text-amber-300">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Criador</th>
                  <th className="p-3 text-left">Categoria</th>
                  <th className="p-3 text-left">Data</th>
                  <th className="p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center p-8">Carregando...</td></tr>
                ) : filteredBuilds.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-8">Nenhuma build encontrada</td></tr>
                ) : (
                  filteredBuilds.map((build) => (
                    <tr key={build.id} className="border-b border-amber-800/20 hover:bg-[#3d2c1f]/50">
                      <td className="p-3">{build.id}</td>
                      <td className="p-3 font-medium">{build.build_name}</td>
                      <td className="p-3">{build.creator_id}</td>
                      <td className="p-3">
                        {build.build_categories ? `${build.build_categories.emoji} ${build.build_categories.name}` : '-'}
                      </td>
                      <td className="p-3">{new Date(build.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3 space-x-2">
                        <Link
                          href={`/builds/${build.id}`}
                          className="inline-block bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-xs"
                        >
                          <Eye size={14} className="inline" /> Ver
                        </Link>
                        <Link
                          href={`/create?edit=${build.id}`}
                          className="inline-block bg-amber-700 hover:bg-amber-600 px-3 py-1 rounded text-xs"
                        >
                          <Edit3 size={14} className="inline" /> Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(build.id, build.build_name)}
                          className="bg-red-800 hover:bg-red-700 px-3 py-1 rounded text-xs"
                        >
                          <Trash2 size={14} className="inline" /> Deletar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}