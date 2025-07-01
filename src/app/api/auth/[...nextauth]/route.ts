import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";

interface ExtendedSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("请输入用户名和密码");
        }
        
        try {
          const user = await prisma.user.findUnique({
            where: { 
              name: credentials.username  // 使用用户名查找用户
            }
          });

          if (!user) {
            throw new Error("用户不存在");
          }

          if (user.password !== credentials.password) {
            throw new Error("密码错误");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24小时
  },
  pages: {
    signIn: "/login",
    error: "/login", // 添加错误页面重定向
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 强制断言 user 一定有 id 字段
      if (session.user) {
        (session.user as typeof session.user & { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 