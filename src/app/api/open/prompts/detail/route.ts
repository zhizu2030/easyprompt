import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/requireApiKey";

export async function POST(req: NextRequest) {
  const check = await requireApiKey(req);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 });
  }
  const prompt = await prisma.prompt.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      userId: true,
    },
  });
  if (!prompt) {
    return NextResponse.json({ error: "Prompt 不存在" }, { status: 404 });
  }
  return NextResponse.json(prompt);
} 