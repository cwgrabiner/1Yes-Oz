'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/');
        router.refresh();
      } else {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      // Redirect to home on success
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      // Show success message and switch to sign-in mode
      setError(null);
      setIsSignUp(false);
      setIsLoading(false);
      // Show success message
      alert('Account created successfully! Please sign in with your credentials.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111] text-[#f5f5f5]">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] text-[#f5f5f5]">
      <div className="w-full max-w-md space-y-6 rounded border border-[#2a2a2a] bg-[#1a1a1a] p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-300">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-sm text-zinc-500">
            {isSignUp
              ? 'Create a new account to get started'
              : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-zinc-400 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:border-[#16a34a]/30 focus:outline-none focus:ring-1 focus:ring-[#16a34a]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-zinc-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={isSignUp ? 6 : undefined}
              className="w-full rounded border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:border-[#16a34a]/30 focus:outline-none focus:ring-1 focus:ring-[#16a34a]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-zinc-500">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {error && (
            <div className="rounded bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-[#16a34a]/10 px-4 py-2 text-sm font-medium text-[#16a34a] transition-colors hover:bg-[#16a34a]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? isSignUp
                ? 'Creating account...'
                : 'Signing in...'
              : isSignUp
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setEmail('');
              setPassword('');
            }}
            disabled={isLoading}
            className="text-sm text-zinc-400 hover:text-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
