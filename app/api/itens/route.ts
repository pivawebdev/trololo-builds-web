import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET - Listar todos os itens
export async function GET() {
  try {
    console.log('📦 GET /api/itens - Buscando itens...');
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Erro Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`✅ Encontrados ${data?.length || 0} itens`);
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar novo item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 POST /api/itens - Dados recebidos:', body);
    
    // Validação
    if (!body.unique_name || !body.name_pt) {
      return NextResponse.json(
        { error: 'Campos unique_name e name_pt são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Inserir no banco
    const { data, error } = await supabase
      .from('items')
      .insert({
        unique_name: body.unique_name,
        name_pt: body.name_pt,
        tier: body.tier || 4,
        slot_type: body.slot_type || null,
        enchantment: body.enchantment || 0
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir:', error);
      
      // Se for erro de duplicata
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `O unique_name "${body.unique_name}" já existe` },
          { status: 409 }
        );
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Item criado com sucesso:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Atualizar item
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    console.log(`✏️ PUT /api/itens?id=${id} - Dados:`, body);
    
    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('items')
      .update({
        name_pt: body.name_pt,
        unique_name: body.unique_name,
        tier: body.tier,
        slot_type: body.slot_type,
        enchantment: body.enchantment || 0
      })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar:', error);
      
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `O unique_name "${body.unique_name}" já existe em outro item` },
          { status: 409 }
        );
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Item atualizado:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deletar item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log(`🗑️ DELETE /api/itens?id=${id}`);
    
    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('❌ Erro ao deletar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Item deletado com sucesso');
    return NextResponse.json({ message: 'Item deletado com sucesso' });
  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
