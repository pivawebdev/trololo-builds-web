import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback';
  
  // Verificar cookie de sessão do Supabase
  const hasSession = request.cookies.has('sb-access-token') || 
                     request.cookies.has('sb-refresh-token');

  if (isAuthCallback) {
    return NextResponse.next();
  }

  if (isAdminPath && !hasSession && !isLoginPage) {
    const redirectUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/itens', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/callback'],
};