export type Variant = 'ok' | 'warn' | 'bad' | 'info' | 'accent' | '';

export const toolStatusLabel: Record<string, { label: string; variant: Variant }> = {
  approved: { label: 'Approved', variant: 'ok' },
  restricted: { label: 'Restricted', variant: 'warn' },
  prohibited: { label: 'Prohibited', variant: 'bad' },
};

export const agentStatusLabel: Record<string, { label: string; variant: Variant }> = {
  stable: { label: 'Stable', variant: 'ok' },
  beta: { label: 'Beta', variant: 'info' },
  experimental: { label: 'Experimental', variant: 'warn' },
  deprecated: { label: 'Deprecated', variant: 'bad' },
};

export const libraryTypeLabel: Record<string, string> = {
  guide: 'Guide',
  'best-practice': 'Best practice',
  template: 'Template',
  reference: 'Reference',
};

export const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
