import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..', 'src', 'content');

interface Node {
  id: string;
  question?: string;
  options?: { label: string; next: string }[];
  result?: { links?: { href: string }[] };
}
const nodes: Node[] = JSON.parse(readFileSync(join(root, 'decision-tree.json'), 'utf8'));

describe('decision tree', () => {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  it('has unique ids and a start node', () => {
    expect(byId.size).toBe(nodes.length);
    expect(byId.has('start')).toBe(true);
  });

  it('every option points to an existing node and every node is a question or a result', () => {
    for (const n of nodes) {
      if (n.result) {
        expect(n.options ?? [], n.id).toHaveLength(0);
      } else {
        expect(n.question, n.id).toBeTruthy();
        expect(n.options?.length, n.id).toBeGreaterThan(0);
        for (const o of n.options!) expect(byId.has(o.next), `${n.id} -> ${o.next}`).toBe(true);
      }
    }
  });

  it('has no cycles and no unreachable nodes', () => {
    const seen = new Set<string>();
    const walk = (id: string, stack: string[]) => {
      expect(stack.includes(id), `cycle via ${[...stack, id].join(' > ')}`).toBe(false);
      seen.add(id);
      for (const o of byId.get(id)!.options ?? []) walk(o.next, [...stack, id]);
    };
    walk('start', []);
    expect([...byId.keys()].filter((k) => !seen.has(k))).toEqual([]);
  });
});

// Rutas internas válidas: páginas fijas + una por entrada de contenido.
const routes = new Set<string>(['/', '/tools/', '/policies/', '/agents/', '/library/', '/flows/', '/start/', '/faq/', '/news/', '/risks/', '/training/', '/challenges/', '/metrics/', '/admin/']);
const sections: Record<string, string> = { tools: 'tools', policies: 'policies', agents: 'agents', library: 'library', flows: 'flows', onboarding: 'start', risks: 'risks', training: 'training' };
const markdownFiles: { file: string; text: string }[] = [];
for (const [dir, route] of Object.entries(sections)) {
  for (const f of readdirSync(join(root, dir))) {
    routes.add(`/${route}/${f.replace(/\.md$/, '')}/`);
  }
}
for (const dir of [...Object.keys(sections), 'faq', 'news']) {
  for (const f of readdirSync(join(root, dir))) markdownFiles.push({ file: `${dir}/${f}`, text: readFileSync(join(root, dir, f), 'utf8') });
}
const faqIds = new Set(readdirSync(join(root, 'faq')).map((f) => f.replace(/\.md$/, '')));

describe('internal links in content', () => {
  const internal = (text: string) => [...text.matchAll(/\]\((\/[^)\s]*)\)|^href: (\/\S*)$/gm)].map((m) => m[1] ?? m[2]);
  const check = (file: string, href: string) => {
    const [path, hash] = href.split('#');
    const clean = path.split('?')[0];
    expect(routes.has(clean), `${file}: broken link ${href}`).toBe(true);
    if (clean === '/faq/' && hash) expect(faqIds.has(hash), `${file}: missing FAQ anchor ${href}`).toBe(true);
  };

  it('all Markdown links resolve to existing pages', () => {
    for (const { file, text } of markdownFiles) for (const href of internal(text)) check(file, href);
  });

  it('all decision-tree links resolve to existing pages', () => {
    for (const n of nodes) for (const l of n.result?.links ?? []) check(`decision-tree:${n.id}`, l.href);
  });

  it('content directories are non-empty', () => {
    for (const dir of Object.keys(sections)) expect(existsSync(join(root, dir))).toBe(true);
  });
});
