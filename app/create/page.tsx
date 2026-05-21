'use client';

import { useState, useRef, useEffect } from 'react';
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

  // Carrega itens de um slot específico
  const loadSlotItems = async (slotId: string) => {
    if (itemsBySlot[slotId]?.length > 0) return;

    const { data } = await supabase
      .from('items')
      .select('unique_name, name_pt, tier')
      .eq('slot_type', slotId)           // ← Filtro rigoroso por slot
      .order('tier', { ascending: false })
      .order('name_pt')
      .limit(150);

    setItemsBySlot(prev => ({ ...prev, [slotId]: data || [] }));
  };

  // Busca com debounce
  const handleSearch = (slotId: string, value: string) => {
    setSearchTermBySlot(prev => ({ ...prev, [slotId]: value }));

    // Carrega os itens do slot se ainda não carregou
    if (!itemsBySlot[slotId]) {
      loadSlotItems(slotId);
    }
  };

  const updateItem = (slotId: string, value: string) => {
    setBuild(prev => ({
      ...prev,
      items: { ...prev.items, [slotId]: value }
    }));
    // Limpa a busca após selecionar
    setSearchTermBySlot(prev => ({ ...prev, [slotId]: '' }));
  };

  const generatePreview = async () => { 
    // (mesmo código de preview anterior - pode deixar como está)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    canvas.width = 620; canvas.height = 650;
    ctx.fillStyle = '#e9d9c4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const positions: any = {
      head: [255, 90], chest: [255, 210], shoes: [255, 330],
      mainhand: [110, 210], offhand: [400, 210],
      cape: [110, 90], bag: [400, 90], mount: [255, 470]
    };

    for (const [slot, itemId] of Object.entries(build.items)) {
      if (!itemId) continue;
      const pos = positions[slot];
      if (!pos) continue;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `https://render.albiononline.com/v1/item/${itemId}.png?size=115`;

      await new Promise((resolve) => {
        img.onload = () => { ctx.drawImage(img, pos[0], pos[1], 115, 115); resolve(null); };
        img.onerror = () => resolve(null);
      });
    }

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(build.title, 310, 55);

    setPreviewImage(canvas.toDataURL('image/png'));
  };

  const saveBuild = async () => { /* mantenha o mesmo código */ };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-10 text-amber-950">🛠️ Criador de Builds</h1>

        {/* Modal Auth */}
        {showAuth && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md relative">
              <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4">
                <X size={28} />
              </button>
              <Auth supabaseClient={supabase} providers={['discord']} appearance={{ theme: ThemeSupa }} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Preview (mantido igual) */}
          <div className="xl:col-span-5">
            {/* ... seu preview anterior ... */}
          </div>

          {/* Editor */}
          <div className="xl:col-span-7 space-y-6">
            {/* Nome + Categoria (mantido) */}

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
                      onFocus={() => loadSlotItems(slot.id)}
                    />
                  </div>

                  {/* Lista filtrada */}
                  {(searchTermBySlot[slot.id] || itemsBySlot[slot.id]) && (
                    <div className="mt-2 max-h-80 overflow-auto border border-zinc-200 rounded-2xl bg-white shadow">
                      {(itemsBySlot[slot.id] || [])
                        .filter(item => 
                          !searchTermBySlot[slot.id] || 
                          item.name_pt.toLowerCase().includes((searchTermBySlot[slot.id] || '').toLowerCase())
                        )
                        .slice(0, 60)
                        .map(item => (
                          <div
                            key={item.unique_name}
                            onClick={() => updateItem(slot.id, item.unique_name)}
                            className="px-5 py-3 hover:bg-amber-50 cursor-pointer flex justify-between border-b last:border-0"
                          >
                            <span>{item.name_pt}</span>
                            {item.tier && <span className="text-amber-600">T{item.tier}</span>}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {build.items[slot.id] && (
                  <p className="mt-3 text-green-600 font-medium text-sm">
                    ✓ {itemsBySlot[slot.id]?.find(i => i.unique_name === build.items[slot.id])?.name_pt}
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
