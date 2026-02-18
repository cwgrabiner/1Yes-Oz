import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getWizard } from '@/lib/wizard/registry';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: session, error } = await supabase
    .from('tool_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const wizard = getWizard(session.tool_name);
  if (!wizard) return NextResponse.json({ error: 'Wizard not found' }, { status: 400 });

  return NextResponse.json({
    sessionId: session.id,
    currentStep: session.current_step,
    totalSteps: wizard.totalSteps,
    status: session.status,
    step: wizard.steps[session.current_step],
    sessionData: session.session_data
  });
}
