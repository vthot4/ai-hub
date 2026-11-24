// Constantes compartidas entre servidor e islas (sin dependencias: no arrastra zod al cliente).
export const kinds = ['feature', 'tool', 'agent', 'resource'] as const;
export const statuses = ['open', 'planned', 'in-progress', 'done', 'declined'] as const;
export type Kind = (typeof kinds)[number];
export type Status = (typeof statuses)[number];

export const kindLabel: Record<Kind, string> = {
  feature: 'Feature',
  tool: 'Tool request',
  agent: 'Agent idea',
  resource: 'Resource',
};
export const statusLabel: Record<Status, { label: string; variant: string }> = {
  open: { label: 'Open', variant: 'info' },
  planned: { label: 'Planned', variant: 'accent' },
  'in-progress': { label: 'In progress', variant: 'warn' },
  done: { label: 'Done', variant: 'ok' },
  declined: { label: 'Declined', variant: 'bad' },
};
