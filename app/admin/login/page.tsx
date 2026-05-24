'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          router.push('/admin/itens');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-[#1a120b] flex items-center justify-center p-4">
      <div className="bg-[#2c2118] rounded-xl border border-amber-800/40 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-400">🔐 Admin</h1>
          <p className="text-amber-500/60 mt-2">Autentique-se com Discord para acessar</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#fbbf24',
                  brandAccent: '#d97706',
                  brandButtonText: '#1a120b',
                  defaultButtonBackground: '#3d2c1f',
                  defaultButtonBackgroundHover: '#4a3827',
                },
              },
            },
          }}
          providers={['discord']}
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
          onlyThirdPartyProviders
        />

        <p className="text-xs text-amber-500/40 text-center mt-6">
          Apenas administradores autorizados podem acessar
        </p>
      </div>
    </div>
  );
}