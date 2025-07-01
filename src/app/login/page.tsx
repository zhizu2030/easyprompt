"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGithub, FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const [username, setUsername] = useState("testuser");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push("/");
    } else {
      setError("用户名或密码错误");
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
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">登录账号</h2>
        <input
          className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-xl outline-none transition-all text-base"
          placeholder="用户名"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-xl outline-none transition-all text-base"
          placeholder="密码"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-500 text-white py-3 rounded-xl font-semibold text-lg shadow hover:from-blue-700 hover:to-purple-600 transition-all flex items-center justify-center gap-2 cursor-pointer">
          登录
        </button>
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs">或使用第三方登录</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <button type="button" className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold text-base shadow hover:bg-gray-800 transition-all cursor-pointer" onClick={() => signIn("github")}> <FaGithub size={20} /> GitHub 登录</button>
        <button type="button" className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-base shadow hover:bg-gray-50 transition-all cursor-pointer" onClick={() => signIn("google")}> <FaGoogle size={20} /> Google 登录</button>
        <div className="text-sm text-center mt-2 text-gray-500">
          没有账号？<a href="/register" className="text-blue-600 hover:underline ml-1 cursor-pointer">注册</a>
        </div>
      </form>
    </div>
  );
} 