'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Edit3, Save, Eye, LogIn, X } from 'lucide-react';
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
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);

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

    setLoadingSlot(slotId);
    const { data } = await supabase
      .from('items')
      .select('unique_name, name_pt, tier')
      .eq('slot_type', slotId)
      .order('tier', { ascending: false })
      .order('name_pt')
      .limit(120);

    setItemsBySlot(prev => ({ ...prev, [slotId]: data || [] }));
    setLoadingSlot(null);
  };

  const updateItem = (slotId: string, value: string) => {
    setBuild(prev => ({
      ...prev,
      items: { ...prev.items, [slotId]: value }
    }));
  };

  const generatePreview = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    canvas.width = 620;
    canvas.height = 650;

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

  const saveBuild = async () => {
    if (!user) { setShowAuth(true); return; }
    if (!build.category_id) return alert("Escolha uma categoria!");

    const { error } = await supabase.from('saved_builds').insert({
      build_name: build.title,
      category_id: build.category_id,
      data: build.items,
      creator_id: user.id,
    });

    if (error) alert("Erro ao salvar: " + error.message);
    else alert("✅ Build salva com sucesso!");
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-10 text-amber-950">
          🛠️ Criador de Builds
        </h1>

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
          {/* Preview */}
          <div className="xl:col-span-5">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 sticky top-8 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-amber-950">{build.title}</h2>
                <button onClick={() => alert("Em breve: editar nome com modal")}>
                  <Edit3 size={28} className="text-amber-600" />
                </button>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {previewImage ? (
                <img src={previewImage} alt="preview" className="rounded-2xl shadow-xl" />
              ) : (
                <div className="bg-[#e9d9c4] aspect-square rounded-2xl flex items-center justify-center text-6xl border-4 border-dashed border-amber-300">
                  Preview da Build
                </div>
              )}

              <button
                onClick={generatePreview}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3"
              >
                <Eye size={24} /> Gerar Preview
              </button>
            </div>
          </div>

          {/* Editor */}
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
                    className="w-full border border-zinc-300 p-4 rounded-2xl text-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select
                    className="w-full border border-zinc-300 p-4 rounded-2xl text-lg"
                    onChange={(e) => setBuild(p => ({ ...p, category_id: parseInt(e.target.value) }))}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Slots */}
            {slotsConfig.map(slot => (
              <div key={slot.id} className="bg-white border border-zinc-200 p-8 rounded-3xl">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-3">
                  {slot.emoji} {slot.label}
                </h3>
                <select
                  className="w-full border border-zinc-300 p-5 rounded-2xl text-lg focus:outline-none focus:border-amber-500"
                  onClick={() => loadItems(slot.id)}
                  onChange={(e) => updateItem(slot.id, e.target.value)}
                  value={build.items[slot.id] || ''}
                >
                  <option value="">Selecione um item...</option>
                  {(itemsBySlot[slot.id] || []).map(item => (
                    <option key={item.unique_name} value={item.unique_name}>
                      {item.name_pt} {item.tier && `(T${item.tier})`}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button
              onClick={saveBuild}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-7 rounded-3xl font-bold text-2xl flex items-center justify-center gap-4"
            >
              <Save size={32} /> SALVAR BUILD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
