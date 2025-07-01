"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function ApiKeyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="flex flex-col items-center mb-8">
        <img src="/window.svg" alt="logo" className="w-16 h-16 mb-2" />
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-1">API Key 管理</h1>
        <p className="text-gray-500 text-sm">在这里你可以管理你的 API Key，用于开放接口调用。</p>
      </div>
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
        <div className="text-center text-gray-400 py-8">（功能开发中，后续支持创建、禁用、删除、查看 API Key）</div>
      </div>
      <button
        className="mt-8 text-blue-600 hover:underline cursor-pointer bg-transparent border-none outline-none"
        onClick={() => router.push("/")}
      >
        返回首页
      </button>
    </div>
  );
} 