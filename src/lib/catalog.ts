import { getCollection, type CollectionEntry } from 'astro:content';
import { agentStatusLabel, libraryTypeLabel, toolStatusLabel, type Variant } from './labels';

export interface CatalogItem {
  href: string;
  title: string;
  summary: string;
  icon: string;
  badges: { label: string; variant: Variant }[];
  footer: string[];
  category: string;
  status?: string;
  haystack: string;
}

const hay = (...parts: (string | string[])[]) => parts.flat().join(' ').toLowerCase();

export const toolItem = (e: CollectionEntry<'tools'>): CatalogItem => {
  const s = toolStatusLabel[e.data.status];
  return {
    href: `/tools/${e.id}/`,
    title: e.data.name,
    summary: e.data.summary,
    icon: e.data.icon,
    badges: [{ label: s.label, variant: s.variant }],
    footer: [e.data.category, ...(e.data.requiresApproval ? ['needs approval'] : [])],
    category: e.data.category,
    status: e.data.status,
    haystack: hay(e.data.name, e.data.summary, e.data.category, e.data.vendor, e.data.tags),
  };
};

export const policyItem = (e: CollectionEntry<'policies'>): CatalogItem => ({
  href: `/policies/${e.id}/`,
  title: e.data.title,
  summary: e.data.summary,
  icon: e.data.icon,
  badges: [{ label: `v${e.data.version}`, variant: 'accent' }],
  footer: [e.data.category, e.data.owner],
  category: e.data.category,
  haystack: hay(e.data.title, e.data.summary, e.data.category, e.data.tags),
});

export const agentItem = (e: CollectionEntry<'agents'>): CatalogItem => {
  const s = agentStatusLabel[e.data.status];
  return {
    href: `/agents/${e.id}/`,
    title: e.data.name,
    summary: e.data.summary,
    icon: e.data.icon,
    badges: [{ label: s.label, variant: s.variant }],
    footer: [e.data.category, `v${e.data.version}`],
    category: e.data.category,
    status: e.data.status,
    haystack: hay(e.data.name, e.data.summary, e.data.category, e.data.tech, e.data.tags),
  };
};

export const libraryItem = (e: CollectionEntry<'library'>): CatalogItem => ({
  href: `/library/${e.id}/`,
  title: e.data.title,
  summary: e.data.summary,
  icon: e.data.icon,
  badges: [{ label: libraryTypeLabel[e.data.type], variant: 'accent' }],
  footer: [e.data.category, e.data.author],
  category: e.data.category,
  status: e.data.type,
  haystack: hay(e.data.title, e.data.summary, e.data.category, e.data.tags),
});

export const getTools = async () =>
  (await getCollection('tools')).sort((a, b) => a.data.name.localeCompare(b.data.name));
export const getPolicies = async () =>
  (await getCollection('policies')).sort((a, b) => a.data.order - b.data.order);
export const getAgents = async () =>
  (await getCollection('agents')).sort((a, b) => a.data.name.localeCompare(b.data.name));
export const getLibrary = async () =>
  (await getCollection('library')).sort((a, b) => +b.data.publishedOn - +a.data.publishedOn);
