import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type Meta = { page: number; per_page: number; total: number; total_pages: number };

type Envelope<T> = {
  success: boolean;
  data?: T;
  meta?: Meta;
  message?: string;
  errors?: unknown;
};

export class ApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const configured =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

export const apiBaseUrl = (configured ?? (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080')).replace(/\/$/, '');

let token: string | null = null;

export function setAuthToken(value: string | null) {
  token = value;
}

export function getAuthToken() {
  return token;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(apiBaseUrl + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (error) {
    throw new ApiError(
      `Tidak dapat terhubung ke layanan (${apiBaseUrl}). Periksa koneksi dan pastikan server berjalan.`,
      0,
      error,
    );
  }

  let envelope: Envelope<T> | null = null;
  try {
    envelope = (await response.json()) as Envelope<T>;
  } catch {
    envelope = null;
  }

  if (!response.ok || !envelope?.success) {
    throw new ApiError(
      envelope?.message ?? `Permintaan gagal (HTTP ${response.status})`,
      response.status,
      envelope?.errors,
    );
  }

  return envelope.data as T;
}

export async function requestPage<T>(path: string, query?: RequestOptions['query']): Promise<{ data: T[]; meta: Meta }> {
  const response = await fetch(buildUrl(path, query), {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let envelope: Envelope<T[]> | null = null;
  try {
    envelope = (await response.json()) as Envelope<T[]>;
  } catch {
    envelope = null;
  }

  if (!response.ok || !envelope?.success) {
    throw new ApiError(envelope?.message ?? `Permintaan gagal (HTTP ${response.status})`, response.status, envelope?.errors);
  }

  return {
    data: envelope.data ?? [],
    meta: envelope.meta ?? { page: 1, per_page: 20, total: envelope.data?.length ?? 0, total_pages: 1 },
  };
}

export type IKDStatus = 'inactive' | 'pending' | 'active';

export type User = {
  id: string;
  nik: string;
  full_name: string;
  email?: string;
  phone: string;
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  ikd_status: IKDStatus;
  ikd_activated_at?: string;
};

export type AuthResponse = { token: string; expires_at: string; user: User };

export type Service = {
  id: string;
  slug: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  requirements: string[];
  sla_days: number;
  is_active: boolean;
  order: number;
};

export type ApplicationStatus = 'submitted' | 'verified' | 'processing' | 'completed' | 'rejected';

export type ApplicationEvent = {
  id: string;
  status: ApplicationStatus;
  note: string;
  created_at: string;
};

export type Application = {
  id: string;
  ref_number: string;
  status: ApplicationStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  service?: Service;
  timeline?: ApplicationEvent[];
};

export type QueueStatus = 'waiting' | 'called' | 'done' | 'skipped';

export type QueueTicket = {
  id: string;
  code: string;
  location: string;
  status: QueueStatus;
  number: number;
  schedule_at: string;
  served_at?: string;
  service?: Service;
  waiting_ahead?: number;
  estimated_wait_minutes?: number;
};

export type ReportStatus = 'open' | 'in_progress' | 'resolved' | 'rejected';

export type Report = {
  id: string;
  ref_number: string;
  category: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  photo_urls: string[];
  status: ReportStatus;
  response: string;
  created_at: string;
  updated_at: string;
};

export type PublicReport = Omit<Report, 'id' | 'photo_urls'>;

export type ChatMessage = {
  id: string;
  session_id: string;
  role: 'user' | 'model';
  content: string;
  tokens_used: number;
  created_at: string;
};

export type ChatResponse = {
  session_id: string;
  reply: ChatMessage;
  model: string;
  degraded: boolean;
};

export type DashboardSummary = {
  greeting: string;
  user: { full_name: string; city: string; ikd_status: IKDStatus };
  counters: { active_applications: number; active_reports: number; active_queue_code: string };
  latest_application?: Application;
  services: Service[];
};

export type ChatSuggestions = { model: string; ready: boolean; suggestions: string[] };

export const api = {
  login: (identifier: string, password: string) =>
    request<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: { identifier, password } }),

  register: (payload: {
    nik: string;
    full_name: string;
    phone: string;
    password: string;
    email?: string;
    city?: string;
    district?: string;
    village?: string;
    address?: string;
  }) => request<AuthResponse>('/api/v1/auth/register', { method: 'POST', body: payload }),

  me: () => request<User>('/api/v1/me'),

  updateProfile: (payload: Partial<Pick<User, 'full_name' | 'email' | 'phone' | 'address' | 'village' | 'district' | 'city'>>) =>
    request<User>('/api/v1/me', { method: 'PATCH', body: payload }),

  activateIKD: (faceVerificationToken: string) =>
    request<User>('/api/v1/me/ikd/activate', { method: 'POST', body: { face_verification_token: faceVerificationToken } }),

  dashboard: () => request<DashboardSummary>('/api/v1/dashboard/summary'),

  listServices: (query?: { q?: string; category?: string; page?: number; per_page?: number }) =>
    requestPage<Service>('/api/v1/services', query),

  getService: (slug: string) => request<Service>(`/api/v1/services/${encodeURIComponent(slug)}`),

  createApplication: (serviceSlug: string, notes = '', payload: Record<string, unknown> = {}) =>
    request<Application>('/api/v1/applications', { method: 'POST', body: { service_slug: serviceSlug, notes, payload } }),

  listApplications: (status?: string) => requestPage<Application>('/api/v1/applications', { status }),

  trackApplication: (ref: string) => request<Application>(`/api/v1/applications/track/${encodeURIComponent(ref)}`),

  listQueueTickets: (status?: string) => requestPage<QueueTicket>('/api/v1/queue/tickets', { status }),

  getQueueTicket: (id: string) => request<QueueTicket>(`/api/v1/queue/tickets/${id}`),

  createQueueTicket: (serviceSlug: string, location: string, scheduleAt?: string) =>
    request<QueueTicket>('/api/v1/queue/tickets', {
      method: 'POST',
      body: { service_slug: serviceSlug, location, ...(scheduleAt ? { schedule_at: scheduleAt } : {}) },
    }),

  cancelQueueTicket: (id: string) => request<QueueTicket>(`/api/v1/queue/tickets/${id}/cancel`, { method: 'POST' }),

  createReport: (payload: {
    category: string;
    title: string;
    description: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    photo_urls?: string[];
  }) => request<Report>('/api/v1/reports', { method: 'POST', body: payload }),

  listReports: (query?: { status?: string; category?: string }) => requestPage<Report>('/api/v1/reports', query),

  getReport: (ref: string) => request<Report>(`/api/v1/reports/${encodeURIComponent(ref)}`),

  listPublicReports: (query?: { category?: string; status?: string; page?: number; per_page?: number }) =>
    requestPage<PublicReport>('/api/v1/reports/public', query),

  chat: (message: string, sessionId?: string) =>
    request<ChatResponse>('/api/v1/chat', { method: 'POST', body: { message, ...(sessionId ? { session_id: sessionId } : {}) } }),

  chatSuggestions: () => request<ChatSuggestions>('/api/v1/chat/suggestions'),

  chatSessions: () =>
    requestPage<{ id: string; title: string; created_at: string; updated_at: string }>('/api/v1/chat/sessions'),

  chatSession: (id: string) =>
    request<{ id: string; title: string; messages: ChatMessage[] }>(`/api/v1/chat/sessions/${id}`),
};

export async function uploadPhoto(asset: { uri: string; mimeType?: string | null; fileName?: string | null }) {
  const form = new FormData();
  const fallbackName = asset.fileName ?? `foto-${Date.now()}.jpg`;
  if (Platform.OS === 'web') {
    const blob = await (await fetch(asset.uri)).blob();
    form.append('file', blob, fallbackName);
  } else {
    form.append('file', {
      uri: asset.uri,
      name: fallbackName,
      type: asset.mimeType ?? 'image/jpeg',
    } as unknown as Blob);
  }
  return request<{ url: string; filename: string; size: number }>('/api/v1/uploads', { method: 'POST', body: form });
}
