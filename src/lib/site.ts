export interface NavItem { href: string; label: string }

export const site = {
  name: 'AI Hub',
  tagline: 'One place for approved AI tools, rules, agents and shared know-how.',
  nav: [
    { href: '/start/', label: 'Start' },
    { href: '/tools/', label: 'Tools' },
    { href: '/policies/', label: 'Policies' },
    { href: '/agents/', label: 'Agents' },
    { href: '/flows/', label: 'Flows' },
    { href: '/library/', label: 'Library' },
    { href: '/challenges/', label: 'Challenges' },
  ] satisfies NavItem[],
  more: [
    { href: '/training/', label: 'Training' },
    { href: '/faq/', label: 'FAQ' },
    { href: '/news/', label: 'News' },
    { href: '/risks/', label: 'Risks' },
    { href: '/exceptions/', label: 'Exceptions' },
    { href: '/metrics/', label: 'Metrics' },
  ] satisfies NavItem[],
};
