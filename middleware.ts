import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Verificar se é rota admin
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  
  // Verificar cookie de sessão (simplificado)
  const hasSession = request.cookies.has('sb-access-token') || 
                     request.cookies.has('sb-refresh-token');

  if (isAdminPath && !hasSession && !isLoginPage) {
    const redirectUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};