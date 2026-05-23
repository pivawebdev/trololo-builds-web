import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Buscar build específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // 👈 Aguardar a Promise
    
    const { data, error } = await supabase
      .from('saved_builds')
      .select(`
        *,
        build_categories!saved_builds_category_id_fkey (
          name,
          emoji,
          description
        )
      `)
      .eq('id', parseInt(id))
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}