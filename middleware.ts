import { NextResponse, type NextRequest } from 'next/server';

// ⚠️ IMPORTANTE: A função DEVE se chamar 'middleware' no Next.js 16
export function middleware(request: NextRequest) {
  // Verificar se é rota admin
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback';
  
  // Verificar cookie de sessão do Supabase
  const hasSession = request.cookies.has('sb-access-token') || 
                     request.cookies.has('sb-refresh-token') ||
                     request.cookies.has('supabase-auth-token');

  // Rotas públicas
  if (isAuthCallback) {
    return NextResponse.next();
  }

  // Proteger rotas admin
  if (isAdminPath && !hasSession && !isLoginPage) {
    const redirectUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Se já está logado e tenta acessar login, redireciona para admin
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/itens', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/callback'],
};