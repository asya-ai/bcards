"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  user: {
    name?: string | null;
    isAdmin: boolean;
  };
}

export function DashboardNav({ user }: NavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "My Card" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/submissions", label: "Messages" },
    ...(user.isAdmin
      ? [
          { href: "/dashboard/admin", label: "All Cards" },
          { href: "/dashboard/admin/settings", label: "Settings" },
        ]
      : []),
  ];

  return (
    <nav className="border-b border-[var(--color-secondary-4)] bg-[var(--color-secondary-2)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-[var(--color-primary)]">
            bcard
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-[var(--color-secondary-4)] text-[var(--color-font)]"
                    : "text-[var(--color-font)]/60 hover:text-[var(--color-font)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-font)]/60">{user.name}</span>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-[var(--color-font)]/60 transition-colors hover:text-[var(--color-font)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}