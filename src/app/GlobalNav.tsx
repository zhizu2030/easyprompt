"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, getSession } from "next-auth/react";
import { useApiKey } from "./ApiKeyProvider";

export default function GlobalNav() {
  const pathname = usePathname();
  const showNav = !!pathname && !pathname.startsWith('/docs') && !pathname.startsWith('/login');
  const apiKey = useApiKey();
  const router = useRouter();

  const handleSignOut = async () => {
    const userId = localStorage.getItem("easyprompt_userId");
    if (userId) {
      try {
        await fetch(`/api/apikey/auto?userId=${userId}`, { method: "DELETE", credentials: "include" });
      } catch {}
    }
    localStorage.removeItem("easyprompt_auto_apikey");
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  const handleOpenDocs = async () => {
    // 优先获取最新 isAuto=true 的 apikey
    let latestApiKey = apiKey;
    try {
      const res = await fetch("/api/apikey/auto", { credentials: "include" });
      const data = await res.json();
      if (data?.key) {
        latestApiKey = data.key;
        localStorage.setItem("easyprompt_apikey", data.key);
      }
    } catch {}
    if (latestApiKey) {
      window.open(`/docs/index.html?api_key=${latestApiKey}`, "_blank");
    } else {
      window.open("/docs/index.html", "_blank");
    }
  };

  if (!showNav) return null;
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 text-xl font-bold text-gray-800 focus:outline-none hover:opacity-80"
            onClick={() => router.push("/")}
            title="返回首页"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <img src="/window.svg" alt="logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-800">EasyPrompt</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-blue-600">首页</Link>
          <Link href="/apikey" className="text-gray-600 hover:text-blue-600">API Key管理</Link>
          <a
            href="#"
            onClick={e => { e.preventDefault(); handleOpenDocs(); }}
            className="text-blue-600 hover:text-blue-800"
            rel="noopener noreferrer"
          >API文档</a>
          <button
            onClick={handleSignOut}
            className="ml-2 px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-base font-medium"
            title="退出登录"
          >
            退出登录
          </button>
        </div>
      </nav>
      <div style={{ height: 64 }} />
    </>
  );
} 