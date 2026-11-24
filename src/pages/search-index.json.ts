import type { APIRoute } from 'astro';
import { getAgents, getLibrary, getPolicies, getTools, agentItem, libraryItem, policyItem, toolItem } from '../lib/catalog';

export interface SearchDoc {
  href: string;
  title: string;
  summary: string;
  icon: string;
  section: 'Tool' | 'Policy' | 'Agent' | 'Library';
  category: string;
  keywords: string;
}

export const GET: APIRoute = async () => {
  const [tools, policies, agents, library] = await Promise.all([getTools(), getPolicies(), getAgents(), getLibrary()]);
  const doc = (section: SearchDoc['section']) => (i: ReturnType<typeof toolItem>): SearchDoc => ({
    href: i.href, title: i.title, summary: i.summary, icon: i.icon, section, category: i.category, keywords: i.haystack,
  });
  const docs: SearchDoc[] = [
    ...tools.map(toolItem).map(doc('Tool')),
    ...policies.map(policyItem).map(doc('Policy')),
    ...agents.map(agentItem).map(doc('Agent')),
    ...library.map(libraryItem).map(doc('Library')),
  ];
  return new Response(JSON.stringify(docs), { headers: { 'content-type': 'application/json' } });
};
