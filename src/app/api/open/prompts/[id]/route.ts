import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const prompt = await prisma.prompt.findUnique({
    where: { id: params.id },
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