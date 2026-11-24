import { getCollection, type CollectionEntry } from 'astro:content';
import {
  agentStatusLabel, flowKindLabel, formatLabel, levelLabel, libraryTypeLabel, riskStatusLabel,
  severityLabel, toolStatusLabel, trainingKindLabel, type Variant,
} from './labels';

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

export const flowItem = (e: CollectionEntry<'flows'>): CatalogItem => {
  const k = flowKindLabel[e.data.kind];
  return {
    href: `/flows/${e.id}/`,
    title: e.data.title,
    summary: e.data.summary,
    icon: e.data.icon,
    badges: [{ label: k.label, variant: k.variant }],
    footer: [e.data.category, `v${e.data.version}`],
    category: e.data.category,
    status: e.data.kind,
    haystack: hay(e.data.title, e.data.summary, e.data.category, e.data.stack, e.data.tags),
  };
};

export const onboardingItem = (e: CollectionEntry<'onboarding'>): CatalogItem => ({
  href: `/start/${e.id}/`,
  title: e.data.title,
  summary: e.data.summary,
  icon: e.data.icon,
  badges: [{ label: e.data.estimatedTime, variant: 'accent' }],
  footer: [e.data.role],
  category: e.data.role,
  haystack: hay(e.data.title, e.data.summary, e.data.role, e.data.tags),
});

export const riskItem = (e: CollectionEntry<'risks'>): CatalogItem => {
  const sev = severityLabel[e.data.severity];
  const st = riskStatusLabel[e.data.status];
  return {
    href: `/risks/${e.id}/`,
    title: e.data.title,
    summary: e.data.summary,
    icon: e.data.icon,
    badges: [{ label: sev.label, variant: sev.variant }, { label: st.label, variant: st.variant }],
    footer: [e.data.category],
    category: e.data.category,
    status: e.data.severity,
    haystack: hay(e.data.title, e.data.summary, e.data.category, e.data.tags),
  };
};

export const trainingItem = (e: CollectionEntry<'training'>): CatalogItem => {
  const lvl = levelLabel[e.data.level];
  return {
    href: `/training/${e.id}/`,
    title: e.data.title,
    summary: e.data.summary,
    icon: e.data.icon,
    badges: [{ label: lvl.label, variant: lvl.variant }],
    footer: [trainingKindLabel[e.data.kind], formatLabel[e.data.format], e.data.duration],
    category: trainingKindLabel[e.data.kind],
    status: e.data.level,
    haystack: hay(e.data.title, e.data.summary, e.data.audience, e.data.tags),
  };
};

export const getFlows = async () =>
  (await getCollection('flows')).sort((a, b) => a.data.title.localeCompare(b.data.title));
export const getOnboarding = async () =>
  (await getCollection('onboarding')).sort((a, b) => a.data.order - b.data.order);
export const getFaq = async () =>
  (await getCollection('faq')).sort((a, b) => a.data.order - b.data.order);
export const getNews = async () =>
  (await getCollection('news')).sort((a, b) => +b.data.date - +a.data.date);
export const getRisks = async () =>
  (await getCollection('risks')).sort((a, b) => +b.data.date - +a.data.date);
export const getTraining = async () =>
  (await getCollection('training')).sort((a, b) => a.data.title.localeCompare(b.data.title));
