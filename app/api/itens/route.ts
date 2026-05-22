import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// GET: Listar itens
export async function GET() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('tier', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

// POST: Criar item
export async function POST(request: Request) {
  const body = await request.json()
  const { data, error } = await supabase
    .from('items')
    .insert([body])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

// PUT: Atualizar item
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()

  const { data, error } = await supabase
    .from('items')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

// DELETE: Remover item
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ message: 'Item deletado com sucesso' })
}
