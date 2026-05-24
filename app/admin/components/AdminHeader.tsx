'use client';

import { getSupabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AdminHeader({ title }: { title?: string }) {
  const router = useRouter();
  const supabase = getSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-amber-400">{title || '⚔️ Admin Panel'}</h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-800 hover:bg-red-700 px-4 py-2 rounded-lg transition"
      >
        <LogOut size={18} /> Sair
      </button>
    </div>
  );
}