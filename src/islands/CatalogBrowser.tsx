import { useMemo, useState } from 'preact/hooks';
import type { CatalogItem } from '../lib/catalog';

interface Props {
  items: CatalogItem[];
  statuses?: { value: string; label: string }[];
  placeholder?: string;
  noun: string;
}

export default function CatalogBrowser({ items, statuses = [], placeholder = 'Filter…', noun }: Props) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (i) =>
        (!category || i.category === category) &&
        (!status || i.status === status) &&
        (!needle || i.haystack.includes(needle)),
    );
  }, [items, q, category, status]);

  return (
    <div>
      <div class="toolbar">
        <input
          class="input"
          type="search"
          value={q}
          placeholder={placeholder}
          aria-label={placeholder}
          onInput={(e) => setQ((e.target as HTMLInputElement).value)}
        />
        <div class="chips" role="group" aria-label="Filter by category">
          <button type="button" class="chip" aria-pressed={category === ''} onClick={() => setCategory('')}>
            All
          </button>
          {categories.map((c) => (
            <button type="button" class="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? '' : c)}>
              {c}
            </button>
          ))}
        </div>
        {statuses.length > 0 && (
          <div class="chips" role="group" aria-label="Filter by status">
            {statuses.map((s) => (
              <button type="button" class="chip" aria-pressed={status === s.value} onClick={() => setStatus(status === s.value ? '' : s.value)}>
                {s.label}
              </button>
            ))}
          </div>
        )}
        <span class="count" aria-live="polite">
          {shown.length} {noun}
          {shown.length === 1 ? '' : 's'}
        </span>
      </div>

      {shown.length === 0 ? (
        <p class="empty">No {noun}s match your filters.</p>
      ) : (
        <div class="grid">
          {shown.map((i) => (
            <a class="card" href={i.href}>
              <div class="card-top">
                <span class="card-icon" aria-hidden="true">{i.icon}</span>
                <span>
                  {i.badges.map((b) => (
                    <span class={`badge ${b.variant}`}>{b.label}</span>
                  ))}
                </span>
              </div>
              <h3>{i.title}</h3>
              <p>{i.summary}</p>
              <div class="card-foot">
                {i.footer.map((f) => (
                  <span class="tag">{f}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
