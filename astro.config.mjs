import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import preact from '@astrojs/preact';

// Páginas de contenido prerenderizadas; solo las rutas con `prerender = false`
// (tablón de retos, /api/*, admin) se ejecutan en el servidor Node.
export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  integrations: [preact()],
  trailingSlash: 'always',
  // Los bloques ```mermaid se dibujan en el cliente (islas/MermaidRender), no se resaltan.
  markdown: { syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] } },
  security: { checkOrigin: true },
});
