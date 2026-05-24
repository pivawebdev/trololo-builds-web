'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin/login');
        setLoading(false);
        return;
      }

      // Lista de emails autorizados
      const authorizedEmails = [
        'seu-email@exemplo.com',  // Substitua pelo seu email do Discord
      ];
      
      if (user.email && authorizedEmails.includes(user.email)) {
        setIsAuthorized(true);
      } else {
        await supabase.auth.signOut();
        router.push('/admin/login?error=unauthorized');
      }
      
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a120b] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-amber-500" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}