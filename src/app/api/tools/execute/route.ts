export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { executeTool } from '@/lib/tools/registry';
import { getTool } from '@/lib/tools/definitions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { toolName, params = {} } = await request.json();
    
    const tool = getTool(toolName);
    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    const validatedParams = tool.functionSchema.parameters.parse(params);
    
    const { data: careerFile } = await supabase
      .from('career_files')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    const { data: memories } = await supabase
      .from('memory_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    const result = await executeTool(toolName, validatedParams, {
      userId: user.id,
      careerFile: careerFile ? JSON.stringify(careerFile) : undefined,
      memories: memories || []
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Tool execution error:', error);
    
    const isDev = process.env.NODE_ENV === 'development';
    
    return NextResponse.json(
      { 
        error: 'Tool execution failed',
        ...(isDev && { details: error instanceof Error ? error.message : String(error) })
      },
      { status: 500 }
    );
  }
}
