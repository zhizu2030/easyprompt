import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();
    
    if (!username || !email || !password) {
      return NextResponse.json({ message: "缺少参数" }, { status: 400 });
    }

    const exist = await prisma.user.findFirst({
      where: { OR: [{ name: username }, { email }] },
    });

    if (exist) {
      return NextResponse.json({ message: "用户名或邮箱已存在" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: { name: username, email, password },
    });

    return NextResponse.json({ 
      message: "注册成功", 
      user: { id: user.id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "注册失败，请稍后重试" }, 
      { status: 500 }
    );
  }
} 