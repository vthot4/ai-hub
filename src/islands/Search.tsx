import Fuse from 'fuse.js';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { SearchDoc } from '../pages/search-index.json';

const sectionVariant: Record<SearchDoc['section'], string> = {
  Tool: 'info',
  Policy: 'warn',
  Agent: 'accent',
  Library: 'ok',
};

export default function Search() {
  const [q, setQ] = useState('');
  const [fuse, setFuse] = useState<Fuse<SearchDoc> | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const loading = useRef(false);

  async function load() {
    if (fuse || loading.current) return;
    loading.current = true;
    try {
      const docs: SearchDoc[] = await (await fetch('/search-index.json')).json();
      setFuse(
        new Fuse(docs, {
          threshold: 0.35,
          ignoreLocation: true,
          keys: [
            { name: 'title', weight: 3 },
            { name: 'keywords', weight: 1.5 },
            { name: 'summary', weight: 1 },
          ],
        }),
      );
    } finally {
      loading.current = false;
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const term = q.trim();
  const hits = fuse && term ? fuse.search(term, { limit: 7 }).map((r) => r.item) : [];

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && hits[active]) {
      location.href = hits[active].href;
    } else if (e.key === 'Escape') {
      setOpen(false);
      input.current?.blur();
    }
  }

  return (
    <div class="search" ref={box} role="search">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={input}
        class="input search-input"
        type="search"
        value={q}
        placeholder="Search the hub…  ( / )"
        aria-label="Search the hub"
        aria-expanded={open && term !== ''}
        aria-controls="search-results"
        autocomplete="off"
        onFocus={() => {
          load();
          setOpen(true);
        }}
        onInput={(e) => {
          setQ((e.target as HTMLInputElement).value);
          setActive(0);
          setOpen(true);
          load();
        }}
        onKeyDown={onKeyDown}
      />
      {open && term !== '' && (
        <div class="search-results" id="search-results" role="listbox">
          {!fuse ? (
            <p class="search-empty">Loading…</p>
          ) : hits.length === 0 ? (
            <p class="search-empty">No results for “{term}”.</p>
          ) : (
            hits.map((h, i) => (
              <a class="search-hit" href={h.href} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)}>
                <span class="search-hit-top">
                  <span aria-hidden="true">{h.icon}</span>
                  {h.title}
                  <span class={`badge plain ${sectionVariant[h.section]}`}>{h.section}</span>
                </span>
                <span class="desc">{h.summary}</span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
