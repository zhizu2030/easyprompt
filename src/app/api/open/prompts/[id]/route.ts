import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const prompt = await prisma.prompt.findUnique({
    where: { id: id },
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