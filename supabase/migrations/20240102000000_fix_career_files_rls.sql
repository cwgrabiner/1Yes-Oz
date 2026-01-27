-- Fix RLS policy for career_files to allow INSERT operations
-- The original policy only had USING clause, which doesn't work for INSERT
-- INSERT operations require WITH CHECK clause

DROP POLICY IF EXISTS "Users can CRUD own career file" ON public.career_files;
CREATE POLICY "Users can CRUD own career file"
  ON public.career_files FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
