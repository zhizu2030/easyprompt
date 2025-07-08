import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = context.params;
  const key = await prisma.apiKey.findUnique({ where: { id } });
  if (!key || key.userId !== session.user.id) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  await prisma.apiKey.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 