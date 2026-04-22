"use client";

import Image from "next/image";
import { updateProfileForUser } from "@/app/dashboard/actions";
import { useTransition, useState, useRef } from "react";
import { AvatarCropModal } from "./avatar-crop-modal";

interface User {
  id: string;
  username: string;
  displayName: string;
  jobTitle: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  redirectUrl: string | null;
  contactFormEnabled: boolean;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  sortOrder: number;
}

function toOptimizedAvatarUrl(avatarUrl: string | null): string {
  if (!avatarUrl) return "";

  if (avatarUrl.startsWith("/api/avatar/")) return avatarUrl;

  if (avatarUrl.startsWith("/uploads/")) {
    return `/api/avatar/${avatarUrl.replace("/uploads/", "")}`;
  }

  return `/api/avatar/${encodeURIComponent(avatarUrl)}`;
}

export function AdminEditForm({ user, links }: { user: User; links: LinkItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleCropped(blob: Blob) {
    setCropSrc(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Upload failed");
        return;
      }
      const { url } = await res.json();
      setAvatarPreview(url);
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(formData: FormData) {
    formData.set("avatarUrl", avatarPreview);
    startTransition(() => {
      updateProfileForUser(user.id, formData);
    });
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-6">
        <h2 className="mb-6 text-lg font-semibold text-[var(--color-font)]">Profile</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[var(--color-font)]/80">Username (URL slug)</label>
            <p className="mt-1 rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)]/50 px-4 py-2.5 text-sm text-[var(--color-font)]/50">/{user.username}</p>
          </div>
          <Field label="Display Name" name="displayName" defaultValue={user.displayName} />
          <Field label="Job Title" name="jobTitle" defaultValue={user.jobTitle ?? ""} />
          <Field label="Company" name="company" defaultValue={user.company ?? ""} />
          <Field label="Email" name="email" type="email" defaultValue={user.email ?? ""} />
          <Field label="Phone" name="phone" type="tel" defaultValue={user.phone ?? ""} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--color-font)]/80">Profile Picture</label>
            <div className="mt-2 flex items-center gap-4">
              {avatarPreview ? (
                <Image
                  src={toOptimizedAvatarUrl(avatarPreview)}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full border border-[var(--color-secondary-5)] object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)]">
                  <span className="text-lg font-bold text-[var(--color-primary)]">
                    {user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                  className="cursor-pointer rounded-lg bg-[var(--color-secondary-4)] px-4 py-2 text-sm font-medium text-[var(--color-font)] transition-colors hover:bg-[var(--color-secondary-5)] disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview("")}
                    className="cursor-pointer text-xs text-red-400/60 hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              {cropSrc && (
                <AvatarCropModal
                  imageSrc={cropSrc}
                  onCropped={handleCropped}
                  onCancel={() => setCropSrc(null)}
                />
              )}
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-[var(--color-font)]/50">Or paste an image URL</label>
              <input
                type="text"
                value={avatarPreview}
                onChange={(e) => setAvatarPreview(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-4 py-2 text-sm text-[var(--color-font)] outline-none transition-colors focus:border-[var(--color-primary)]/50"
              />
            </div>
            <input type="hidden" name="avatarUrl" value={avatarPreview} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--color-font)]/80">Bio</label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={user.bio ?? ""}
              className="mt-1 w-full resize-none rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-4 py-2.5 text-sm text-[var(--color-font)] outline-none transition-colors focus:border-[var(--color-primary)]/50"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--color-secondary-4)] pt-6">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-font)]">Options</h3>
          <div className="space-y-4">
            <Field
              label="Redirect URL (overrides card)"
              name="redirectUrl"
              defaultValue={user.redirectUrl ?? ""}
            />
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="contactFormEnabled"
                id="contactFormEnabled"
                defaultChecked={user.contactFormEnabled}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              <label htmlFor="contactFormEnabled" className="text-sm text-[var(--color-font)]/80">
                Enable contact form
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="cursor-pointer rounded-lg bg-[var(--color-primary)] px-6 py-2.5 font-semibold text-[var(--color-font-contrast)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Links display */}
      <div className="rounded-xl border border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-font)]">Links ({links.length})</h2>
        {links.length === 0 ? (
          <p className="text-sm text-[var(--color-font)]/40">No links.</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center gap-3 rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] p-3">
                <span className="text-sm font-medium text-[var(--color-font)]">{link.title}</span>
                <span className="truncate text-xs text-[var(--color-font)]/40">{link.url}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-font)]/80">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-[var(--color-secondary-5)] bg-[var(--color-secondary-3)] px-4 py-2.5 text-sm text-[var(--color-font)] outline-none transition-colors focus:border-[var(--color-primary)]/50"
      />
    </div>
  );
}