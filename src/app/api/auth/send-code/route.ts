import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "邮箱不能为空" }, { status: 400 });
  }
  // 生成6位验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟有效
  // 存入数据库
  await prisma.emailCode.create({
    data: { email, code, expiresAt },
  });
  // 发送邮件
  try {
    await resend.emails.send({
      from: "458260038@qq.com",
      to: email,
      subject: "您的验证码",
      html: `<p>您的验证码是 <b>${code}</b>，5分钟内有效。</p>`,
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "邮件发送失败" }, { status: 500 });
  }
} 