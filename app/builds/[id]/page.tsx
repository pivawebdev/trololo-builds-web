'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Edit3, Trash2, Users } from 'lucide-react';

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

const slotConfig = [
  { key: 'weapon_item', label: 'Arma', emoji: '⚔️', position: { top: '48%', left: '15%' } },
  { key: 'head_item', label: 'Cabeça', emoji: '👑', position: { top: '15%', left: '42%' } },
  { key: 'armor_item', label: 'Peito', emoji: '🛡️', position: { top: '48%', left: '42%' } },
  { key: 'shoes_item', label: 'Botas', emoji: '👟', position: { top: '70%', left: '42%' } },
  { key: 'cape_item', label: 'Capa', emoji: '🧥', position: { top: '28%', left: '15%' } }
];

export default function BuildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuild = async () => {
      try {
        const res = await fetch(`/api/builds/${params.id}`);
        const data = await res.json();
        setBuild(data);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      loadBuild();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que quer deletar esta build?')) return;
    
    try {
      const res = await fetch(`/api/builds?id=${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/builds');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  // 👇 CORRIGIDA: retorna string, não null
  const getItemIcon = (itemId: string | null, size = 120): string => {
    if (!itemId) return '';
    return `https://render.albiononline.com/v1/item/${itemId}.png?size=${size}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a120b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="min-h-screen bg-[#1a120b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-500">Build não encontrada</p>
          <Link href="/builds" className="text-amber-400 hover:underline mt-2 inline-block">
            Voltar para builds
          </Link>
        </div>
      </div>
    );
  }

  const hasItems = build.weapon_item || build.head_item || build.armor_item || build.shoes_item || build.cape_item;

  return (
    <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5]">
      <div className="max-w-6xl mx-auto p-6">
        <Link href="/builds" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-6">
          <ArrowLeft size={20} /> Voltar para builds
        </Link>

        <div className="bg-[#2c2118] rounded-xl border border-amber-800/40 p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{build.build_name}</h1>
              <div className="flex gap-4 text-sm text-amber-500/40">
                <span className="flex items-center gap-1">
                  <Users size={16} /> Criador: {build.creator_id}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} /> {new Date(build.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {build.build_categories && (
                <div className="mt-2 text-sm text-amber-500">
                  {build.build_categories.emoji} {build.build_categories.name}
                  {build.build_categories.description && ` - ${build.build_categories.description}`}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/create?edit=${build.id}`}
                className="p-2 bg-[#3d2c1f] rounded-lg hover:bg-amber-800/30 transition"
              >
                <Edit3 size={20} />
              </Link>
              <button onClick={handleDelete} className="p-2 bg-red-900/50 rounded-lg hover:bg-red-800/50 transition">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {hasItems && (
          <div className="bg-[#2c2118] rounded-xl border border-amber-800/40 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-amber-400">🛡️ Visualização da Build</h2>
            <div className="relative bg-[#e9d9c4] aspect-square max-w-2xl mx-auto rounded-2xl overflow-hidden border-4 border-amber-800">
              {slotConfig.map((slot) => {
                const itemId = build[slot.key as keyof Build] as string | null;
                const iconUrl = getItemIcon(itemId, 120);
                if (!iconUrl) return null;
                
                return (
                  <div key={slot.key} className="absolute" style={slot.position}>
                    <img
                      src={iconUrl}
                      alt={slot.label}
                      className="w-[120px] h-[120px] object-contain drop-shadow-lg"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                      {slot.emoji} {slot.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-[#2c2118] rounded-xl border border-amber-800/40 p-8">
          <h2 className="text-2xl font-bold mb-6 text-amber-400">📦 Itens da Build</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slotConfig.map((slot) => {
              const itemId = build[slot.key as keyof Build] as string | null;
              const iconUrl = getItemIcon(itemId, 48);
              if (!itemId || !iconUrl) return null;
              
              return (
                <div key={slot.key} className="flex items-center gap-4 p-3 bg-[#3d2c1f] rounded-lg">
                  <img
                    src={iconUrl}
                    alt={slot.label}
                    className="w-12 h-12 object-contain"
                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                  />
                  <div>
                    <div className="font-semibold">{slot.emoji} {slot.label}</div>
                    <div className="text-sm text-amber-500/60 font-mono">{itemId}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}