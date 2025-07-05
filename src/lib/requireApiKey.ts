import { prisma } from '@/lib/prisma';

export async function requireApiKey(req: Request) {
  let apikey = '';
  // 1. header
  apikey = req.headers.get('x-apikey') || '';
  // 2. query
  if (!apikey) {
    try {
      const url = new URL(req.url);
      apikey = url.searchParams.get('apikey') || '';
    } catch {}
  }
  // 3. body
  if (!apikey && req.method !== 'GET') {
    try {
      const body = await req.json();
      apikey = body.apikey || '';
    } catch {}
  }
  if (!apikey) {
    if (process.env.NODE_ENV !== 'production') {
      // 开发环境允许无 apikey，返回 mock key，userId 固定
      return { key: { userId: 'dev-user', enabled: true, key: 'dev-apikey' } };
    }
    return { error: '缺少API Key', status: 401 };
  }
  const key = await prisma.apiKey.findUnique({ where: { key: apikey } });
  if (!key || !key.enabled) return { error: 'API Key无效', status: 403 };
  if (key.expiresAt && new Date() > key.expiresAt) return { error: 'API Key已过期', status: 403 };
  return { key };
} 