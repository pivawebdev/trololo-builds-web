import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rotas protegidas
  const protectedPaths = ['/admin']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  const isLoginPage = request.nextUrl.pathname === '/admin/login'
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback'

  if (isAuthCallback) {
    return response
  }

  if (isProtectedPath && !user && !isLoginPage) {
    const redirectUrl = new URL('/admin/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/itens', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/auth/callback'],
}