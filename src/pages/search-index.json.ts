import type { APIRoute } from 'astro';
import {
  agentItem, flowItem, getAgents, getFaq, getFlows, getLibrary, getNews, getOnboarding, getPolicies,
  getRisks, getTools, getTraining, libraryItem, onboardingItem, policyItem, riskItem, toolItem, trainingItem,
  type CatalogItem,
} from '../lib/catalog';
import { newsTypeLabel } from '../lib/labels';

export type SearchSection = 'Tool' | 'Policy' | 'Agent' | 'Library' | 'Flow' | 'Start' | 'Risk' | 'Training' | 'FAQ' | 'News';

export interface SearchDoc {
  href: string;
  title: string;
  summary: string;
  icon: string;
  section: SearchSection;
  category: string;
  keywords: string;
}

export const GET: APIRoute = async () => {
  const [tools, policies, agents, library, flows, onboarding, risks, training, faq, news] = await Promise.all([
    getTools(), getPolicies(), getAgents(), getLibrary(), getFlows(), getOnboarding(), getRisks(), getTraining(), getFaq(), getNews(),
  ]);
  const doc = (section: SearchSection) => (i: CatalogItem): SearchDoc => ({
    href: i.href, title: i.title, summary: i.summary, icon: i.icon, section, category: i.category, keywords: i.haystack,
  });
  const docs: SearchDoc[] = [
    ...tools.map(toolItem).map(doc('Tool')),
    ...policies.map(policyItem).map(doc('Policy')),
    ...agents.map(agentItem).map(doc('Agent')),
    ...library.map(libraryItem).map(doc('Library')),
    ...flows.map(flowItem).map(doc('Flow')),
    ...onboarding.map(onboardingItem).map(doc('Start')),
    ...risks.map(riskItem).map(doc('Risk')),
    ...training.map(trainingItem).map(doc('Training')),
    ...faq.map((e): SearchDoc => ({
      href: `/faq/#${e.id}`, title: e.data.question, summary: (e.body ?? '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').slice(0, 160),
      icon: '❓', section: 'FAQ', category: e.data.category, keywords: `${e.data.question} ${e.body ?? ''}`.toLowerCase(),
    })),
    ...news.map((e): SearchDoc => ({
      href: e.data.href ?? '/news/', title: e.data.title, summary: e.data.summary, icon: '📰', section: 'News',
      category: newsTypeLabel[e.data.type].label, keywords: `${e.data.title} ${e.data.summary}`.toLowerCase(),
    })),
  ];
  return new Response(JSON.stringify(docs), { headers: { 'content-type': 'application/json' } });
};
