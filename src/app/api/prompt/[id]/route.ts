import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { title, content } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ message: "缺少参数" }, { status: 400 });
  }
  try {
    const prompt = await prisma.prompt.update({
      where: { id },
      data: { title, content },
    });
    return NextResponse.json({ prompt });
  } catch (error) {
    return NextResponse.json(
      { message: "更新失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.prompt.delete({
      where: { id },
    });
    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    return NextResponse.json(
      { message: "删除失败" },
      { status: 500 }
    );
  }
} 