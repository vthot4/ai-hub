import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import preact from '@astrojs/preact';

// PUBLIC_DEMO=true lo fija scripts/build-demo.mjs: demo estática sin adaptador ni servidor.
// Todas las rutas (también las SSR del servidor real, p. ej. /training/) se prerenderizan.
const demo = process.env.PUBLIC_DEMO === 'true';
const prerenderAll = {
  name: 'demo-prerender-all',
  hooks: { 'astro:route:setup': ({ route }) => { route.prerender = true; } },
};

// Páginas de contenido prerenderizadas; solo las rutas con `prerender = false`
// (tablón de retos, /api/*, admin) se ejecutan en el servidor Node.
export default defineConfig({
  adapter: demo ? undefined : node({ mode: 'standalone' }),
  integrations: [preact(), ...(demo ? [prerenderAll] : [])],
  trailingSlash: 'always',
  // Los bloques ```mermaid se dibujan en el cliente (islas/MermaidRender), no se resaltan.
  markdown: { syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] } },
  security: { checkOrigin: true },
});
