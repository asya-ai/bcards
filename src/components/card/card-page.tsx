import Image from "next/image";
import { ContactForm } from "./contact-form";
import { LinkButton } from "./link-button";
import { AddToContacts } from "./add-to-contacts";

interface CardUser {
  id: string;
  username: string;
  displayName: string;
  jobTitle: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  contactFormEnabled: boolean;
}

interface CardLink {
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

export function CardPage({ user, links }: { user: CardUser; links: CardLink[] }) {
  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-12 sm:py-20">
      <div className="relative z-10 w-full max-w-md">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          {user.avatarUrl ? (
            <Image
              src={toOptimizedAvatarUrl(user.avatarUrl)}
              alt={user.displayName}
              width={112}
              height={112}
              className="h-28 w-28 rounded-full border-2 border-[var(--color-primary)] object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-secondary-3)]">
              <span className="text-3xl font-bold text-[var(--color-primary)]">
                {user.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            </div>
          )}

          <h1 className="mt-5 text-2xl font-bold text-[var(--color-font)]">
            {user.displayName}
          </h1>

          {(user.jobTitle || user.company) && (
            <p className="mt-1 text-sm text-[var(--color-font)]/60">
              {[user.jobTitle, user.company].filter(Boolean).join(" · ")}
            </p>
          )}

          {user.bio && (
            <p className="mt-3 text-center text-sm leading-relaxed text-[var(--color-font)]/80">
              {user.bio}
            </p>
          )}
        </div>

        {/* Add to Contacts */}
        <div className="mt-8">
          <AddToContacts username={user.username} />
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div className="mt-3 space-y-3">
            {links.map((link) => (
              <LinkButton key={link.id} id={link.id} title={link.title} url={link.url} icon={link.icon} />
            ))}
          </div>
        )}

        {/* Contact Form */}
        {user.contactFormEnabled && (
          <div className="mt-8">
            <ContactForm username={user.username} />
          </div>
        )}
      </div>

      <Image
        src="/map.svg"
        alt=""
        aria-hidden="true"
        width={768}
        className="pointer-events-none fixed right-0 bottom-0 z-0 h-auto opacity-90"
      />
    </div>
  );
}