import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log('[APIKEY/GET] 未登录');
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  // 只查询当前用户 isAuto=false 的 apikey
  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, isAuto: false },
    orderBy: { createdAt: "desc" },
  });
  console.log('[APIKEY/GET] 查询 userId:', session.user.id, 'isAuto=false, 返回数量:', keys.length, 'keys:', keys);
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  console.log("[API/POST] session.user.id:", session?.user?.id);
  const { remark, expiresAt } = await req.json();
  const key = nanoid();
  const data: any = { key, userId: session.user.id, isAuto: false };
  if (typeof remark === "string" && remark.trim() !== "") {
    data.remark = remark;
  }
  if (typeof expiresAt === "string" && expiresAt.trim() !== "") {
    data.expiresAt = new Date(expiresAt);
  }
  const apiKey = await prisma.apiKey.create({ data });
  console.log("[API/POST] created apiKey:", apiKey);
  return NextResponse.json(apiKey);
} 