import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            role?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role?: string | null;
        accessToken?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role?: string | null;
        accessToken?: string;
    }
}
