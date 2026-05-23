'use client';

import { useEffect, useState } from 'react';
import { getItemIconUrl } from '@/lib/albionApi';

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
  const [saving, setSaving] = useState(false);
  const [namePt, setNamePt] = useState('');
  const [uniqueName, setUniqueName] = useState('');
  const [tier, setTier] = useState(4);
  const [slotType, setSlotType] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState('');

  // Buscar itens
  const fetchItems = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/itens');
      if (!res.ok) throw new Error('Erro ao buscar itens');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Erro:', error);
      setErrorMessage('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Criar/Atualizar item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    
    // Validação básica
    if (!namePt.trim()) {
      setErrorMessage('O campo Nome (PT) é obrigatório');
      setSaving(false);
      return;
    }
    if (!uniqueName.trim()) {
      setErrorMessage('O campo Unique Name é obrigatório');
      setSaving(false);
      return;
    }

    try {
      const payload = { 
        name_pt: namePt.trim(), 
        unique_name: uniqueName.trim(), 
        tier: Number(tier), 
        slot_type: slotType.trim() || null,
        enchantment: 0
      };
      
      console.log('Enviando payload:', payload); // Log para debug
      
      const url = editingId ? `/api/itens?id=${editingId}` : '/api/itens';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Erro da API:', data);
        throw new Error(data.error || 'Erro ao salvar item');
      }
      
      console.log('Resposta sucesso:', data);
      resetForm();
      fetchItems();
      alert(editingId ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!');
      
    } catch (error: any) {
      console.error('Erro:', error);
      setErrorMessage(error.message || 'Erro ao salvar item');
    } finally {
      setSaving(false);
    }
  };

  // Deletar item
  const deleteItem = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return;
    
    try {
      const res = await fetch(`/api/itens?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Erro ao deletar');
      
      fetchItems();
      alert('Item deletado com sucesso!');
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao deletar item');
    }
  };

  // Editar item
  const editItem = (item: Item) => {
    setEditingId(item.id);
    setNamePt(item.name_pt);
    setUniqueName(item.unique_name);
    setTier(item.tier);
    setSlotType(item.slot_type || '');
    setErrorMessage('');
  };

  const resetForm = () => {
    setEditingId(null);
    setNamePt('');
    setUniqueName('');
    setTier(4);
    setSlotType('');
    setErrorMessage('');
  };

  const handleImageError = (uniqueName: string) => {
    setImageErrors(prev => ({ ...prev, [uniqueName]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5] flex items-center justify-center">
        Carregando itens...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5]">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold border-b-2 border-amber-700 pb-2 mb-6 font-serif">
          ⚔️ Gerenciar Itens
        </h1>

        {/* Mensagem de erro */}
        {errorMessage && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">
            ❌ {errorMessage}
          </div>
        )}

        {/* Formulário */}
        <div className="bg-[#2c2118] p-6 rounded-lg shadow-lg border border-amber-800/40 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">
            {editingId ? '✏️ Editar Item' : '➕ Adicionar Novo Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-300/80 mb-1">
                  Nome (PT) *
                </label>
                <input 
                  type="text" 
                  value={namePt} 
                  onChange={(e) => setNamePt(e.target.value)} 
                  className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 text-[#e8dcc5] focus:outline-none focus:border-amber-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300/80 mb-1">
                  Unique Name *
                </label>
                <input 
                  type="text" 
                  value={uniqueName} 
                  onChange={(e) => setUniqueName(e.target.value)} 
                  className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 text-[#e8dcc5] focus:outline-none focus:border-amber-500" 
                  required 
                  placeholder="Ex: T4_HEAD_CLOTH_SET1"
                />
                <p className="text-xs text-amber-500/60 mt-1">
                  Use o mesmo nome da API do Albion
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300/80 mb-1">
                  Tier
                </label>
                <input 
                  type="number" 
                  value={tier} 
                  onChange={(e) => setTier(Number(e.target.value))} 
                  className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 text-[#e8dcc5]" 
                  min="1"
                  max="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300/80 mb-1">
                  Slot Type
                </label>
                <select
                  value={slotType}
                  onChange={(e) => setSlotType(e.target.value)}
                  className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 text-[#e8dcc5] focus:outline-none focus:border-amber-500"
                >
                  <option value="">Selecione um slot...</option>
                  <option value="head">Cabeça (Head)</option>
                  <option value="armor">Peito (Armor)</option>
                  <option value="shoes">Pés (Shoes)</option>
                  <option value="weapon">Arma (Weapon)</option>
                  <option value="offhand">Off-hand</option>
                  <option value="bag">Bolsa (Bag)</option>
                  <option value="cape">Capa (Cape)</option>
                  <option value="mount">Montaria (Mount)</option>
                  <option value="food">Comida (Food)</option>
                  <option value="potion">Poção (Potion)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="submit" 
                disabled={saving}
                className={`bg-amber-700 hover:bg-amber-600 text-[#1a120b] font-bold py-2 px-6 rounded transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {saving ? 'Salvando...' : (editingId ? 'Atualizar Item' : 'Criar Item')}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabela de Itens com Ícones */}
        <div className="bg-[#2c2118] rounded-lg shadow-lg border border-amber-800/40 overflow-hidden">
          <h2 className="text-xl font-semibold p-4 border-b border-amber-800/40 text-amber-400">
            📦 Itens Cadastrados ({items.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#3d2c1f] text-amber-300">
                <tr>
                  <th className="text-left p-3">Ícone</th>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Nome (PT)</th>
                  <th className="text-left p-3">Unique Name</th>
                  <th className="text-left p-3">Tier</th>
                  <th className="text-left p-3">Slot</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const iconUrl = getItemIconUrl(item.unique_name, 48);
                  const hasError = imageErrors[item.unique_name];
                  
                  return (
                    <tr key={item.id} className="border-b border-amber-800/20 hover:bg-[#3d2c1f]/50">
                      <td className="p-3">
                        {!hasError ? (
                          <img
                            src={iconUrl}
                            alt={item.name_pt}
                            className="w-12 h-12 object-contain"
                            onError={() => handleImageError(item.unique_name)}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#3d2c1f] rounded flex items-center justify-center text-amber-500 text-xs">
                            ?
                          </div>
                        )}
                      </td>
                      <td className="p-3">{item.id}</td>
                      <td className="p-3 font-medium">{item.name_pt}</td>
                      <td className="p-3 font-mono text-xs">{item.unique_name}</td>
                      <td className="p-3">T{item.tier}.{item.enchantment}</td>
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
                          className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
