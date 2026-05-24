'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin/login');
        return;
      }

      // Lista de emails autorizados (você pode adicionar mais)
      const authorizedEmails = [
        'seu-email@exemplo.com',
        'admin@trololo.com',
        // Adicione os emails dos membros da sua guilda aqui
      ];
      
      if (user.email && authorizedEmails.includes(user.email)) {
        setIsAuthorized(true);
      } else if (user.user_metadata?.provider_id) {
        // Alternativa: verificar pelo ID do Discord
        const authorizedDiscordIds = ['123456789', '987654321'];
        if (authorizedDiscordIds.includes(user.user_metadata.provider_id)) {
          setIsAuthorized(true);
        } else {
          await supabase.auth.signOut();
          router.push('/admin/login?error=unauthorized');
        }
      } else {
        await supabase.auth.signOut();
        router.push('/admin/login?error=unauthorized');
      }
      
      setLoading(false);
    };

    checkAdmin();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a120b] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-amber-500" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}