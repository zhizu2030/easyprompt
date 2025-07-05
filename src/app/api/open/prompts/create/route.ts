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
  const { title, content } = body;
  if (!title || !content) {
    return NextResponse.json({ error: "title 和 content 必填" }, { status: 400 });
  }
  if (!check.key || !check.key.userId) {
    return NextResponse.json({ error: "API Key 无效或未绑定用户" }, { status: 401 });
  }
  const prompt = await prisma.prompt.create({
    data: {
      title,
      content,
      userId: check.key.userId,
    },
  });
  return NextResponse.json(prompt);
} 