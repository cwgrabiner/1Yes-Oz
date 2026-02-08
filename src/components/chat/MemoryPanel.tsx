'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface MemoryItem {
  id: string;
  key: string;
  value: string;
  updated_at: string;
  status: string;
}

interface EditingItem {
  id: string;
  key: string;
  value: string;
}

export default function MemoryPanel() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErrorId, setDeleteErrorId] = useState<string | null>(null);

  useEffect(() => {
    if (!isCollapsed) {
      loadMemoryItems();
    }
  }, [isCollapsed]);

  const loadMemoryItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/memory');
      const data = await response.json();
      
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load memory');
      }

      setItems(data.data?.items || []);
    } catch (err) {
      console.error('Error loading memory items:', err);
      setError('Memory is temporarily unavailable. Please try again.');
      // Do not throw - allow chat to continue working
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: MemoryItem) => {
    setEditingItem({ id: item.id, key: item.key, value: item.value });
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const response = await fetch(`/api/memory/${editingItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: editingItem.key.trim(),
          value: editingItem.value.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Couldn't save changes. Try again?");
      }
      
      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...item, key: data.data.item.key, value: data.data.item.value, updated_at: data.data.item.updated_at }
            : item
        )
      );

      setSaveSuccess(true);
      setEditingItem(null);

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error saving memory item:', err);
      setSaveError(err instanceof Error ? err.message : "Couldn't save changes. Try again?");
      // Keep edit mode open with unsaved values
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this memory?')) {
      return;
    }

    // Optimistic update - remove from list immediately
    const originalItems = [...items];
    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeletingId(id);
    setDeleteErrorId(null);

    try {
      const response = await fetch(`/api/memory/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Couldn't delete. Try again?");
      }
    } catch (err) {
      console.error('Error deleting memory item:', err);
      // Restore item on error
      setItems(originalItems);
      setDeleteErrorId(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-zinc-200 transition-colors"
        >
          <span className={`transform transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>
            ▶
          </span>
          Memory
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-4">
          {isLoading && (
            <p className="text-xs text-zinc-500">Loading...</p>
          )}

          {error && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-400">{error}</p>
              <button
                onClick={loadMemoryItems}
                className="text-xs text-zinc-400 transition-colors duration-200 hover:text-zinc-300 underline"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <p className="text-xs text-zinc-500">No memories saved yet.</p>
          )}

          {!isLoading && !error && items.length > 0 && (
            <div className="space-y-4">
              {items.map((item) => {
                const isEditing = editingItem?.id === item.id;
                const isDeleting = deletingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="space-y-2 p-3 rounded border border-zinc-800 bg-[#1a1a1a] hover:border-green-500/50 transition-colors duration-200"
                  >
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Key</label>
                            <input
                              type="text"
                              value={editingItem.key}
                              onChange={(e) =>
                                setEditingItem({ ...editingItem, key: e.target.value })
                              }
                              disabled={isSaving}
                              className="w-full rounded border border-[#2a2a2a] bg-[#111111] px-2 py-1.5 text-xs text-zinc-300 placeholder-zinc-500 focus:border-[#16a34a]/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-zinc-400 mb-1">Value</label>
                            <input
                              type="text"
                              value={editingItem.value}
                              onChange={(e) =>
                                setEditingItem({ ...editingItem, value: e.target.value })
                              }
                              disabled={isSaving}
                              className="w-full rounded border border-[#2a2a2a] bg-[#111111] px-2 py-1.5 text-xs text-zinc-300 placeholder-zinc-500 focus:border-[#16a34a]/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50"
                            />
                          </div>
                        </div>
                        {saveError && (
                          <p className="text-xs text-red-400">{saveError}</p>
                        )}
                        {saveSuccess && (
                          <p className="text-xs text-green-400">Saved ✓</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            disabled={isSaving || !editingItem.key.trim() || !editingItem.value.trim()}
                            className="text-xs px-2 py-1 rounded bg-[#16a34a]/10 text-[#16a34a] hover:bg-[#16a34a]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="text-xs px-2 py-1 rounded bg-[#1a1a1a] text-zinc-400 hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-zinc-300">{item.key}:</span>
                              <span className="text-xs text-zinc-400 ml-1">{item.value}</span>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(item)}
                                disabled={isDeleting}
                                className="p-1.5 rounded text-zinc-400 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                aria-label="Edit memory"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={isDeleting}
                                className="p-1.5 rounded text-zinc-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                aria-label="Delete memory"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {formatDate(item.updated_at)}
                          </p>
                        </div>
                        {deleteErrorId === item.id && (
                          <div className="space-y-1">
                            <p className="text-xs text-red-400">Couldn't delete. Try again?</p>
                            <button
                              onClick={() => {
                                setDeleteErrorId(null);
                                handleDelete(item.id);
                              }}
                              className="text-xs text-red-400 transition-colors duration-200 hover:text-red-300 underline"
                            >
                              Retry
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
