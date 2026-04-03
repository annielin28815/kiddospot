import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/src/lib/prisma";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt", // ⭐ 明確指定（避免混亂）
  },

  callbacks: {
    async jwt({ token, user }) {
      // 🟢 第一次登入（user 會存在）
      if (user) {
        token.userId = user.id; // ✅ 直接用 adapter 提供的 id（不用再查 DB）
      }

      return token;
    },

    async session({ session, token }) {
      // 🟢 把 userId 注入 session
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }

      return session;
    },
  },
};