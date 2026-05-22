'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Interface baseada estritamente na sua tabela do banco
interface Item {
  id?: number;
  unique_name: string;
  name_pt: string;
  name_en: string;
  description_pt: string;
  tier: number;
  slot_type: string;
  category: string;
  image_url: string;
  enchantment: number;
  weight: number;
  item_power: number;
}

export default function ItemsCRUD() {
  // Estados para o CRUD
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Estado do Formulário
  const [formData, setFormData] = useState<Item>({
    unique_name: '',
    name_pt: '',
    name_en: '',
    description_pt: '',
    tier: 4,
    slot_type: 'MAINHAND',
    category: 'MELEE',
    image_url: '',
    enchantment: 0,
    weight: 1.0,
    item_power: 700,
  });

  // 1. LER (Fetch Items)
  const fetchItems = async () => {
    setLoading(true);
    let query = supabase.from('items').select('*').order('id', { ascending: false });

    // Se houver busca, filtra por nome (aproveitando seus índices idx_items_name_pt)
    if (search) {
      query = query.ilike('name_pt', `%${search}%`);
    }

    const { data, error } = await query.limit(50);

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [search]);

  // 2. CRIAR E ATUALIZAR (Upsert)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && formData.id) {
      // Atualizar
      const { error } = await supabase
        .from('items')
        .update({ ...formData, updated_at: new Date() })
        .eq('id', formData.id);
        
      if (error) alert('Erro ao atualizar: ' + error.message);
    } else {
      // Criar novo
      const { error } = await supabase
        .from('items')
        .insert([formData]);

      if (error) alert('Erro ao criar item: ' + error.message);
    }

    resetForm();
    fetchItems();
  };

  // 3. DELETAR
  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja forjar a destruição deste item?')) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (!error) fetchItems();
    }
  };

  // Preparar formulário para edição
  const handleEdit = (item: Item) => {
    setFormData(item);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      unique_name: '',
      name_pt: '',
      name_en: '',
      description_pt: '',
      tier: 4,
      slot_type: 'MAINHAND',
      category: 'MELEE',
      image_url: '',
      enchantment: 0,
      weight: 1.0,
      item_power: 700,
    });
    setIsEditing(false);
  };

  return (
    <div className="flex-1 w-full bg-[#110e0c] text-[#d5c3a6] p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      
      {/* COLUNA ESQUERDA: Formulário (Estilo Forja de Albion) */}
      <div className="w-full lg:w-1/3 bg-[#17110d] border-2 border-[#281f18] p-5 rounded-sm shadow-xl h-fit">
        <h2 className="text-base font-black text-[#e6a817] uppercase tracking-wider mb-4 border-b border-[#2d2319] pb-2 flex items-center gap-2">
          🔨 {isEditing ? 'Modificar Item Antigo' : 'Forjar Novo Item'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#847260] uppercase font-bold mb-1">Unique Name (ID do Jogo)</label>
            <input
              type="text"
              required
              disabled={isEditing}
              className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none disabled:opacity-50"
              value={formData.unique_name}
              onChange={e => setFormData({ ...formData, unique_name: e.target.value })}
              placeholder="T4_MAIN_SWORD"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[#847260] uppercase font-bold mb-1">Nome (PT)</label>
              <input
                type="text"
                required
                className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none"
                value={formData.name_pt}
                onChange={e => setFormData({ ...formData, name_pt: e.target.value })}
                placeholder="Espada Larga"
              />
            </div>
            <div>
              <label className="block text-[#847260] uppercase font-bold mb-1">Nome (EN)</label>
              <input
                type="text"
                className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none"
                value={formData.name_en || ''}
                onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="Broadsword"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[#847260] uppercase font-bold mb-1">Tier</label>
              <input
                type="number"
                className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none"
                value={formData.tier || 0}
                onChange={e => setFormData({ ...formData, tier: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[#847260] uppercase font-bold mb-1">Encant.</label>
              <input
                type="number"
                className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none"
                value={formData.enchantment}
                onChange={e => setFormData({ ...formData, enchantment: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[#847260] uppercase font-bold mb-1">IP (Item Power)</label>
              <input
                type="number"
                className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none"
                value={formData.item_power || 0}
                onChange={e => setFormData({ ...formData, item_power: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[#847260] uppercase font-bold mb-1">Slot Tipo</label>
              <select
                className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none"
                value={formData.slot_type || ''}
                onChange={e => setFormData({ ...formData, slot_type: e.target.value })}
              >
                <option value="MAINHAND">Arma Principal (Mainhand)</option>
                <option value="OFFHAND">Arma Secundária (Offhand)</option>
                <option value="HEAD">Capuz/Elmo (Head)</option>
                <option value="ARMOR">Casaco/Peito (Armor)</option>
                <option value="SHOES">Sapatos/Botas (Shoes)</option>
                <option value="CAPE">Capa (Cape)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#847260] uppercase font-bold mb-1">Categoria</label>
              <input
                type="text"
                className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none"
                value={formData.category || ''}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: SWORD, BOW"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#847260] uppercase font-bold mb-1">Descrição (PT)</label>
            <textarea
              className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none h-16 resize-none"
              value={formData.description_pt || ''}
              onChange={e => setFormData({ ...formData, description_pt: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[#847260] uppercase font-bold mb-1">URL da Imagem</label>
            <input
              type="text"
              className="w-full bg-[#0d0908] border border-[#3d2f23] rounded-sm p-2 text-[#e1d5c1] focus:border-[#e6a817] outline-none"
              value={formData.image_url || ''}
              onChange={e => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://render.albiononline.com/..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#c47d1a] border border-[#fcd581] hover:bg-[#b06f14] text-[#110e0c] font-black uppercase py-2.5 rounded-sm transition-all"
            >
              {isEditing ? 'Salvar Alteração' : 'Adicionar ao Banco'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-[#231b15] border border-[#3e3124] hover:bg-[#2d231a] text-[#a08871] font-bold px-3 py-2.5 rounded-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* COLUNA DIREITA: Listagem & Busca */}
      <div className="w-full lg:w-2/3 bg-[#17110d] border-2 border-[#281f18] p-5 rounded-sm shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-[#2d2319] pb-4">
          <h2 className="text-base font-black text-[#e6a817] uppercase tracking-wider flex items-center gap-2">
            📦 Itens Cadastrados no Sistema
          </h2>
          <input
            type="text"
            placeholder="Filtrar por nome em português..."
            className="bg-[#0f0b09] border border-[#3e3124] rounded-sm px-4 py-2 text-xs focus:outline-none focus:border-[#e6a817] text-[#e1d5c1] placeholder-[#5c4937] w-full sm:w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tabela de Itens */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center py-8 text-sm text-[#5c4937] animate-pulse">Consultando o Inventário Real...</p>
          ) : items.length === 0 ? (
            <p className="text-center py-8 text-sm text-[#5c4937]">Nenhum item encontrado nos registros comerciais.</p>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2d2319] text-[#847260] uppercase tracking-wider font-bold">
                  <th className="py-2 px-3">Slot/Item</th>
                  <th className="py-2 px-3">Nome Técnico</th>
                  <th className="py-2 px-3 text-center">Tier</th>
                  <th className="py-2 px-3 text-center">IP</th>
                  <th className="py-2 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2319]/40">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-[#201813] transition-colors group">
                    <td className="py-3 px-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0d0908] border border-[#3d2f23] rounded-sm flex items-center justify-center text-center overflow-hidden shrink-0 group-hover:border-[#e6a817]">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name_pt} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xs text-[#5c4937]">T{item.tier}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#e1d5c1]">{item.name_pt}</div>
                        <div className="text-[10px] text-[#5c4937] italic">{item.slot_type}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#a08871] max-w-[180px] truncate">
                      {item.unique_name}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-400">
                      T{item.tier}.{item.enchantment}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-amber-500">
                      {item.item_power}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-[#e6a817] hover:text-white font-bold transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="text-[#b54141] hover:text-red-400 font-bold transition-colors"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
