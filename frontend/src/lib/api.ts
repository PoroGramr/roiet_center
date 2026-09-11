export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("roiet-token")
      : null;
  const response = await fetch("/api" + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (response.status === 401) {
    sessionStorage.removeItem("roiet-token");
    if (!path.includes("/auth/login")) window.location.assign("/login");
    throw new Error("이메일과 비밀번호를 확인해 주세요.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message || "처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    );
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export const json = (data: unknown) => JSON.stringify(data);
