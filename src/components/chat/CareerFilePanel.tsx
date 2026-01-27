'use client';

import { useState, useEffect } from 'react';

interface CareerFile {
  id: string;
  display_name: string | null;
  user_current_role: string | null;
  target_role: string | null;
  goals: string | null;
}

export default function CareerFilePanel() {
  const [careerFile, setCareerFile] = useState<CareerFile | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    current_role: '',
    target_role: '',
    goals: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    loadCareerFile();
  }, []);

  const loadCareerFile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/career-file');
      const data = await response.json();
      
      if (!response.ok || !data.ok) {
        // Graceful degradation: use empty career file, chat works
        console.error('Failed to load career file:', data.error);
        setCareerFile(null);
        setFormData({
          display_name: '',
          current_role: '',
          target_role: '',
          goals: '',
        });
        return;
      }

      setCareerFile(data.data.careerFile);
      setFormData({
        display_name: data.data.careerFile.display_name || '',
        current_role: data.data.careerFile.user_current_role || '',
        target_role: data.data.careerFile.target_role || '',
        goals: data.data.careerFile.goals || '',
      });
    } catch (error) {
      // Graceful degradation: use empty career file, chat works
      console.error('Error loading career file:', error);
      setCareerFile(null);
      setFormData({
        display_name: '',
        current_role: '',
        target_role: '',
        goals: '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('idle');

      const response = await fetch('/api/career-file', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        console.error('Failed to save career file:', data.error);
        // Show error but keep form data for retry
        return;
      }

      setCareerFile(data.data.careerFile);
      setSaveStatus('saved');

      // Clear saved status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving career file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">Career File</h3>
        <p className="text-xs text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300">Career File</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Display Name</label>
          <input
            type="text"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            disabled={isSaving}
            className="w-full rounded border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:border-[#16a34a]/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Current Role</label>
          <input
            type="text"
            value={formData.current_role}
            onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
            disabled={isSaving}
            className="w-full rounded border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:border-[#16a34a]/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., Software Engineer"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Target Role</label>
          <input
            type="text"
            value={formData.target_role}
            onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
            disabled={isSaving}
            className="w-full rounded border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:border-[#16a34a]/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="e.g., Senior Product Manager"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Goals</label>
          <textarea
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            disabled={isSaving}
            rows={3}
            className="w-full rounded border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:border-[#16a34a]/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            placeholder="Your career goals..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded bg-green-600 px-3 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
        >
          {isSaving ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </div>
  );
}
