import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: "authentik",
      name: "Authentik",
      type: "oidc",
      issuer: process.env.AUTH_OIDC_ISSUER,
      clientId: process.env.AUTH_OIDC_CLIENT_ID,
      clientSecret: process.env.AUTH_OIDC_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email groups",
        },
      },
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          groups: profile.groups ?? [],
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.sub = profile.sub ?? undefined;
        token.groups = (profile as Record<string, unknown>).groups ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      const groupUser = process.env.GROUP_USER ?? "user";
      const groupAdmin = process.env.GROUP_ADMIN ?? "admin";
      const groups = (token.groups as string[]) ?? [];

      session.user.id = token.sub!;
      session.user.isAdmin = groups.includes(groupAdmin);
      session.user.isUser = groups.includes(groupUser) || session.user.isAdmin;
      session.user.groups = groups;

      return session;
    },
    async authorized({ auth }) {
      return !!auth?.user;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);