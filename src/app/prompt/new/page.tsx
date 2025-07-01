"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function NewPromptPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<string | undefined>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title || !content) {
      setError("标题和内容不能为空");
      return;
    }
    if (!session?.user?.id) {
      setError("请先登录");
      return;
    }
    const res = await fetch("/api/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, userId: session.user.id }),
    });
    if (res.ok) {
      setSuccess("创建成功");
      setTimeout(() => router.push("/"), 1000);
    } else {
      const data = await res.json();
      setError(data.message || "创建失败");
    }
  };

  return (
    <div className="flex min-h-screen h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 items-center">
      {/* 左侧说明区 */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/5 h-full p-8 bg-white rounded-r-3xl shadow-2xl border-r border-gray-100">
        <img src="/window.svg" alt="logo" className="w-24 h-24 mb-8" />
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-800 mb-4">新建 Prompt</h1>
        <p className="text-gray-500 text-2xl text-center">填写你的 AI 提示词<br/>支持 <span className='font-bold text-blue-600'>Markdown</span> 格式</p>
      </div>
      {/* 右侧表单区 */}
      <div className="flex w-4/5 items-center justify-center p-8 h-full">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full max-w-4xl p-12 bg-white rounded-3xl shadow-2xl border border-gray-100">
          <input
            className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-4 rounded-xl outline-none transition-all text-2xl font-semibold"
            placeholder="标题"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="min-h-[480px]">
            <MDEditor
              value={content}
              onChange={setContent}
              height={480}
              preview="edit"
            />
          </div>
          {error && <div className="text-red-500 text-lg text-center">{error}</div>}
          {success && <div className="text-green-600 text-lg text-center">{success}</div>}
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-500 text-white py-4 rounded-xl font-bold text-2xl shadow hover:from-blue-700 hover:to-purple-600 transition-all flex items-center justify-center gap-2 cursor-pointer">
            创建
          </button>
          <div className="text-lg text-center mt-2 text-gray-500">
            <button
              type="button"
              className="text-blue-600 hover:underline ml-1 cursor-pointer bg-transparent border-none outline-none"
              onClick={() => {
                if (status === 'authenticated') {
                  router.push('/');
                } else {
                  router.push('/login');
                }
              }}
            >
              返回首页
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 