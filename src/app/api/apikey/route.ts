import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
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
  // permissions 字段转为数组
  const keysWithPerms = keys.map((k: any) => ({ ...k, permissions: JSON.parse(k.permissions || '[]') }));
  console.log('[APIKEY/GET] 查询 userId:', session.user.id, 'isAuto=false, 返回数量:', keys.length, 'keys:', keysWithPerms);
  return NextResponse.json({ keys: keysWithPerms });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  console.log("[API/POST] session.user.id:", session?.user?.id);
  const { remark, expiresAt, permissions } = await req.json();
  const key = nanoid();
  const data: any = { key, userId: session.user.id, isAuto: false };
  if (typeof remark === "string" && remark.trim() !== "") {
    data.remark = remark;
  }
  if (typeof expiresAt === "string" && expiresAt.trim() !== "") {
    data.expiresAt = new Date(expiresAt);
  }
  // permissions 支持数组或字符串
  if (permissions) {
    data.permissions = Array.isArray(permissions) ? JSON.stringify(permissions) : permissions;
  } else {
    data.permissions = "[]";
  }
  const apiKey = await prisma.apiKey.create({ data });
  // 返回时解析 permissions
  const apiKeyWithPerms = { ...apiKey, permissions: JSON.parse(apiKey.permissions || '[]') };
  console.log("[API/POST] created apiKey:", apiKeyWithPerms);
  return NextResponse.json(apiKeyWithPerms);
} 