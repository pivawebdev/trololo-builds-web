'use client'
import { createClient } from '@/lib/supabase/client'

export default function LoginButton() {
  const supabase = createClient()

  const loginWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
  }

  return <button onClick={loginWithDiscord}>Entrar com Discord</button>
}
