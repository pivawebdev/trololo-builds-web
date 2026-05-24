import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // TODO: trocar o código por uma sessão usando o Supabase
    console.log('Código recebido:', code);
  }

  return NextResponse.redirect(new URL('/admin/itens', requestUrl.origin));
}
