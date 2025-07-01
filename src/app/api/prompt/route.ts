import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function GET() {
  const prompts = await prisma.prompt.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ prompts });
}

export async function POST(req: NextRequest) {
  const { title, content, userId } = await req.json();
  if (!title || !content || !userId) {
    return NextResponse.json({ message: "缺少参数" }, { status: 400 });
  }
  const prompt = await prisma.prompt.create({ data: { title, content, userId } });
  return NextResponse.json({ prompt });
} 