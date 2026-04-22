import { signIn } from "@/lib/auth";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-secondary-1)]">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-secondary-2)] p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-font)]">bcard.asya.ai</h1>
          <p className="mt-2 text-sm text-[var(--color-font)]/60">
            Sign in to manage your business card
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("authentik", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-[var(--color-primary)] px-4 py-3 font-semibold text-[var(--color-font-contrast)] transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Sign in with SSO
          </button>
        </form>
      </div>
    </div>
  );
}