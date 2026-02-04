import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      const email = (profile as { email?: string } | null)?.email;
      if (email) token.email = email;
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.email === "string") {
        (session.user as { email?: string }).email = token.email;
      }
      return session;
    },
  },
};
