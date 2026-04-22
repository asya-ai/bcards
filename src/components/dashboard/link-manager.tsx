"use client";

import { useState, useTransition, useEffect } from "react";
import { addLink, deleteLink, updateLink, reorderLinks } from "@/app/dashboard/actions";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  sortOrder: number;
}

export function LinkManager({ links: initialLinks }: { links: LinkItem[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState(initialLinks);
  const [isPending, startTransition] = useTransition();

  // Sync local state when server data changes (after revalidation)
  useEffect(() => {
    setItems(initialLinks);
  }, [initialLinks]);

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addLink(formData);
      setShowAdd(false);
    });
  }

  function handleUpdate(linkId: string, formData: FormData) {
    startTransition(async () => {
      await updateLink(linkId, formData);
      setEditingId(null);
    });
  }

  function handleDelete(linkId: string) {
    startTransition(async () => {
      await deleteLink(linkId);
      setItems((prev) => prev.filter((l) => l.id !== linkId));
    });
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setItems(newItems);
    startTransition(() => {
      reorderLinks(newItems.map((l) => l.id));
    });
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
    startTransition(() => {
      reorderLinks(newItems.map((l) => l.id));
    });
  }

  return (
    <div className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-font)]">Links</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="cursor-pointer rounded-lg bg-[var(--color-secondary-4)] px-4 py-2 text-sm font-medium text-[var(--color-font)] transition-colors hover:bg-[var(--color-secondary-5)]"
        >
          {showAdd ? "Cancel" : "+ Add Link"}
        </button>
      </div>

      {showAdd && (
        <form action={handleAdd} className="mb-4 rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="title" placeholder="Title (e.g. LinkedIn)" required className="rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] px-3 py-2 text-sm text-[var(--color-font)] outline-none focus:border-[var(--color-primary)]/50" />
            <input name="url" placeholder="https://..." required className="rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] px-3 py-2 text-sm text-[var(--color-font)] outline-none focus:border-[var(--color-primary)]/50" />
            <input name="icon" placeholder="Icon (optional)" className="rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] px-3 py-2 text-sm text-[var(--color-font)] outline-none focus:border-[var(--color-primary)]/50" />
          </div>
          <button type="submit" disabled={isPending} className="mt-3 cursor-pointer rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-font-contrast)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50">
            Add
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-font)]/40">No links yet. Add your first link above.</p>
      ) : (
        <div className="space-y-2">
          {items.map((link, i) => (
            <div key={link.id} className="flex items-center gap-2 rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] p-3">
              {editingId === link.id ? (
                <form action={(fd) => handleUpdate(link.id, fd)} className="flex flex-1 items-center gap-2">
                  <input name="title" defaultValue={link.title} required className="w-1/3 rounded border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] px-2 py-1 text-sm text-[var(--color-font)] outline-none" />
                  <input name="url" defaultValue={link.url} required className="flex-1 rounded border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] px-2 py-1 text-sm text-[var(--color-font)] outline-none" />
                  <input name="icon" defaultValue={link.icon ?? ""} className="w-20 rounded border border-[var(--color-secondary-5)] bg-[var(--color-secondary-2)] px-2 py-1 text-sm text-[var(--color-font)] outline-none" />
                  <button type="submit" className="cursor-pointer text-sm text-green-400 hover:text-green-300">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="cursor-pointer text-sm text-[var(--color-font)]/40 hover:text-[var(--color-font)]">Cancel</button>
                </form>
              ) : (
                <>
                  <div className="flex flex-1 items-center gap-3 overflow-hidden">
                    <span className="text-sm font-medium text-[var(--color-font)]">{link.title}</span>
                    <span className="truncate text-xs text-[var(--color-font)]/40">{link.url}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="cursor-pointer p-1 text-[var(--color-font)]/40 hover:text-[var(--color-font)] disabled:cursor-default disabled:opacity-20">↑</button>
                    <button onClick={() => moveDown(i)} disabled={i === items.length - 1} className="cursor-pointer p-1 text-[var(--color-font)]/40 hover:text-[var(--color-font)] disabled:cursor-default disabled:opacity-20">↓</button>
                    <button onClick={() => setEditingId(link.id)} className="cursor-pointer p-1 text-sm text-[var(--color-font)]/40 hover:text-[var(--color-primary)]">Edit</button>
                    <button onClick={() => handleDelete(link.id)} className="cursor-pointer p-1 text-sm text-[var(--color-font)]/40 hover:text-red-400">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}