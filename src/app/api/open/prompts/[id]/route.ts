import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/requireApiKey";

export async function GET(
  request: NextRequest,
  context: any
) {
  const check = await requireApiKey(request);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
  const { id } = context.params;
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
    return NextResponse.json({ message: "Prompt not found" }, { status: 404 });
  }
  return NextResponse.json(prompt);
}

export async function PATCH(req: NextRequest, context: any) {
  const check = await requireApiKey(req);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
  const id = context.params.id;
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { title, content } = body;
  if (!title && !content) {
    return NextResponse.json({ error: "title 或 content 必须有一个" }, { status: 400 });
  }
  if (!check.key || !check.key.userId) {
    return NextResponse.json({ error: "API Key 无效或未绑定用户" }, { status: 401 });
  }
  // 校验权限
  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt) return NextResponse.json({ error: "Prompt 不存在" }, { status: 404 });
  if (prompt.userId !== check.key.userId) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const updated = await prisma.prompt.update({
    where: { id },
    data: { ...(title && { title }), ...(content && { content }) },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: any) {
  const check = await requireApiKey(req);
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });
  const id = context.params.id;
  if (!check.key || !check.key.userId) {
    return NextResponse.json({ error: "API Key 无效或未绑定用户" }, { status: 401 });
  }
  // 校验权限
  const prompt = await prisma.prompt.findUnique({ where: { id } });
  if (!prompt) return NextResponse.json({ error: "Prompt 不存在" }, { status: 404 });
  if (prompt.userId !== check.key.userId) return NextResponse.json({ error: "无权限" }, { status: 403 });
  await prisma.prompt.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 