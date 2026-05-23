'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Item {
  id: number;
  unique_name: string;
  name_pt: string;
  name_en: string | null;
  tier: number;
  enchantment: number;
  slot_type: string | null;
  item_power: number | null;
}

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [namePt, setNamePt] = useState('');
  const [uniqueName, setUniqueName] = useState('');
  const [tier, setTier] = useState(4);
  const [slotType, setSlotType] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Buscar itens
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/itens');
      if (!res.ok) throw new Error('Erro ao buscar itens');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Criar item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name_pt: namePt, unique_name: uniqueName, tier, slot_type: slotType, enchantment: 0 };
      const url = editingId ? `/api/itens?id=${editingId}` : '/api/itens';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Erro ao salvar');
      
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Deletar item
  const deleteItem = async (id: number) => {
    if (!confirm('Tem certeza?')) return;
    try {
      const res = await fetch(`/api/itens?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar');
      fetchItems();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Editar item
  const editItem = (item: Item) => {
    setEditingId(item.id);
    setNamePt(item.name_pt);
    setUniqueName(item.unique_name);
    setTier(item.tier);
    setSlotType(item.slot_type || '');
  };

  const resetForm = () => {
    setEditingId(null);
    setNamePt('');
    setUniqueName('');
    setTier(4);
    setSlotType('');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5] flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5]">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold border-b-2 border-amber-700 pb-2 mb-6 font-serif">⚔️ Gerenciar Itens</h1>

        {/* Formulário */}
        <div className="bg-[#2c2118] p-6 rounded-lg shadow-lg border border-amber-800/40 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">{editingId ? '✏️ Editar Item' : '➕ Adicionar Novo Item'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-300/80">Nome (PT) *</label>
                <input type="text" value={namePt} onChange={(e) => setNamePt(e.target.value)} className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300/80">Unique Name *</label>
                <input type="text" value={uniqueName} onChange={(e) => setUniqueName(e.target.value)} className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300/80">Tier</label>
                <input type="number" value={tier} onChange={(e) => setTier(Number(e.target.value))} className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300/80">Slot Type</label>
                <input type="text" value={slotType} onChange={(e) => setSlotType(e.target.value)} className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2" placeholder="head, armor, weapon..." />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-amber-700 hover:bg-amber-600 text-[#1a120b] font-bold py-2 px-6 rounded">{editingId ? 'Atualizar' : 'Criar'}</button>
              {editingId && <button type="button" onClick={resetForm} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded">Cancelar</button>}
            </div>
          </form>
        </div>

        {/* Tabela */}
        <div className="bg-[#2c2118] rounded-lg shadow-lg border border-amber-800/40 overflow-hidden">
          <h2 className="text-xl font-semibold p-4 border-b border-amber-800/40 text-amber-400">📦 Itens Cadastrados ({items.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#3d2c1f] text-amber-300">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Nome (PT)</th>
                  <th className="text-left p-3">Unique Name</th>
                  <th className="text-left p-3">Tier</th>
                  <th className="text-left p-3">Slot</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-amber-800/20 hover:bg-[#3d2c1f]/50">
                    <td className="p-3">{item.id}</td>
                    <td className="p-3 font-medium">{item.name_pt}</td>
                    <td className="p-3 font-mono text-xs">{item.unique_name}</td>
                    <td className="p-3">T{item.tier}</td>
                    <td className="p-3">{item.slot_type || '-'}</td>
                    <td className="p-3 space-x-2">
                      <button onClick={() => editItem(item)} className="bg-amber-600 hover:bg-amber-500 text-[#1a120b] px-3 py-1 rounded text-xs font-bold">Editar</button>
                      <button onClick={() => deleteItem(item.id)} className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-xs">Deletar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
