import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('items')  // 👈 Tabela correta: items (com S)
    .select('*')
    .order('tier', { ascending: true });

  if (error) {
    console.error('Erro ao buscar itens:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await supabase
    .from('items')  // 👈 Tabela correta
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const body = await request.json();

  const { data, error } = await supabase
    .from('items')  // 👈 Tabela correta
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('items')  // 👈 Tabela correta
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'Item deletado com sucesso' });
}
