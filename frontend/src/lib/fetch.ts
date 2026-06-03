/**
 * 全局 fetch 封装 — 自动无感刷新 (Silent Refresh)
 *
 * - 所有请求自动携带 HttpOnly Cookie（credentials: "include"）
 * - 收到 401 时静默调用 /auth/refresh 续期
 * - 续期成功后重放原请求，调用方完全无感
 * - 续期失败（refresh_token 也过期）则透传原始 401 错误
 */

const API_BASE = "http://localhost:8000";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  // 首次请求
  let res = await fetch(url, { ...options, credentials: "include" });

  // 401 → 尝试刷新
  if (res.status === 401 && !isRefreshing) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // 重放原请求（新 Cookie 自动携带）
      res = await fetch(url, { ...options, credentials: "include" });
    }
  }

  return res;
}
