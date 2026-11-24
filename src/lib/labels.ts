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

export const flowKindLabel: Record<string, { label: string; variant: Variant }> = {
  process: { label: 'Process', variant: 'info' },
  automation: { label: 'Automation', variant: 'accent' },
};

export const severityLabel: Record<string, { label: string; variant: Variant }> = {
  low: { label: 'Low', variant: 'info' },
  medium: { label: 'Medium', variant: 'warn' },
  high: { label: 'High', variant: 'bad' },
};

export const riskStatusLabel: Record<string, { label: string; variant: Variant }> = {
  open: { label: 'Open', variant: 'bad' },
  mitigated: { label: 'Mitigated', variant: 'warn' },
  closed: { label: 'Closed', variant: 'ok' },
};

export const levelLabel: Record<string, { label: string; variant: Variant }> = {
  beginner: { label: 'Beginner', variant: 'ok' },
  intermediate: { label: 'Intermediate', variant: 'warn' },
  advanced: { label: 'Advanced', variant: 'bad' },
};

export const formatLabel: Record<string, string> = {
  online: 'Online',
  'in-person': 'In person',
  'self-paced': 'Self-paced',
};

export const trainingKindLabel: Record<string, string> = { course: 'Course', workshop: 'Workshop', path: 'Learning path' };

export const newsTypeLabel: Record<string, { label: string; variant: Variant }> = {
  tool: { label: 'Tool', variant: 'info' },
  policy: { label: 'Policy', variant: 'warn' },
  agent: { label: 'Agent', variant: 'accent' },
  library: { label: 'Library', variant: 'ok' },
  hub: { label: 'Hub', variant: '' },
};
