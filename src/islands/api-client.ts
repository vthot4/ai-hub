export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, string[]>) {
    super(message);
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(path, {
    method: init.method ?? 'GET',
    // content-type JSON siempre, incluso sin cuerpo (DELETE, voto): el filtro de origen de Astro solo
    // revisa peticiones "tipo formulario" y compara con la URL que ve el servidor, que no coincide
    // con la del navegador detrás de Docker/proxy y daba 403 en DELETE y votos sin content-type.
    headers: { 'x-requested-with': 'ai-hub', 'content-type': 'application/json' },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? res.statusText, data.details);
  return data as T;
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

export const errorText = (e: unknown) => {
  if (e instanceof ApiError) {
    const first = e.details && Object.values(e.details).flat()[0];
    return first ? `${e.message}: ${first}` : e.message;
  }
  return 'Something went wrong';
};
