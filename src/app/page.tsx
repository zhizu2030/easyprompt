"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiLogOut, FiUser } from "react-icons/fi";

interface Prompt {
  id: string;
  title: string;
  content: string;
}

export default function HomePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<'view' | 'create'>("view");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/prompt");
      const data = await res.json();
      setPrompts(data.prompts || []);
      if (data.prompts?.length > 0 && !selected) {
        setSelected(data.prompts[0]);
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    }
    setIsLoading(false);
  };

  const handleCreate = async () => {
    const res = await fetch("/api/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "新建提示词",
        content: "请输入提示词内容",
        userId: session?.user?.email
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setPrompts([data.prompt, ...prompts]);
      setSelected(data.prompt);
      setIsEditing(true);
      setEditTitle(data.prompt.title);
      setEditContent(data.prompt.content);
    }
  };

  const handleEdit = () => {
    if (!selected) return;
    setIsEditing(true);
    setEditTitle(selected.title);
    setEditContent(selected.content);
  };

  const handleSave = async () => {
    if (!selected) return;
    const res = await fetch(`/api/prompt/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent }),
    });
    if (res.ok) {
      const updatedPrompt = { ...selected, title: editTitle, content: editContent };
      setPrompts(prompts.map(p => p.id === selected.id ? updatedPrompt : p));
      setSelected(updatedPrompt);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !window.confirm("确定要删除这个提示词吗？")) return;
    const res = await fetch(`/api/prompt/${selected.id}`, { method: "DELETE" });
    if (res.ok) {
      const newPrompts = prompts.filter(p => p.id !== selected.id);
      setPrompts(newPrompts);
      setSelected(newPrompts[0] || null);
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/window.svg" alt="logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-800">EasyPrompt</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <FiUser className="w-4 h-4" />
            <span>{session?.user?.name}</span>
          </div>
          <button
            onClick={() => window.open('/apifox/index.html', '_blank')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
          >
            <span role="img" aria-label="api">📖</span>
            API文档
          </button>
          <button
            onClick={() => router.push("/apikey")}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <span role="img" aria-label="key">🔑</span>
            API Key管理
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧列表 */}
        <div className="w-1/3 min-w-[280px] max-w-md border-r bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">提示词列表</h2>
            <button
              onClick={() => {
                setMode('create');
                setSelected(null);
                setEditTitle("");
                setEditContent("");
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              新建
            </button>
          </div>
          <div className="p-4 pb-0">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              placeholder="搜索标题或内容..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="p-4 space-y-2 overflow-y-auto" style={{ height: "calc(100vh - 8rem)" }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              (() => {
                const filtered = prompts.filter(p =>
                  p.title.toLowerCase().includes(search.toLowerCase()) ||
                  p.content.toLowerCase().includes(search.toLowerCase())
                );
                if (filtered.length === 0) {
                  return <div className="text-center py-8 text-gray-400">暂无匹配结果</div>;
                }
                return filtered.map(p => (
                  <div
                    key={p.id}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      selected?.id === p.id
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : "hover:bg-gray-50 border-transparent"
                    } border`}
                    onClick={() => setSelected(p)}
                  >
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <div className="mt-1 text-sm text-gray-500 line-clamp-2">{p.content}</div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>

        {/* 右侧详情/新建区 */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          {mode === 'create' ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full text-xl font-bold px-2 py-1 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="请输入标题"
                  aria-label="新建提示词标题"
                />
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={async () => {
                      if (!editTitle.trim() || !editContent.trim()) return;
                      const res = await fetch("/api/prompt", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: editTitle,
                          content: editContent,
                          userId: session?.user?.email
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setPrompts([data.prompt, ...prompts]);
                        setSelected(data.prompt);
                        setEditTitle("");
                        setEditContent("");
                        setMode('view');
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    <FiSave className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setMode('view');
                      setEditTitle("");
                      setEditContent("");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <FiX className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full h-full p-4 text-gray-800 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  placeholder="请输入提示词内容"
                  aria-label="新建提示词内容"
                />
              </div>
            </div>
          ) : selected ? (
            <>
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full text-xl font-bold px-2 py-1 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="请输入标题"
                      aria-label="提示词标题"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-800">{selected.title}</h2>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                      >
                        <FiSave className="w-4 h-4" />
                        保存
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <FiX className="w-4 h-4" />
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full h-full p-4 text-gray-800 border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    placeholder="请输入提示词内容"
                    aria-label="提示词内容"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800">{selected.content}</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-lg">请选择左侧的提示词查看详情</div>
              <div className="mt-2">或点击右上角新建提示词</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
