'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Edit3, Save, Eye, X, Search } from 'lucide-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const slotsConfig = [
  { id: 'head', label: 'Cabeça', emoji: '🪖' },
  { id: 'chest', label: 'Peito', emoji: '🛡️' },
  { id: 'shoes', label: 'Botas', emoji: '🥾' },
  { id: 'mainhand', label: 'Arma', emoji: '⚔️' },
  { id: 'offhand', label: 'Off-hand', emoji: '🛡️' },
  { id: 'cape', label: 'Capa', emoji: '🧥' },
  { id: 'bag', label: 'Bolsa', emoji: '🎒' },
  { id: 'mount', label: 'Montaria', emoji: '🐎' },
];

const slotPositions: Record<string, { top: string; left: string }> = {
  head: { top: '15%', left: '42%' },
  cape: { top: '28%', left: '15%' },
  bag: { top: '28%', left: '68%' },
  mainhand: { top: '48%', left: '15%' },
  chest: { top: '48%', left: '42%' },
  offhand: { top: '48%', left: '68%' },
  shoes: { top: '70%', left: '42%' },
  mount: { top: '85%', left: '42%' },
};

export default function CreateBuildPage() {
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [build, setBuild] = useState({
    title: "Minha Build Incrível",
    category_id: null as number | null,
    items: {} as Record<string, string>,
  });

  const [itemsBySlot, setItemsBySlot] = useState<Record<string, any[]>>({});
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

  useEffect(() => {
    supabase.from('build_categories').select('*').order('sort_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const loadSlotItems = async (slotId: string) => {
    if (itemsBySlot[slotId]?.length) return;

    const { data } = await supabase
      .from('items')
      .select('unique_name, name_pt, tier')
      .eq('slot_type', slotId)
      .order('tier', { ascending: false })
      .order('name_pt')
      .limit(150);

    setItemsBySlot(prev => ({ ...prev, [slotId]: data || [] }));
  };

  const handleSearch = (slotId: string, value: string) => {
    setSearchTermBySlot(prev => ({ ...prev, [slotId]: value }));
    if (!itemsBySlot[slotId]) loadSlotItems(slotId);
  };

  const updateItem = (slotId: string, value: string) => {
    setBuild(prev => ({
      ...prev,
      items: { ...prev.items, [slotId]: value }
    }));
    setSearchTermBySlot(prev => ({ ...prev, [slotId]: '' }));
  };

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-10 text-amber-950">🛠️ Criador de Builds</h1>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* === PREVIEW COM IMAGENS DO ALBION === */}
          <div className="xl:col-span-5">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 sticky top-8 shadow-xl">
              <div className="flex justify-between mb-6">
                <h2 className="text-3xl font-bold text-amber-950">{build.title}</h2>
                <Edit3 className="text-amber-600 cursor-pointer" size={28} />
              </div>

              <div className="relative bg-[#e9d9c4] aspect-square rounded-2xl overflow-hidden border-4 border-amber-800 shadow-inner">
                {Object.entries(build.items).map(([slot, itemId]) => {
                  if (!itemId) return null;
                  const pos = slotPositions[slot];
                  if (!pos) return null;

                  return (
                    <img
                      key={slot}
                      src={`https://render.albiononline.com/v1/item/${itemId}.png?size=130&quality=4`}
                      alt={slot}
                      className="absolute drop-shadow-lg"
                      style={{
                        top: pos.top,
                        left: pos.left,
                        width: '130px',
                        height: '130px',
                      }}
                    />
                  );
                })}
              </div>

              <button
                onClick={() => alert("Em breve: download da imagem")}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold"
              >
                📸 Baixar Preview
              </button>
            </div>
          </div>

          {/* === EDITOR === */}
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
                    className="w-full border border-zinc-300 p-4 rounded-2xl text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select
                    className="w-full border border-zinc-300 p-4 rounded-2xl"
                    onChange={(e) => setBuild(p => ({ ...p, category_id: parseInt(e.target.value) }))}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Slots com busca */}
            {slotsConfig.map(slot => (
              <div key={slot.id} className="bg-white border border-zinc-200 p-8 rounded-3xl">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                  {slot.emoji} {slot.label}
                </h3>

                <div className="relative">
                  <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={`Buscar ${slot.label.toLowerCase()}...`}
                    className="w-full border border-zinc-300 pl-12 p-4 rounded-2xl text-lg"
                    value={searchTermBySlot[slot.id] || ''}
                    onChange={(e) => handleSearch(slot.id, e.target.value)}
                    onFocus={() => loadSlotItems(slot.id)}
                  />
                </div>

                {/* Lista de sugestões */}
                {(searchTermBySlot[slot.id] || itemsBySlot[slot.id]) && (
                  <div className="mt-3 max-h-72 overflow-auto border border-zinc-200 rounded-2xl bg-white">
                    {(itemsBySlot[slot.id] || [])
                      .filter(item =>
                        !searchTermBySlot[slot.id] ||
                        item.name_pt.toLowerCase().includes(searchTermBySlot[slot.id].toLowerCase())
                      )
                      .slice(0, 40)
                      .map(item => (
                        <div
                          key={item.unique_name}
                          onClick={() => updateItem(slot.id, item.unique_name)}
                          className="px-5 py-3 hover:bg-amber-50 cursor-pointer flex justify-between border-b last:border-0"
                        >
                          <span>{item.name_pt}</span>
                          {item.tier && <span className="text-amber-600 text-sm">T{item.tier}</span>}
                        </div>
                      ))}
                  </div>
                )}

                {build.items[slot.id] && (
                  <p className="mt-3 text-green-600 font-medium">
                    ✓ {itemsBySlot[slot.id]?.find(i => i.unique_name === build.items[slot.id])?.name_pt}
                  </p>
                )}
              </div>
            ))}

            <button
              onClick={() => alert("Build salva! (em desenvolvimento)")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-7 rounded-3xl font-bold text-2xl"
            >
              💾 SALVAR BUILD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
