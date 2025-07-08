import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, code } = await req.json();
    if (!username || !email || !password || !code) {
      return NextResponse.json({ message: "缺少参数" }, { status: 400 });
    }
    // 校验验证码
    const emailCode = await prisma.emailCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!emailCode) {
      return NextResponse.json({ message: "验证码无效或已过期" }, { status: 400 });
    }
    // 标记验证码已用
    await prisma.emailCode.update({ where: { id: emailCode.id }, data: { used: true } });
    const exist = await prisma.user.findFirst({
      where: { OR: [{ name: username }, { email }] },
    });
    if (exist) {
      return NextResponse.json({ message: "用户名或邮箱已存在" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: username, email, password: hashedPassword },
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