import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { SessionStrategy, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

export const authOptions = {
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
        const user = await prisma.user.findUnique({
          where: { name: credentials.username }
        });
        if (!user) throw new Error("用户不存在");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("密码错误");
        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as typeof session.user & { id?: string }).id = token.id as string;
        console.log('[SESSION CALLBACK] user id:', token.id);
        if (token.id) {
          const autoKeys = await prisma.apiKey.findMany({
            where: { userId: token.id, isAuto: true },
          });
          console.log('[SESSION CALLBACK] found isAuto apikeys:', autoKeys.length);
          if (autoKeys.length === 0) {
            const newKey = await prisma.apiKey.create({
              data: {
                key: nanoid(),
                userId: token.id,
                isAuto: true,
                enabled: true,
                expiresAt: null,
              },
            });
            console.log('[SESSION CALLBACK] created new isAuto apikey:', newKey);
          }
        }
      }
      return session;
    },
  },
}; 