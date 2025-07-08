"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");
  const router = useRouter();

  const isValidEmail = (email: string) => {
    return /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleSendCode = async () => {
    setSendMsg("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSendMsg("验证码已发送，请查收邮箱");
      } else {
        const data = await res.json();
        setSendMsg(data.error || "发送失败");
      }
    } catch {
      setSendMsg("发送失败");
    }
    setSending(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, code }),
    });
    if (res.ok) {
      setSuccess("注册成功，请登录");
      setTimeout(() => router.push("/login"), 1000);
    } else {
      const data = await res.json();
      setError(data.message || "注册失败");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="flex flex-col items-center mb-8">
        <img src="/window.svg" alt="logo" className="w-16 h-16 mb-2" />
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-1">EasyPrompt</h1>
        <p className="text-gray-500 text-sm">AI 提示词管理平台</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm p-10 bg-white rounded-3xl shadow-2xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">注册账号</h2>
        <input
          className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-xl outline-none transition-all text-base"
          placeholder="用户名"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-xl outline-none transition-all text-base"
          placeholder="邮箱"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-xl outline-none transition-all text-base"
            placeholder="验证码"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold text-base shadow hover:bg-blue-600 transition-all disabled:bg-gray-300"
            onClick={handleSendCode}
            disabled={sending || !isValidEmail(email)}
          >
            {sending ? "发送中..." : "发送验证码"}
          </button>
        </div>
        {sendMsg && <div className="text-sm text-center text-gray-500">{sendMsg}</div>}
        <input
          className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-xl outline-none transition-all text-base"
          placeholder="密码"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
        <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-500 text-white py-3 rounded-xl font-semibold text-lg shadow hover:from-blue-700 hover:to-purple-600 transition-all flex items-center justify-center gap-2 cursor-pointer">
          注册
        </button>
        <div className="text-sm text-center mt-2 text-gray-500">
          已有账号？<a href="/login" className="text-blue-600 hover:underline ml-1 cursor-pointer">登录</a>
        </div>
      </form>
    </div>
  );
} 