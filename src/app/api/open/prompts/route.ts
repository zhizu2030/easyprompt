import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/requireApiKey";

export async function GET(req: NextRequest) {
  const check = await requireApiKey(req);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
  if (!check.key || !check.key.userId) {
    return NextResponse.json({ error: "API Key 无效或未绑定用户" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
          ],
        }
      : {}),
    userId: check.key.userId,
  };

  const [total, prompts] = await Promise.all([
    prisma.prompt.count({ where }),
    prisma.prompt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        userId: true,
      },
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    prompts,
  });
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = '[无法解析JSON]';
  }

  const check = await requireApiKey(req);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
  if (!check.key || !check.key.userId) {
    return NextResponse.json({ error: "API Key 无效或未绑定用户" }, { status: 401 });
  }

  const q = body.q || "";
  const page = parseInt(body.page || "1", 10);
  const pageSize = parseInt(body.pageSize || "20", 10);

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
          ],
        }
      : {}),
    userId: check.key.userId,
  };

  const [total, prompts] = await Promise.all([
    prisma.prompt.count({ where }),
    prisma.prompt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        userId: true,
      },
    }),
  ]);

  return NextResponse.json({
    total,
    page,
    pageSize,
    prompts,
  });
} 