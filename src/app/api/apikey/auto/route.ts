import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  let userId = undefined;
  // 优先从 query 获取 userId
  try {
    const url = new URL(req.url);
    userId = url.searchParams.get("userId");
  } catch {}
  // 其次从 session 获取
  if (!userId) {
    const session = await getServerSession(authOptions);
    userId = session?.user?.id;
    console.log("[APIKEY/AUTO] session.user.id:", userId);
  }
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const result = await prisma.apiKey.deleteMany({
    where: { userId, isAuto: true },
  });
  console.log("[APIKEY/AUTO] delete result:", result);
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  let userId = undefined;
  try {
    const url = new URL(req.url);
    userId = url.searchParams.get("userId");
  } catch {}
  if (!userId) {
    const session = await getServerSession(authOptions);
    userId = session?.user?.id;
  }
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const autoKey = await prisma.apiKey.findFirst({
    where: { userId, isAuto: true },
    orderBy: { createdAt: "desc" },
  });
  if (!autoKey) {
    return NextResponse.json({ error: "未找到自动 apikey" }, { status: 404 });
  }
  return NextResponse.json({ key: autoKey.key });
} 