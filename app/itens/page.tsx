'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Filter } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ItensPage() {
  const [itens, setItens] = useState<any[]>([]);
  const [filteredItens, setFilteredItens] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [slotFilter, setSlotFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  const slots = ['head', 'chest', 'shoes', 'mainhand', 'offhand', 'cape', 'bag', 'mount'];

  useEffect(() => {
    carregarItens();
  }, []);

  const carregarItens = async () => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('tier', { ascending: false })
      .order('name_pt');

    if (data) {
      setItens(data);
      setFilteredItens(data);
    }
  };

  // Filtro em tempo real
  useEffect(() => {
    let result = [...itens];

    if (search) {
      result = result.filter(item =>
        item.name_pt.toLowerCase().includes(search.toLowerCase()) ||
        item.unique_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (slotFilter) {
      result = result.filter(item => item.slot_type === slotFilter);
    }

    if (tierFilter) {
      result = result.filter(item => item.tier === parseInt(tierFilter));
    }

    setFilteredItens(result);
  }, [search, slotFilter, tierFilter, itens]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">📦 Todos os Itens - Albion Online</h1>

        {/* Filtros */}
        <div className="bg-zinc-900 p-6 rounded-2xl mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar item (ex: cajado enraizado, elmo...)"
                className="w-full bg-zinc-800 pl-12 py-4 rounded-xl text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <select
            className="bg-zinc-800 p-4 rounded-xl"
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
          >
            <option value="">Todos os Slots</option>
            {slots.map(s => (
              <option key={s} value={s}>
                {s === 'mainhand' ? 'Arma' : 
                 s === 'offhand' ? 'Off-hand' : 
                 s === 'chest' ? 'Peito' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="bg-zinc-800 p-4 rounded-xl"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="">Todos os Tiers</option>
            {[8,7,6,5,4,3].map(t => (
              <option key={t} value={t}>Tier {t}</option>
            ))}
          </select>

          <button
            onClick={() => { setSearch(''); setSlotFilter(''); setTierFilter(''); }}
            className="bg-zinc-800 px-6 py-4 rounded-xl hover:bg-zinc-700"
          >
            Limpar
          </button>
        </div>

        {/* Grid de Itens */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItens.map((item) => (
            <div
              key={item.unique_name}
              className="bg-zinc-900 rounded-2xl p-4 hover:scale-105 transition-all border border-zinc-800 hover:border-yellow-500 group"
            >
              <div className="flex justify-center mb-4">
                <img
                  src={`https://render.albiononline.com/v1/item/${item.unique_name}.png?size=90`}
                  alt={item.name_pt}
                  className="w-20 h-20 object-contain drop-shadow-lg group-hover:scale-110 transition"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-item.png'; // opcional
                  }}
                />
              </div>

              <h3 className="text-center font-medium text-sm leading-tight mb-1">
                {item.name_pt}
              </h3>
              <p className="text-center text-xs text-zinc-500">
                {item.unique_name}
              </p>
              {item.tier && (
                <p className="text-center text-yellow-400 text-xs mt-1">T{item.tier}</p>
              )}
            </div>
          ))}
        </div>

        {filteredItens.length === 0 && (
          <p className="text-center text-zinc-400 text-xl mt-20">
            Nenhum item encontrado 😕
          </p>
        )}

        <p className="text-center text-zinc-500 mt-12">
          Total de itens carregados: {filteredItens.length} / {itens.length}
        </p>
      </div>
    </div>
  );
}
