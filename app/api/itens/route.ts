import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Parâmetros de filtro
    const search = searchParams.get('search') || '';
    const slotType = searchParams.get('slot_type') || '';
    const tier = searchParams.get('tier') ? parseInt(searchParams.get('tier')!) : null;
    const category = searchParams.get('category') || '';
    
    console.log('🔍 Filtros:', { page, limit, search, slotType, tier, category });
    
    // Construir query base
    let query = supabase
      .from('items')
      .select('*', { count: 'exact' });
    
    // Aplicar filtros
    if (search) {
      query = query.or(`name_pt.ilike.%${search}%,unique_name.ilike.%${search}%`);
    }
    
    if (slotType) {
      query = query.eq('slot_type', slotType);
    }
    
    if (tier) {
      query = query.eq('tier', tier);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    // Aplicar paginação e ordenação
    query = query
      .order('tier', { ascending: true })
      .order('name_pt', { ascending: true })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('❌ Erro Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`✅ Encontrados ${count} itens, retornando ${data?.length}`);
    
    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
    
  } catch (error: any) {
    console.error('❌ Erro inesperado:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 POST /api/itens - Dados:', body);
    
    if (!body.unique_name || !body.name_pt) {
      return NextResponse.json(
        { error: 'Campos unique_name e name_pt são obrigatórios' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('items')
      .insert({
        unique_name: body.unique_name,
        name_pt: body.name_pt,
        tier: body.tier || 4,
        slot_type: body.slot_type || null,
        enchantment: body.enchantment || 0,
        category: body.category || null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `O unique_name "${body.unique_name}" já existe` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Item criado:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
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
        enchantment: body.enchantment || 0,
        category: body.category || null
      })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('✅ Item atualizado:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
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
    
    console.log('✅ Item deletado');
    return NextResponse.json({ message: 'Item deletado com sucesso' });
  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
