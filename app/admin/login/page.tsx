'use client';

import { useState } from 'react';

export default function AdminLoginPage() {
  const [clicked, setClicked] = useState(false);

  const handleLogin = () => {
    setClicked(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const redirectTo = `${window.location.origin}/auth/callback`;
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=discord&redirect_to=${encodeURIComponent(redirectTo)}`;
    window.location.href = authUrl;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1a120b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#2c2118', borderRadius: '12px', border: '1px solid #854d0e', padding: '32px', maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fbbf24' }}>🔐 Admin</h1>
          <p style={{ color: '#d97706', marginTop: '8px' }}>Autentique-se com Discord</p>
        </div>
        <button
          onClick={handleLogin}
          disabled={clicked}
          style={{
            width: '100%',
            background: '#5865F2',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: clicked ? 'not-allowed' : 'pointer',
            opacity: clicked ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.164-.386-.398-.875-.608-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.045-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          {clicked ? 'Redirecionando...' : 'Entrar com Discord'}
        </button>
      </div>
    </div>
  );
}
