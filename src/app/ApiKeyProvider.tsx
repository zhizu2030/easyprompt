"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export const ApiKeyContext = createContext<string | null>(null);

export function useApiKey() {
  return useContext(ApiKeyContext);
}

export default function ApiKeyProvider({ children, apikey }: { children: ReactNode; apikey?: string | null }) {
  const [apiKey, setApiKey] = useState<string | null>(apikey ?? null);
  useEffect(() => {
    console.log("ApiKeyProvider props.apikey:", apikey);
    if (apikey) {
      setApiKey(apikey);
      return;
    }
    // 优先获取 isAuto=true 的 apikey
    fetch("/api/apikey/auto", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data && data.key) {
          setApiKey(data.key);
          console.log("ApiKeyProvider fetch到的 autoKey:", data.key);
          return;
        }
        // 兼容老接口，兜底查 /api/apikey
        fetch("/api/apikey", { credentials: "include" })
          .then(res => res.json())
          .then(data2 => {
            const keys = data2.keys || [];
            if (Array.isArray(keys) && keys.length > 0) {
              setApiKey(keys[0].key);
              console.log("ApiKeyProvider fetch到的第一个 key:", keys[0].key);
            } else {
              setApiKey(null);
              console.log("ApiKeyProvider 没有拿到任何 key");
            }
          });
      })
      .catch((err) => {
        setApiKey(null);
        console.log("ApiKeyProvider fetch /api/apikey/auto 异常", err);
      });
  }, [apikey]);
  return (
    <ApiKeyContext.Provider value={apiKey}>
      {children}
    </ApiKeyContext.Provider>
  );
} 