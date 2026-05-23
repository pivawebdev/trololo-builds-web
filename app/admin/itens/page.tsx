// app/admin/itens/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getItemIconUrl } from '@/lib/albionApi'; // 👈 Importação da nossa nova função

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
  // ... (mantenha todo o estado e as funções fetch, handleSubmit, editItem, deleteItem iguais ao que você tinha) ...
  const [items, setItems] = useState<Item[]>([]);
  const [namePt, setNamePt] = useState('');
  const [uniqueName, setUniqueName] = useState('');
  const [tier, setTier] = useState(4);
  const [slotType, setSlotType] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const res = await fetch('/api/itens');
    const data = await res.json();
    setItems(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name_pt: namePt,
      unique_name: uniqueName,
      tier,
      enchantment: 0,
      slot_type: slotType,
    };
    const url = editingId ? `/api/itens?id=${editingId}` : '/api/itens';
    const method = editingId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setNamePt('');
    setUniqueName('');
    setTier(4);
    setSlotType('');
    setEditingId(null);
    fetchItems();
  }

  function editItem(item: Item) {
    setEditingId(item.id);
    setNamePt(item.name_pt);
    setUniqueName(item.unique_name);
    setTier(item.tier);
    setSlotType(item.slot_type || '');
  }

  async function deleteItem(id: number) {
    if (confirm('Tem certeza que deseja deletar este item?')) {
      await fetch(`/api/itens?id=${id}`, { method: 'DELETE' });
      fetchItems();
    }
  }

  return (
    <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5]">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold border-b-2 border-amber-700 pb-2 mb-6 font-serif">
          ⚔️ Gerenciar Itens
        </h1>

        {/* Formulário */}
        <div className="bg-[#2c2118] p-6 rounded-lg shadow-lg border border-amber-800/40 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">
            {editingId ? '✏️ Editar Item' : '➕ Adicionar Novo Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ... (campos do formulário: Nome, Unique Name, Tier, Slot Type) ... */}
              <div>
                <label className="block text-sm font-medium text-amber-300/80">Nome (PT) *</label>
                <input
                  type="text"
                  value={namePt}
                  onChange={(e) => setNamePt(e.target.value)}
                  className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 text-[#e8dcc5] focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300/80">Unique Name *</label>
                <input
                  type="text"
                  value={uniqueName}
                  onChange={(e) => setUniqueName(e.target.value)}
                  className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 text-[#e8dcc5] focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300/80">Tier</label>
                <input
                  type="number"
                  value={tier}
                  onChange={(e) => setTier(Number(e.target.value))}
                  className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 text-[#e8dcc5] focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300/80">Slot Type</label>
                <input
                  type="text"
                  value={slotType}
                  onChange={(e) => setSlotType(e.target.value)}
                  className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 text-[#e8dcc5] focus:outline-none focus:border-amber-500"
                  placeholder="ex: head, armor, weapon..."
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-amber-700 hover:bg-amber-600 text-[#1a120b] font-bold py-2 px-6 rounded transition-colors"
              >
                {editingId ? 'Atualizar Item' : 'Criar Item'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setNamePt('');
                    setUniqueName('');
                    setTier(4);
                    setSlotType('');
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-[#e8dcc5] font-bold py-2 px-6 rounded transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabela de Itens */}
        <div className="bg-[#2c2118] rounded-lg shadow-lg border border-amber-800/40 overflow-hidden">
          <h2 className="text-xl font-semibold p-4 border-b border-amber-800/40 text-amber-400">
            📦 Itens Cadastrados ({items.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#3d2c1f] text-amber-300">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Ícone</th>
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
                    <td className="p-3">
                      <img
                        src={getItemIconUrl(item.unique_name, 32)}
                        alt={item.name_pt}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/32x32?text=?';
                        }}
                      />
                    </td>
                    <td className="p-3 font-medium">{item.name_pt}</td>
                    <td className="p-3 font-mono text-xs">{item.unique_name}</td>
                    <td className="p-3">T{item.tier}</td>
                    <td className="p-3">{item.slot_type || '-'}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => editItem(item)}
                        className="bg-amber-600 hover:bg-amber-500 text-[#1a120b] px-3 py-1 rounded text-xs font-bold transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="bg-red-800 hover:bg-red-700 text-[#e8dcc5] px-3 py-1 rounded text-xs transition-colors"
                      >
                        Deletar
                      </button>
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
