import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const key = await prisma.apiKey.findUnique({ where: { id } });
  if (!key || key.userId !== session.user.id) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }
  await prisma.apiKey.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 