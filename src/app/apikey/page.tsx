"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
  expiresAt?: string;
  enabled: boolean;
  remark?: string;
}

export default function ApiKeyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      const res = await fetch("/api/apikey");
      if (!res.ok) throw new Error("获取失败");
      setKeys(await res.json());
    } catch (e) {
      setError("获取失败");
    }
    setLoading(false);
  };

  const createKey = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark }),
      });
      if (!res.ok) throw new Error("创建失败");
      setRemark("");
      setSuccess("创建成功");
      fetchKeys();
    } catch (e) {
      setError("创建失败");
    }
    setLoading(false);
  };

  const deleteKey = async (id: string) => {
    if (!window.confirm("确定要删除该 API Key 吗？")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/apikey/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      setSuccess("删除成功");
      fetchKeys();
    } catch (e) {
      setError("删除失败");
    }
    setLoading(false);
  };

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
        <div className="mb-6 flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            placeholder="备注（可选）"
            value={remark}
            onChange={e => setRemark(e.target.value)}
            disabled={loading}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={createKey}
            disabled={loading}
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
                <th className="py-2 px-2">创建时间</th>
                <th className="py-2 px-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8">加载中...</td></tr>
              ) : keys.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">暂无 API Key</td></tr>
              ) : keys.map(k => (
                <tr key={k.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2 font-mono select-all">{k.key.slice(0, 8) + "..." + k.key.slice(-4)}</td>
                  <td className="py-2 px-2">{k.remark || "-"}</td>
                  <td className="py-2 px-2">{new Date(k.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-2">
                    <button
                      className="text-red-500 hover:underline text-xs"
                      onClick={() => deleteKey(k.id)}
                      disabled={loading}
                    >删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <button
        className="mt-8 text-blue-600 hover:underline cursor-pointer bg-transparent border-none outline-none"
        onClick={() => router.push("/")}
      >返回首页</button>
    </div>
  );
} 