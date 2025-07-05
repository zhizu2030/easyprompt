"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import GlobalNav from "../GlobalNav";

interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
  expiresAt?: string;
  enabled: boolean;
  remark?: string;
  isAuto: boolean;
}

export default function ApiKeyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [remark, setRemark] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [remarkError, setRemarkError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      fetchKeys();
    }
  }, [status, router]);

  const fetchKeys = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/apikey", { credentials: "include" });
      const data = await res.json();
      setKeys(Array.isArray(data.keys) ? data.keys : []);
      if (!Array.isArray(data.keys) && data?.error) setError(data.error);
    } catch (e) {
      setError("获取失败");
      setKeys([]);
    }
    setLoading(false);
  };

  const createKey = async () => {
    if (!remark.trim()) {
      setRemarkError("备注为必填项");
      return;
    }
    setRemarkError("");
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark, expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || "创建失败");
      }
      setRemark("");
      setExpiresAt("");
      setSuccess("创建成功");
      fetchKeys();
    } catch (e: any) {
      setError(e.message || "创建失败");
    }
    setLoading(false);
  };

  const deleteKey = async (id: string) => {
    if (!window.confirm("确定要删除该 API Key 吗？")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/apikey/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("删除失败");
      setSuccess("删除成功");
      fetchKeys();
    } catch (e) {
      setError("删除失败");
    }
    setLoading(false);
  };

  // 只展示 isAuto 为 false 的 key
  const displayKeys = keys.filter(k => !k.isAuto);

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <>
      <GlobalNav />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <div className="flex flex-col items-center mb-8">
          <img src="/window.svg" alt="logo" className="w-16 h-16 mb-2" />
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-1">API Key 管理</h1>
          <p className="text-gray-500 text-sm">在这里你可以管理你的 API Key，用于开放接口调用。</p>
        </div>
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 p-12">
          <div className="mb-6 flex gap-4 items-center">
            <div className="flex flex-col" style={{ minWidth: 240 }}>
              <label className="mb-1 text-base font-medium">
                <span className="text-red-500 mr-1">*</span>备注
              </label>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-full"
                placeholder="请输入备注（必填）"
                value={remark}
                onChange={e => {
                  setRemark(e.target.value);
                  if (e.target.value.trim()) setRemarkError("");
                }}
                disabled={loading}
              />
              {remarkError && <span className="text-red-500 text-xs mt-1">{remarkError}</span>}
            </div>
            <div className="flex flex-col" style={{ minWidth: 240 }}>
              <label className="mb-1 text-base font-medium flex items-center gap-1 relative">
                到期时间
                <span
                  className="inline-block w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center cursor-pointer relative"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  style={{ fontSize: 12 }}
                >?
                  {showTooltip && (
                    <span className="absolute left-1/2 -translate-x-1/2 top-7 whitespace-nowrap bg-black text-white text-xs rounded px-2 py-1 z-10 shadow-lg">
                      为空则永久有效
                    </span>
                  )}
                </span>
              </label>
              <input
                type="datetime-local"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-full"
                value={expiresAt || ''}
                onChange={e => setExpiresAt(e.target.value)}
                disabled={loading}
                placeholder="到期时间（可选）"
              />
            </div>
            <button
              className="h-12 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors self-center text-base font-medium"
              onClick={createKey}
              disabled={loading}
              style={{ marginTop: 24 }}
            >新建 API Key</button>
          </div>
          {error && <div className="text-red-500 text-center mb-2">{error}</div>}
          {success && <div className="text-green-600 text-center mb-2">{success}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2 px-2">Key</th>
                  <th className="py-2 px-2">备注</th>
                  <th className="py-2 px-2">到期时间</th>
                  <th className="py-2 px-2">创建时间</th>
                  <th className="py-2 px-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">加载中...</td></tr>
                ) : Array.isArray(displayKeys) && displayKeys.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">暂无 API Key</td></tr>
                ) : Array.isArray(displayKeys) ? (
                  displayKeys.map(k => (
                    <tr key={k.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-mono select-all">
                        {k.key.slice(0, 8) + "..." + k.key.slice(-4)}
                        <button
                          className="ml-2 text-blue-500 hover:underline text-xs"
                          onClick={async () => {
                            await navigator.clipboard.writeText(k.key);
                            setCopiedKeyId(k.id);
                            setTimeout(() => setCopiedKeyId(null), 2000);
                          }}
                          title="复制API Key"
                        >复制</button>
                        {copiedKeyId === k.id && (
                          <span className="ml-2 text-green-500 text-xs">已复制</span>
                        )}
                      </td>
                      <td className="py-2 px-2">{k.remark || "-"}</td>
                      <td className="py-2 px-2">{k.expiresAt ? new Date(k.expiresAt).toLocaleString() : "永久有效"}</td>
                      <td className="py-2 px-2">{new Date(k.createdAt).toLocaleString()}</td>
                      <td className="py-2 px-2">
                        <button
                          className="text-red-500 hover:underline text-xs"
                          onClick={() => deleteKey(k.id)}
                          disabled={loading}
                        >删除</button>
                      </td>
                    </tr>
                  ))
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        <button
          className="mt-8 text-blue-600 hover:underline cursor-pointer bg-transparent border-none outline-none"
          onClick={() => router.push("/")}
        >返回首页</button>
      </div>
    </>
  );
} 