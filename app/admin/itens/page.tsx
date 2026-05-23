'use client';

import { useEffect, useState } from 'react';
import { getItemIconUrl } from '@/lib/albionApi';

interface Item {
  id: number;
  unique_name: string;
  name_pt: string;
  tier: number;
  slot_type: string | null;
}

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [namePt, setNamePt] = useState('');
  const [uniqueName, setUniqueName] = useState('');
  const [tier, setTier] = useState(4);
  const [slotType, setSlotType] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Carregar itens
  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/itens');
      const data = await res.json();
      const itemsArray = Array.isArray(data) ? data : [];
      setItems(itemsArray);
      setFilteredItems(itemsArray);
    } catch (err) {
      setError('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Filtrar itens quando searchTerm ou selectedSlot mudar
  useEffect(() => {
    let filtered = [...items];
    
    // Filtro por texto (nome ou unique_name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name_pt.toLowerCase().includes(term) ||
          item.unique_name.toLowerCase().includes(term)
      );
    }
    
    // Filtro por slot
    if (selectedSlot) {
      filtered = filtered.filter(item => item.slot_type === selectedSlot);
    }
    
    setFilteredItems(filtered);
  }, [searchTerm, selectedSlot, items]);

  // Limpar mensagens após 3 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Salvar (criar ou atualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!namePt.trim() || !uniqueName.trim()) {
      setError('Preencha nome e unique name');
      return;
    }

    try {
      const payload = {
        name_pt: namePt.trim(),
        unique_name: uniqueName.trim(),
        tier: Number(tier),
        slot_type: slotType || null,
      };

      const url = editingId ? `/api/itens?id=${editingId}` : '/api/itens';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar');
      }

      setSuccess(editingId ? 'Item atualizado!' : 'Item criado!');
      resetForm();
      loadItems();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Deletar item
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deletar "${name}"?`)) return;

    try {
      const res = await fetch(`/api/itens?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao deletar');

      setSuccess('Item deletado!');
      loadItems();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Editar item
  const handleEdit = (item: Item) => {
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

  // Opções de slot para o filtro
  const slotOptions = [
    { value: '', label: 'Todos os Slots' },
    { value: 'head', label: 'Cabeça' },
    { value: 'armor', label: 'Peito' },
    { value: 'shoes', label: 'Pés' },
    { value: 'weapon', label: 'Arma' },
    { value: 'offhand', label: 'Off-hand' },
    { value: 'bag', label: 'Bolsa' },
    { value: 'cape', label: 'Capa' },
    { value: 'mount', label: 'Montaria' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5] flex items-center justify-center">
        Carregando itens...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a120b] text-[#e8dcc5] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold border-b-2 border-amber-700 pb-2 mb-6">
          ⚔️ Gerenciar Itens
        </h1>

        {/* Mensagens */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded mb-6">
            ✅ {success}
          </div>
        )}

        {/* Formulário */}
        <div className="bg-[#2c2118] p-6 rounded-lg border border-amber-800/40 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-amber-400">
            {editingId ? '✏️ Editar' : '➕ Novo Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome (PT) *"
                value={namePt}
                onChange={(e) => setNamePt(e.target.value)}
                className="bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                required
              />
              <input
                type="text"
                placeholder="Unique Name * (ex: T4_HEAD_CLOTH_SET1)"
                value={uniqueName}
                onChange={(e) => setUniqueName(e.target.value)}
                className="bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                required
              />
              <input
                type="number"
                placeholder="Tier"
                value={tier}
                onChange={(e) => setTier(Number(e.target.value))}
                className="bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2"
                min="1"
                max="8"
              />
              <select
                value={slotType}
                onChange={(e) => setSlotType(e.target.value)}
                className="bg-[#3d2c1f] border border-amber-700 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="">Selecione o slot...</option>
                {slotOptions.slice(1).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-amber-700 hover:bg-amber-600 text-[#1a120b] font-bold px-6 py-2 rounded"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 🔍 BARRA DE BUSCA E FILTROS */}
        <div className="bg-[#2c2118] p-4 rounded-lg border border-amber-800/40 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="🔍 Buscar por nome ou unique name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#3d2c1f] border border-amber-700 rounded px-4 py-2 text-[#e8dcc5] placeholder:text-amber-800/50 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="bg-[#3d2c1f] border border-amber-700 rounded px-4 py-2 text-[#e8dcc5] focus:outline-none focus:border-amber-500"
              >
                {slotOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSlot('');
              }}
              className="bg-amber-700 hover:bg-amber-600 text-[#1a120b] font-bold px-4 py-2 rounded"
            >
              Limpar Filtros
            </button>
          </div>
          <div className="text-sm text-amber-500/60 mt-3">
            Mostrando {filteredItems.length} de {items.length} itens
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-[#2c2118] rounded-lg border border-amber-800/40 overflow-hidden">
          <h2 className="text-xl font-semibold p-4 border-b border-amber-800/40">
            📦 Itens Cadastrados
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#3d2c1f] text-amber-300">
                <tr>
                  <th className="p-3 text-left">Ícone</th>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Nome</th>
                  <th className="p-3 text-left">Unique Name</th>
                  <th className="p-3 text-left">Tier</th>
                  <th className="p-3 text-left">Slot</th>
                  <th className="p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-amber-500/60">
                      {searchTerm || selectedSlot ? 'Nenhum item encontrado com os filtros' : 'Nenhum item cadastrado'}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-amber-800/20 hover:bg-[#3d2c1f]/50">
                      <td className="p-3">
                        <img
                          src={getItemIconUrl(item.unique_name, 40)}
                          alt={item.name_pt}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=?';
                          }}
                        />
                      </td>
                      <td className="p-3">{item.id}</td>
                      <td className="p-3 font-medium">{item.name_pt}</td>
                      <td className="p-3 font-mono text-xs">{item.unique_name}</td>
                      <td className="p-3">T{item.tier}</td>
                      <td className="p-3">{item.slot_type || '-'}</td>
                      <td className="p-3 space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-amber-600 hover:bg-amber-500 text-[#1a120b] px-3 py-1 rounded text-xs font-bold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name_pt)}
                          className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
