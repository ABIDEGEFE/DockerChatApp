const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:8000/api';

export type User = { id: number; username: string; email?: string | null; bio?: string | null; avatar?: string | null };
export type Group = { id: number; name: string; members: User[] };
export type Message = {
  id: number | string;
  sender: User | null;
  group: Group;
  content: string;
  timestamp: string;
};
export type Profile = { user: User; bio?: string | null; avatar?: string | null };

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : null;
  if (!res.ok) {
    const detail = (payload as any)?.detail || res.statusText;
    throw new Error(detail);
  }
  return payload as T;
}

export function register(body: { username: string; email?: string; password: string; bio?: string }) {
  return request<{ id: number; username: string; email: string | null; bio?: string | null }>(`/register/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function login(body: { username: string; password: string }) {
  return request<{ detail: string; user: { id: number; username: string } }>(`/login/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function logout() {
  return request<{ detail: string }>(`/logout/`, { method: 'POST' });
}

export function listGroups(query?: string) {
  const q = query ? `?q=${encodeURIComponent(query)}` : '';
  return request<Group[]>(`/groups/${q}`);
}

export function createGroup(name: string) {
  return request<Group>(`/groups/`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function listGroupMembers(groupId: number) {
  return request<{ members: User[] }>(`/groups/${groupId}/members/`);
}

export function joinGroup(groupId: number, username?: string) {
  return request<{ detail: string; user: User }>(`/groups/${groupId}/join/`, {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export function listMessages(groupId: number) {
  return request<Message[]>(`/messages/?group=${groupId}`);
}

export function listProfiles() {
  return request<Profile[]>(`/profiles/`);
}

export const wsUrlForGroup = (groupId: string | number) => `ws://localhost:8000/ws/chat/${groupId}/`;
