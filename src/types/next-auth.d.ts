import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      preferredUsername?: string;
      isAdmin: boolean;
      isUser: boolean;
      groups: string[];
    };
  }
}