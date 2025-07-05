"use client";

import React, { useState } from "react";

const ApiKeyPage: React.FC = () => {
  const [remark, setRemark] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [keys, setKeys] = useState([]);

  const fetchKeys = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/apikey", {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || "获取失败");
      }
      const data = await res.json();
      setKeys(data.keys);
    } catch (e: any) {
      setError(e.message || "获取失败");
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

  return (
    <div className="p-4">
      <div className="mb-6 flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          placeholder="备注（可选）"
          value={remark}
          onChange={e => setRemark(e.target.value)}
          disabled={loading}
        />
        <input
          type="datetime-local"
          className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          value={expiresAt || ''}
          onChange={e => setExpiresAt(e.target.value)}
          disabled={loading}
          style={{ minWidth: 180 }}
          placeholder="到期时间（可选）"
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          onClick={createKey}
          disabled={loading}
        >新建 API Key</button>
      </div>
      {/* ... existing code ... */}
    </div>
  );
};

export default ApiKeyPage; 