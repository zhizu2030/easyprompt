"use client";
import Providers from "./providers";
import ApiKeyProvider, { useApiKey } from "./ApiKeyProvider";
import GlobalNav from "./GlobalNav";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface Prompt {
  id: string;
  title: string;
  content: string;
}

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false, loading: () => <div className="text-gray-400 text-center py-8">加载编辑器中...</div> });

// 列表骨架组件
const PromptListSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="p-4 rounded-xl border bg-gray-100 mb-3 animate-pulse">
        <div className="h-4 w-2/3 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 w-full bg-gray-200 rounded"></div>
      </div>
    ))}
  </>
);

// 详情骨架组件
const PromptDetailSkeleton = () => (
  <div className="bg-gray-50 w-full h-full rounded-2xl p-8 animate-pulse">
    <div className="h-6 w-1/3 bg-gray-300 rounded mb-6"></div>
    <div className="h-4 w-2/3 bg-gray-200 rounded mb-3"></div>
    <div className="h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
    <div className="h-4 w-full bg-gray-100 rounded mb-3"></div>
    <div className="h-4 w-5/6 bg-gray-100 rounded mb-3"></div>
    <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
  </div>
);

function HomePageContent() {
  const apikey = useApiKey();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');
  const [formError, setFormError] = useState("");

  const selectPrompt = (p: Prompt) => {
    setSelectedPrompt(p);
    localStorage.setItem("lastSelectedPromptId", p.id);
  };

  const fetchPrompts = (q = "", tryRestore = false) => {
    if (!apikey) return;
    setLoading(true);
    const params = { q, page: 1, pageSize: 10 };
    const apiUrl = "/api/open/prompts";
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-apikey": apikey },
      body: JSON.stringify(params),
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data.prompts) ? data.prompts : [];
        setPrompts(list);
        let sel: Prompt | null = null;
        if (tryRestore) {
          const lastId = localStorage.getItem("lastSelectedPromptId");
          sel = list.find((p: Prompt) => p.id === lastId) || (list.length > 0 ? list[0] : null);
        } else {
          sel = list.length > 0 ? list[0] : null;
        }
        setSelectedPrompt(sel);
      })
      .catch(() => {
        setPrompts([]);
        setSelectedPrompt(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!apikey) return;
    fetchPrompts("", true);
  }, [apikey]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrompts(search.trim());
  };

  const handleDelete = async (id: string) => {
    if (!apikey) return;
    if (!window.confirm("确定要删除该提示词吗？")) return;
    await fetch("/api/open/prompts/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-apikey": apikey },
      body: JSON.stringify({ id }),
    });
    fetchPrompts(search.trim());
  };

  const startEdit = () => {
    if (!selectedPrompt) return;
    setEditTitle(selectedPrompt.title);
    setEditContent(selectedPrompt.content);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setFormError("");
  };

  const saveEdit = async () => {
    if (!apikey || !selectedPrompt) return;
    if (!editTitle.trim() || !editContent.trim()) {
      setFormError("标题和内容不能为空");
      return;
    }
    await fetch("/api/open/prompts/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-apikey": apikey },
      body: JSON.stringify({ id: selectedPrompt.id, title: editTitle, content: editContent }),
    });
    setEditing(false);
    setFormError("");
    const q = search.trim();
    if (!apikey) return;
    setLoading(true);
    const params = { q, page: 1, pageSize: 20 };
    const apiUrl = "/api/open/prompts";
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-apikey": apikey },
      body: JSON.stringify(params),
    })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data.prompts) ? data.prompts : [];
        setPrompts(list);
        const found = list.find((p: Prompt) => p.id === selectedPrompt.id);
        setSelectedPrompt(found || (list.length > 0 ? list[0] : null));
      })
      .catch(() => {
        setPrompts([]);
        setSelectedPrompt(null);
      })
      .finally(() => setLoading(false));
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(false);
    setNewTitle("");
    setNewContent("");
  };

  const cancelCreate = () => {
    setCreating(false);
    setFormError("");
  };

  const saveCreate = async () => {
    if (!apikey) return;
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError("标题和内容不能为空");
      return;
    }
    await fetch("/api/open/prompts/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-apikey": apikey },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    });
    setCreating(false);
    setFormError("");
    fetchPrompts("");
  };

  return (
    <>
      <GlobalNav />
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
          {/* 左侧列表骨架 */}
        <div className="w-1/3 min-w-[280px] max-w-md border-r bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">提示词列表</h2>
            <button
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                onClick={startCreate}
              >新建</button>
          </div>
            <form className="p-4 pb-0 flex gap-2" onSubmit={handleSearch}>
            <input
              type="text"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              placeholder="搜索标题或内容..."
              value={search}
              onChange={e => setSearch(e.target.value)}
                disabled={loading}
            />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                disabled={loading}
              >搜索</button>
            </form>
          <div className="p-4 space-y-2 overflow-y-auto" style={{ height: "calc(100vh - 8rem)" }}>
              {loading ? (
                <PromptListSkeleton />
              ) : prompts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">暂无数据</div>
              ) : (
                prompts.map(p => (
                  <div
                    key={p.id}
                    className={
                      `p-4 rounded-xl border bg-gray-50 mb-3 cursor-pointer transition-all group ` +
                      (selectedPrompt && selectedPrompt.id === p.id
                        ? 'border-blue-500 bg-blue-50 shadow'
                        : 'hover:border-blue-300')
                    }
                    onClick={() => {
                      setCreating(false);
                      selectPrompt(p);
                    }}
                  >
                    <div className="flex items-center mb-1">
                      <div className="font-medium text-gray-900 flex-1 truncate">{p.title}</div>
                      <button
                        className="ml-2 px-2 py-1 text-xs text-blue-500 rounded hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition"
                        onClick={e => { e.stopPropagation(); selectPrompt(p); setEditTitle(p.title); setEditContent(p.content); setEditing(true); }}
                        title="编辑"
                      >编辑</button>
                      <button
                        className="ml-2 px-2 py-1 text-xs text-red-500 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                        onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                        title="删除"
                      >删除</button>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 line-clamp-2 w-full">{p.content}</div>
                  </div>
                ))
            )}
          </div>
        </div>
          {/* 右侧详情骨架 */}
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            {creating ? (
              <div className="pl-12 pr-8 py-10 w-full h-full">
                <form className="flex flex-col gap-8 w-full h-full max-w-5xl mx-auto p-12 bg-white rounded-3xl shadow-2xl border border-gray-100" style={{ minHeight: '60vh' }} onSubmit={e => { e.preventDefault(); saveCreate(); }}>
                  {formError && <div className="text-red-500 text-base text-center mb-2">{formError}</div>}
                <input
                    className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-4 rounded-xl outline-none transition-all text-2xl font-semibold"
                    placeholder="标题"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                  <div className="min-h-[400px]">
                    <MDEditor
                      value={newContent}
                      onChange={val => setNewContent(val || "")}
                      height={400}
                      preview="edit"
                    />
                </div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">保存</button>
                    <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" onClick={cancelCreate}>取消</button>
              </div>
                </form>
              </div>
            ) : selectedPrompt ? (
              <div className="pl-12 pr-8 py-10 w-full h-full flex flex-col min-h-0">
                {editing ? (
                  <form className="flex flex-col gap-8 w-full h-full max-w-5xl mx-auto p-12 bg-white rounded-3xl shadow-2xl border border-gray-100" style={{ minHeight: '60vh' }} onSubmit={e => { e.preventDefault(); saveEdit(); }}>
                    {formError && <div className="text-red-500 text-base text-center mb-2">{formError}</div>}
                    <input
                      className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-4 rounded-xl outline-none transition-all text-2xl font-semibold"
                      placeholder="标题"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      required
                    />
                    <div className="min-h-[400px]">
                      <MDEditor
                        value={editContent}
                        onChange={val => setEditContent(val || "")}
                        height={400}
                        preview="edit"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">保存</button>
                      <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" onClick={cancelEdit}>取消</button>
                </div>
                  </form>
                  ) : (
                    <>
                    <div className="flex flex-col gap-1 mb-4 sticky top-0 z-10 bg-white pt-2" style={{ paddingRight: 0, minHeight: '64px' }} id="sticky-header">
                      <div className="flex items-center">
                        <div className="text-2xl font-bold text-gray-900 flex-1">{selectedPrompt.title}</div>
                        <button
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50 ml-2"
                          onClick={startEdit}
                        >编辑</button>
                        <button
                          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 ml-2"
                          onClick={() => handleDelete(selectedPrompt.id)}
                        >删除</button>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button
                          className={`px-3 py-1 text-sm rounded border ${previewMode === 'code' ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' : 'bg-white text-gray-500 border-gray-200'} hover:bg-blue-100`}
                          onClick={() => setPreviewMode('code')}
                        >源码</button>
                      <button
                          className={`px-3 py-1 text-sm rounded border ${previewMode === 'preview' ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' : 'bg-white text-gray-500 border-gray-200'} hover:bg-blue-100`}
                          onClick={() => setPreviewMode('preview')}
                        >预览</button>
                      </div>
                    </div>
                    <div
                      className="text-base text-gray-700 bg-gray-50 group relative flex-1 min-h-0 max-w-full"
                      style={{ paddingTop: '0', overflow: 'auto', marginTop: 0, padding: 0, maxWidth: '100%' }}
                    >
                      {/* 复制按钮 */}
                      <button
                        className="absolute top-4 right-6 z-20 px-3 py-1 text-sm bg-white border border-gray-200 rounded shadow hover:bg-blue-50 text-gray-600 opacity-0 group-hover:opacity-100 transition"
                        style={{ fontWeight: 500 }}
                        onClick={() => {
                          if (previewMode === 'code') {
                            navigator.clipboard.writeText(selectedPrompt.content || '');
                          } else {
                            // 复制 markdown 渲染后的纯文本
                            const el = document.querySelector('.wmde-markdown');
                            if (el) navigator.clipboard.writeText(el.textContent || '');
                          }
                        }}
                        title="复制全部内容"
                      >复制</button>
                      {previewMode === 'code' ? (
                        <pre className="bg-gray-50 text-sm m-0 p-4" style={{ fontFamily: 'Fira Mono, Menlo, Consolas, monospace', background: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          <code>{selectedPrompt.content}</code>
                        </pre>
                      ) : (
                        <MarkdownPreview source={selectedPrompt.content} className="wmde-markdown" />
                  )}
                </div>
                  </>
                )}
              </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-lg">请选择左侧的提示词查看详情</div>
              <div className="mt-2">或点击右上角新建提示词</div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Providers>
      <ApiKeyProvider>
        <HomePageContent />
      </ApiKeyProvider>
    </Providers>
  );
}
