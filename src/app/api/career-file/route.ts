import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * GET /api/career-file
 * Fetch user's career file (create empty one if missing)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[GET /api/career-file] Starting request');
    const supabase = await supabaseServer();
    
    console.log('[GET /api/career-file] Getting authenticated user');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[GET /api/career-file] Auth error:', authError);
      console.error('[GET /api/career-file] User:', user);
      return NextResponse.json(
        { ok: false, error: 'Please sign in' },
        { status: 401 }
      );
    }

    console.log('[GET /api/career-file] User authenticated:', { id: user.id, email: user.email });

    // Ensure user exists in public.users table
    console.log('[GET /api/career-file] Ensuring user exists in public.users table');
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email ?? null,
      }, {
        onConflict: 'id',
      });

    if (upsertError) {
      console.error('[GET /api/career-file] Error upserting user:', upsertError);
    } else {
      console.log('[GET /api/career-file] User upserted successfully');
    }

    // Fetch existing career file
    console.log('[GET /api/career-file] Fetching existing career file for user:', user.id);
    const { data: existingFile, error: fetchError } = await supabase
      .from('career_files')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // No career file exists, create empty one
      console.log('[GET /api/career-file] No career file found (PGRST116), creating new one');
      const { data: newFile, error: createError } = await supabase
        .from('career_files')
        .insert({
          user_id: user.id,
          display_name: null,
          user_current_role: null,
          target_role: null,
          goals: null,
        })
        .select()
        .single();

      if (createError) {
        console.error('[GET /api/career-file] Error creating career file:', createError);
        console.error('[GET /api/career-file] Create error details:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
        });
        return NextResponse.json(
          { ok: false, error: `Failed to create career file: ${createError.message}` },
          { status: 500 }
        );
      }

      console.log('[GET /api/career-file] Career file created successfully:', newFile?.id);
      return NextResponse.json({ ok: true, data: { careerFile: newFile } });
    }

    if (fetchError) {
      console.error('[GET /api/career-file] Error fetching career file:', fetchError);
      console.error('[GET /api/career-file] Fetch error details:', {
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
      });
      return NextResponse.json(
        { ok: false, error: `Failed to fetch career file: ${fetchError.message}` },
        { status: 500 }
      );
    }

    console.log('[GET /api/career-file] Career file fetched successfully:', existingFile?.id);
    return NextResponse.json({ ok: true, data: { careerFile: existingFile } });
  } catch (error) {
    console.error('[GET /api/career-file] Unexpected error:', error);
    console.error('[GET /api/career-file] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/career-file
 * Update career file fields
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log('[PATCH /api/career-file] Starting request');
    const supabase = await supabaseServer();
    
    console.log('[PATCH /api/career-file] Getting authenticated user');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[PATCH /api/career-file] Auth error:', authError);
      console.error('[PATCH /api/career-file] User:', user);
      return NextResponse.json(
        { ok: false, error: 'Please sign in' },
        { status: 401 }
      );
    }

    console.log('[PATCH /api/career-file] User authenticated:', { id: user.id, email: user.email });

    const body = await request.json();
    console.log('[PATCH /api/career-file] Request body:', body);
    const { display_name, current_role, target_role, goals } = body;

    // Build update object with only provided fields
    // Map current_role from request body to user_current_role for database
    const updates: {
      display_name?: string | null;
      user_current_role?: string | null;
      target_role?: string | null;
      goals?: string | null;
    } = {};

    if ('display_name' in body) {
      updates.display_name = display_name === '' ? null : display_name?.trim() || null;
    }
    if ('current_role' in body) {
      updates.user_current_role = current_role === '' ? null : current_role?.trim() || null;
    }
    if ('target_role' in body) {
      updates.target_role = target_role === '' ? null : target_role?.trim() || null;
    }
    if ('goals' in body) {
      updates.goals = goals === '' ? null : goals?.trim() || null;
    }

    console.log('[PATCH /api/career-file] Updates to apply:', updates);

    // Ensure career file exists first
    console.log('[PATCH /api/career-file] Checking if career file exists for user:', user.id);
    const { data: existingFile, error: checkError } = await supabase
      .from('career_files')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[PATCH /api/career-file] Error checking for existing career file:', checkError);
      console.error('[PATCH /api/career-file] Check error details:', {
        code: checkError.code,
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
      });
    }

    let careerFile;

    if (!existingFile) {
      // Create new career file with updates
      console.log('[PATCH /api/career-file] No existing career file, creating new one with updates');
      const { data: newFile, error: createError } = await supabase
        .from('career_files')
        .insert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single();

      if (createError) {
        console.error('[PATCH /api/career-file] Error creating career file:', createError);
        console.error('[PATCH /api/career-file] Create error details:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint,
        });
        return NextResponse.json(
          { ok: false, error: `Failed to create career file: ${createError.message}` },
          { status: 500 }
        );
      }

      console.log('[PATCH /api/career-file] Career file created successfully:', newFile?.id);
      careerFile = newFile;
    } else {
      // Update existing career file
      console.log('[PATCH /api/career-file] Updating existing career file:', existingFile.id);
      const { data: updatedFile, error: updateError } = await supabase
        .from('career_files')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('[PATCH /api/career-file] Error updating career file:', updateError);
        console.error('[PATCH /api/career-file] Update error details:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        });
        return NextResponse.json(
          { ok: false, error: `Failed to update career file: ${updateError.message}` },
          { status: 500 }
        );
      }

      console.log('[PATCH /api/career-file] Career file updated successfully:', updatedFile?.id);
      careerFile = updatedFile;
    }

    return NextResponse.json({ ok: true, data: { careerFile } });
  } catch (error) {
    console.error('[PATCH /api/career-file] Unexpected error:', error);
    console.error('[PATCH /api/career-file] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
