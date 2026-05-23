import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Listar builds
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const guildId = searchParams.get('guild_id') || '';

    let query = supabase
      .from('saved_builds')
      .select(`
        *,
        build_categories!saved_builds_category_id_fkey (
          name,
          emoji,
          description
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('build_name', `%${search}%`);
    }
    if (category) {
      query = query.eq('category_id', parseInt(category));
    }
    if (guildId) {
      query = query.eq('guild_id', guildId);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error: any) {
    console.error('Erro:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar build
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos obrigatórios
    if (!body.build_name || !body.guild_id || !body.creator_id) {
      return NextResponse.json(
        { error: 'build_name, guild_id e creator_id são obrigatórios' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('saved_builds')
      .insert({
        build_name: body.build_name,
        guild_id: body.guild_id,
        creator_id: body.creator_id,
        weapon_item: body.weapon_item || null,
        head_item: body.head_item || null,
        armor_item: body.armor_item || null,
        shoes_item: body.shoes_item || null,
        cape_item: body.cape_item || null,
        category_id: body.category_id || null
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Atualizar build
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('saved_builds')
      .update({
        build_name: body.build_name,
        weapon_item: body.weapon_item,
        head_item: body.head_item,
        armor_item: body.armor_item,
        shoes_item: body.shoes_item,
        cape_item: body.cape_item,
        category_id: body.category_id
      })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deletar build
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    const { error } = await supabase
      .from('saved_builds')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
    return NextResponse.json({ message: 'Build deletada com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}