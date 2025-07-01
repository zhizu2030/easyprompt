import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { title, content } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ message: "缺少参数" }, { status: 400 });
  }
  try {
    const prompt = await prisma.prompt.update({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.prompt.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    return NextResponse.json(
      { message: "删除失败" },
      { status: 500 }
    );
  }
} 