'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, Calendar, Filter, X, Users } from 'lucide-react';

interface Build {
  id: number;
  build_name: string;
  guild_id: string;
  creator_id: string;
  weapon_item: string | null;
  head_item: string | null;
  armor_item: string | null;
  shoes_item: string | null;
  cape_item: string | null;
  category_id: number | null;
  created_at: string;
  build_categories?: {
    name: string;
    emoji: string;
    description: string;
  };
}

export default function BuildsPage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Carregar categorias
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  // Carregar builds
  const loadBuilds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const res = await fetch(`/api/builds?${params.toString()}`);
      const response = await res.json();
      
      setBuilds(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Erro ao carregar builds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuilds();
  }, [currentPage, searchTerm, selectedCategory]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const getItemIcon = (itemId: string | null) => {
    if (!itemId) return null;
    return `https://render.albiononline.com/v1/item/${itemId}.png?size=50`;
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold border-b-2 border-amber-700 pb-2 mb-4 md:mb-0">
            ⚔️ Builds da Guilda
          </h1>
          <Link
            href="/create"
            className="bg-amber-700 hover:bg-amber-600 text-[#1a120b] font-bold px-6 py-3 rounded-xl transition flex items-center gap-2"
          >
            ✨ Criar Build
          </Link>
        </div>

        {/* Barra de busca */}
        <div className="bg-[#2c2118] p-4 rounded-lg border border-amber-800/40 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-amber-500" size={20} />
              <input
                type="text"
                placeholder="Buscar builds por nome..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#3d2c1f] border border-amber-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-[#3d2c1f] border border-amber-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-800/30 transition"
            >
              <Filter size={18} />
              Filtros
            </button>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-amber-800/40">
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-[#3d2c1f] border border-amber-700 rounded-lg px-4 py-2"
                >
                  <option value="">Todas categorias</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('');
                      setCurrentPage(1);
                    }}
                    className="text-amber-500 hover:text-amber-400 flex items-center gap-1"
                  >
                    <X size={16} /> Limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Grid de Builds */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-20 bg-[#2c2118] rounded-lg border border-amber-800/40">
            <p className="text-amber-500/60">Nenhuma build encontrada 😕</p>
            <Link href="/create" className="text-amber-500 hover:text-amber-400 mt-2 inline-block">
              Seja o primeiro a criar uma build!
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {builds.map((build) => (
                <Link
                  key={build.id}
                  href={`/builds/${build.id}`}
                  className="bg-[#2c2118] border border-amber-800/40 rounded-xl overflow-hidden hover:border-amber-600 transition-all hover:scale-105 group"
                >
                  {/* Preview dos itens */}
                  <div className="bg-[#e9d9c4] aspect-square relative">
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-2 p-4">
                      {build.weapon_item && (
                        <div className="bg-[#2c2118]/80 rounded-lg flex items-center justify-center">
                          <img src={getItemIcon(build.weapon_item)} alt="Arma" className="w-12 h-12 object-contain" />
                        </div>
                      )}
                      {build.head_item && (
                        <div className="bg-[#2c2118]/80 rounded-lg flex items-center justify-center">
                          <img src={getItemIcon(build.head_item)} alt="Cabeça" className="w-12 h-12 object-contain" />
                        </div>
                      )}
                      {build.armor_item && (
                        <div className="bg-[#2c2118]/80 rounded-lg flex items-center justify-center">
                          <img src={getItemIcon(build.armor_item)} alt="Peito" className="w-12 h-12 object-contain" />
                        </div>
                      )}
                      {build.shoes_item && (
                        <div className="bg-[#2c2118]/80 rounded-lg flex items-center justify-center">
                          <img src={getItemIcon(build.shoes_item)} alt="Botas" className="w-12 h-12 object-contain" />
                        </div>
                      )}
                      {build.cape_item && (
                        <div className="bg-[#2c2118]/80 rounded-lg flex items-center justify-center">
                          <img src={getItemIcon(build.cape_item)} alt="Capa" className="w-12 h-12 object-contain" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition">
                      {build.build_name}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-amber-500/40">
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {build.creator_id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {formatDate(build.created_at)}
                      </span>
                    </div>
                    {build.build_categories && (
                      <div className="mt-2 text-xs text-amber-500">
                        {build.build_categories.emoji} {build.build_categories.name}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#3d2c1f] rounded-lg disabled:opacity-50 hover:bg-amber-700 transition"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 bg-amber-700/30 rounded-lg">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#3d2c1f] rounded-lg disabled:opacity-50 hover:bg-amber-700 transition"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}