'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Edit3, Save, Eye, X, Search, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const slotsConfig = [
  { id: 'head', label: 'Cabeça', emoji: '🪖' },
  { id: 'armor', label: 'Peito', emoji: '🛡️' },
  { id: 'shoes', label: 'Botas', emoji: '🥾' },
  { id: 'weapon', label: 'Arma', emoji: '⚔️' },
  { id: 'offhand', label: 'Off-hand', emoji: '🛡️' },
  { id: 'cape', label: 'Capa', emoji: '🧥' },
  { id: 'bag', label: 'Bolsa', emoji: '🎒' },
  { id: 'mount', label: 'Montaria', emoji: '🐎' },
];

const slotPositions: Record<string, { top: string; left: string }> = {
  head: { top: '15%', left: '42%' },
  cape: { top: '28%', left: '15%' },
  bag: { top: '28%', left: '68%' },
  weapon: { top: '48%', left: '15%' },
  armor: { top: '48%', left: '42%' },
  offhand: { top: '48%', left: '68%' },
  shoes: { top: '70%', left: '42%' },
  mount: { top: '85%', left: '42%' },
};

export default function CreateBuildPage() {
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [build, setBuild] = useState({
    title: "Minha Build Incrível",
    category_id: null as number | null,
    items: {} as Record<string, string>,
  });

  const [itemsBySlot, setItemsBySlot] = useState<Record<string, any[]>>({});
  const [loadingSlots, setLoadingSlots] = useState<Record<string, boolean>>({});
  const [searchTermBySlot, setSearchTermBySlot] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<any[]>([]);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Carregar categorias
  useEffect(() => {
    supabase.from('build_categories').select('*').order('sort_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  // Carregar itens de um slot específico (SEM LIMITE)
  const loadSlotItems = async (slotId: string) => {
    if (itemsBySlot[slotId]?.length) return;
    
    setLoadingSlots(prev => ({ ...prev, [slotId]: true }));
    
    try {
      // Buscar TODOS os itens do slot, sem limite
      const { data, error } = await supabase
        .from('items')
        .select('unique_name, name_pt, tier, enchantment')
        .eq('slot_type', slotId)
        .order('tier', { ascending: false })
        .order('name_pt', { ascending: true });

      if (error) {
        console.error(`Erro ao carregar ${slotId}:`, error);
        return;
      }

      console.log(`📦 ${slotId}: ${data?.length || 0} itens carregados`);
      setItemsBySlot(prev => ({ ...prev, [slotId]: data || [] }));
    } catch (error) {
      console.error(`Erro ao carregar ${slotId}:`, error);
    } finally {
      setLoadingSlots(prev => ({ ...prev, [slotId]: false }));
    }
  };

  // Carregar todos os slots antecipadamente
  const loadAllSlots = async () => {
    setLoading(true);
    try {
      await Promise.all(slotsConfig.map(slot => loadSlotItems(slot.id)));
    } catch (error) {
      console.error('Erro ao carregar slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSlots();
  }, []);

  const handleSearch = (slotId: string, value: string) => {
    setSearchTermBySlot(prev => ({ ...prev, [slotId]: value }));
  };

  const updateItem = (slotId: string, value: string) => {
    setBuild(prev => ({
      ...prev,
      items: { ...prev.items, [slotId]: value }
    }));
    setSearchTermBySlot(prev => ({ ...prev, [slotId]: '' }));
  };

  const removeItem = (slotId: string) => {
    setBuild(prev => {
      const newItems = { ...prev.items };
      delete newItems[slotId];
      return { ...prev, items: newItems };
    });
  };

  const getItemName = (slotId: string, uniqueName: string) => {
    const item = itemsBySlot[slotId]?.find(i => i.unique_name === uniqueName);
    return item?.name_pt || uniqueName;
  };

  const saveBuild = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!build.title.trim()) {
      alert('Por favor, dê um título para sua build');
      return;
    }

    setSaving(true);
    try {
      // TODO: Salvar no banco
      alert('Build salva com sucesso! (em desenvolvimento)');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar build');
    } finally {
      setSaving(false);
    }
  };

  // Filtrar itens baseado no termo de busca
  const getFilteredItems = (slotId: string) => {
    const items = itemsBySlot[slotId] || [];
    const searchTerm = searchTermBySlot[slotId] || '';
    
    if (!searchTerm.trim()) return items;
    
    return items.filter(item =>
      item.name_pt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unique_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading && Object.keys(itemsBySlot).length === 0) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-amber-600 mx-auto mb-4" />
          <p className="text-amber-800">Carregando itens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-10 text-amber-950">🛠️ Criador de Builds</h1>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* PREVIEW COM IMAGENS DO ALBION */}
          <div className="xl:col-span-5">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 sticky top-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-950 truncate">{build.title}</h2>
                <button
                  onClick={() => {/* Editar título */}}
                  className="text-amber-600 hover:text-amber-800 transition"
                >
                  <Edit3 size={24} />
                </button>
              </div>

              <div className="relative bg-[#e9d9c4] aspect-square rounded-2xl overflow-hidden border-4 border-amber-800 shadow-inner">
                {Object.entries(build.items).map(([slot, itemId]) => {
                  if (!itemId) return null;
                  const pos = slotPositions[slot];
                  if (!pos) return null;

                  return (
                    <div key={slot} className="absolute group" style={pos}>
                      <img
                        src={`https://render.albiononline.com/v1/item/${itemId}.png?size=120&quality=4`}
                        alt={slot}
                        className="w-[120px] h-[120px] object-contain drop-shadow-lg"
                      />
                      <button
                        onClick={() => removeItem(slot)}
                        className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => alert("Em breve: download da imagem")}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition"
              >
                📸 Baixar Preview
              </button>
            </div>
          </div>

          {/* EDITOR */}
          <div className="xl:col-span-7 space-y-6">
            {/* Nome + Categoria */}
            <div className="bg-white border border-zinc-200 p-8 rounded-3xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Build</label>
                  <input
                    type="text"
                    value={build.title}
                    onChange={(e) => setBuild(p => ({ ...p, title: e.target.value }))}
                    className="w-full border border-zinc-300 p-4 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Ex: PvP Solo Arcano"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select
                    className="w-full border border-zinc-300 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onChange={(e) => setBuild(p => ({ ...p, category_id: parseInt(e.target.value) || null }))}
                    value={build.category_id || ''}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Slots com busca - TODOS OS ITENS AGORA */}
            {slotsConfig.map(slot => {
              const filteredItems = getFilteredItems(slot.id);
              const isSearching = searchTermBySlot[slot.id]?.length > 0;
              const isLoading = loadingSlots[slot.id];
              
              return (
                <div key={slot.id} className="bg-white border border-zinc-200 p-8 rounded-3xl">
                  <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                    {slot.emoji} {slot.label}
                  </h3>

                  <div className="relative">
                    <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder={`Buscar ${slot.label.toLowerCase()}...`}
                      className="w-full border border-zinc-300 pl-12 p-4 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={searchTermBySlot[slot.id] || ''}
                      onChange={(e) => handleSearch(slot.id, e.target.value)}
                      onFocus={() => !itemsBySlot[slot.id] && loadSlotItems(slot.id)}
                    />
                  </div>

                  {/* Lista de sugestões */}
                  {isLoading && (
                    <div className="mt-3 flex justify-center py-8">
                      <Loader2 className="animate-spin text-amber-600" size={32} />
                    </div>
                  )}

                  {!isLoading && (isSearching || itemsBySlot[slot.id]) && (
                    <div className="mt-3 max-h-72 overflow-auto border border-zinc-200 rounded-2xl bg-white">
                      {filteredItems.length === 0 && isSearching ? (
                        <div className="px-5 py-8 text-center text-gray-500">
                          Nenhum item encontrado para "{searchTermBySlot[slot.id]}"
                        </div>
                      ) : (
                        filteredItems.slice(0, 100).map(item => (
                          <div
                            key={item.unique_name}
                            onClick={() => updateItem(slot.id, item.unique_name)}
                            className="px-5 py-3 hover:bg-amber-50 cursor-pointer flex justify-between items-center border-b last:border-0 transition"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://render.albiononline.com/v1/item/${item.unique_name}.png?size=32`}
                                alt=""
                                className="w-8 h-8 object-contain"
                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                              />
                              <span>{item.name_pt}</span>
                            </div>
                            <div className="flex gap-2">
                              {item.tier && (
                                <span className="text-amber-600 text-sm font-medium">T{item.tier}</span>
                              )}
                              {item.enchantment > 0 && (
                                <span className="text-blue-500 text-sm">.{item.enchantment}</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {build.items[slot.id] && (
                    <div className="mt-3 flex items-center gap-2 text-green-600 font-medium">
                      <span>✓ Selecionado:</span>
                      <span>{getItemName(slot.id, build.items[slot.id])}</span>
                      <button
                        onClick={() => removeItem(slot.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {!isLoading && itemsBySlot[slot.id] && itemsBySlot[slot.id].length === 0 && (
                    <div className="mt-3 p-4 bg-yellow-50 rounded-2xl text-yellow-700 text-sm">
                      ⚠️ Nenhum item encontrado para este slot. Verifique se existem itens com slot_type = '{slot.id}' no banco.
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={saveBuild}
              disabled={saving}
              className={`w-full bg-green-600 hover:bg-green-700 text-white py-7 rounded-3xl font-bold text-2xl transition ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? <Loader2 className="animate-spin inline mr-2" size={28} /> : '💾'}
              {' '}SALVAR BUILD
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Login */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Login</h2>
              <button onClick={() => setShowAuth(false)}>
                <X size={24} />
              </button>
            </div>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google', 'github']}
            />
          </div>
        </div>
      )}
    </div>
  );
}
