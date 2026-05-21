'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Edit3, Save, Eye, LogIn, X, Search } from 'lucide-react';
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
  { id: 'mainhand', label: 'Arma Principal', emoji: '⚔️' },
  { id: 'offhand', label: 'Off-hand', emoji: '🛡️' },
  { id: 'cape', label: 'Capa', emoji: '🧥' },
  { id: 'bag', label: 'Bolsa', emoji: '🎒' },
  { id: 'mount', label: 'Montaria', emoji: '🐎' },
];

export default function CreateBuildPage() {
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [build, setBuild] = useState({
    title: "Minha Build Incrível",
    category_id: null as number | null,
    items: {} as Record<string, string>,
  });

  const [itemsBySlot, setItemsBySlot] = useState<Record<string, any[]>>({});
  const [searchTermBySlot, setSearchTermBySlot] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<any[]>([]);

  // Debounce Timer
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

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

  const loadItems = async (slotId: string) => {
    if (itemsBySlot[slotId]?.length > 0) return;

    const { data } = await supabase
      .from('items')
      .select('unique_name, name_pt, tier')
      .eq('slot_type', slotId)
      .order('tier', { ascending: false })
      .order('name_pt')
      .limit(150);

    setItemsBySlot(prev => ({ ...prev, [slotId]: data || [] }));
  };

  // Busca com Debounce
  const handleSearch = (slotId: string, value: string) => {
    setSearchTermBySlot(prev => ({ ...prev, [slotId]: value }));

    if (debounceTimers.current[slotId]) {
      clearTimeout(debounceTimers.current[slotId]);
    }

    debounceTimers.current[slotId] = setTimeout(() => {
      loadItems(slotId);
    }, 400);
  };

  const updateItem = (slotId: string, value: string) => {
    setBuild(prev => ({
      ...prev,
      items: { ...prev.items, [slotId]: value }
    }));
  };

  const generatePreview = async () => { /* mesmo código anterior */ };

  const saveBuild = async () => { /* mesmo código anterior */ };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-10 text-amber-950">
          🛠️ Criador de Builds
        </h1>

        {/* ... (parte do modal de auth permanece igual) */}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Preview - mantido igual */}

          {/* Editor */}
          <div className="xl:col-span-7 space-y-6">
            {/* Nome + Categoria */}
            <div className="bg-white border border-zinc-200 p-8 rounded-3xl">
              {/* ... mesmo código de nome e categoria */}
            </div>

            {/* Slots com Busca + Debounce */}
            {slotsConfig.map(slot => (
              <div key={slot.id} className="bg-white border border-zinc-200 p-8 rounded-3xl">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                  {slot.emoji} {slot.label}
                </h3>

                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder={`Buscar ${slot.label.toLowerCase()}...`}
                      className="w-full border border-zinc-300 pl-12 p-4 rounded-2xl text-lg focus:outline-none focus:border-amber-500"
                      value={searchTermBySlot[slot.id] || ''}
                      onChange={(e) => handleSearch(slot.id, e.target.value)}
                      onFocus={() => loadItems(slot.id)}
                    />
                  </div>

                  {/* Lista de resultados */}
                  {(searchTermBySlot[slot.id] || itemsBySlot[slot.id]?.length) && (
                    <div className="mt-2 max-h-80 overflow-auto border border-zinc-200 rounded-2xl bg-white">
                      {(itemsBySlot[slot.id] || [])
                        .filter(item => 
                          !searchTermBySlot[slot.id] || 
                          item.name_pt.toLowerCase().includes(searchTermBySlot[slot.id].toLowerCase())
                        )
                        .slice(0, 50)
                        .map(item => (
                          <div
                            key={item.unique_name}
                            onClick={() => {
                              updateItem(slot.id, item.unique_name);
                              setSearchTermBySlot(prev => ({ ...prev, [slot.id]: '' }));
                            }}
                            className="px-5 py-3 hover:bg-amber-50 cursor-pointer flex justify-between items-center border-b last:border-none"
                          >
                            <span>{item.name_pt}</span>
                            {item.tier && <span className="text-amber-600 text-sm">T{item.tier}</span>}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {build.items[slot.id] && (
                  <p className="mt-3 text-sm text-green-600 font-medium">
                    ✓ Selecionado: {itemsBySlot[slot.id]?.find(i => i.unique_name === build.items[slot.id])?.name_pt}
                  </p>
                )}
              </div>
            ))}

            <button onClick={saveBuild} className="w-full bg-green-600 hover:bg-green-700 text-white py-7 rounded-3xl font-bold text-2xl">
              💾 SALVAR BUILD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
