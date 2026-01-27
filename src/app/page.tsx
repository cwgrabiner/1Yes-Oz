import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import Shell from '@/components/Shell';

export default async function Home() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return <Shell />;
}
