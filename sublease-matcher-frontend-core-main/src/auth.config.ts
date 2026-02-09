import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { apiClient } from "@/lib/api-client";

export const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        try {
          const { user, token } = await apiClient.auth.login({
            email: credentials.email,
            password: credentials.password,
          });

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
            role: user.role,
            accessToken: token, // Pass token to jwt callback
          };
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // First login, user object is available
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
        token.role = (user as any).role;
      }

      // Handle session update
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | null | undefined;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
