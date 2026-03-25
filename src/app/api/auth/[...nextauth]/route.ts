import NextAuth from "next-auth";
import { authOptions } from "@/src/lib/auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/src/lib/prisma";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // ⭐ 第一次登入時，把 user.id 存進 token
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // ⭐ 把 token.id 塞進 session.user.id
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
// const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };