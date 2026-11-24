import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from '../src/islands/api-client';

afterEach(() => vi.unstubAllGlobals());

describe('api client', () => {
  it('always sends a JSON content-type, even for body-less DELETE/POST', async () => {
    // Sin content-type, el filtro de origen de Astro trata la petición como formulario y da 403 tras Docker/proxy.
    const fetchMock = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await api('/api/challenges/1/', { method: 'DELETE' });
    await api('/api/challenges/1/vote/', { method: 'POST' });
    for (const [, init] of fetchMock.mock.calls as unknown as [string, RequestInit][]) {
      const h = init.headers as Record<string, string>;
      expect(h['content-type']).toBe('application/json');
      expect(h['x-requested-with']).toBe('ai-hub');
      expect(init.body).toBeUndefined();
    }
  });

  it('throws ApiError with the server message and field details', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ error: 'Validation failed', details: { title: ['Too short'] } }), { status: 400 }));
    await expect(api('/x/', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 400, message: 'Validation failed', details: { title: ['Too short'] } });
    await expect(api('/x/')).rejects.toBeInstanceOf(ApiError);
  });
});
