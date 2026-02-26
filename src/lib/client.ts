import api from './api';

export interface APIError {
  message: string;
  status?: number;
  details?: any;
}

// request wrapper: accepts axios-style config and optional opts { raw }
export async function request<T = any>(config: any, opts?: { raw?: boolean }): Promise<T> {
  try {
    const resp = await api.request(config);
    if (opts?.raw) return resp as any;
    return resp.data as T;
  } catch (err: any) {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || err?.message || 'Erreur API';
    const details = err?.response?.data || null;
    const apiErr: APIError = { message, status, details };
    throw apiErr;
  }
}
