import { useEffect, useRef, useState } from 'preact/hooks';
import type { Challenge, Comment } from '../lib/repo';
import { kindLabel, kinds, statusLabel, statuses, type Kind, type Status } from '../lib/constants';
import { api, errorText, fmtDate } from './api-client';

interface Props {
  initial: Challenge[];
}

const person = (email: string) => email.split('@')[0];

function NewChallengeDialog(props: { initialKind: Kind; onClose: () => void; onCreated: (c: Challenge) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<Kind>(props.initialKind);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  async function submit(e: Event) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      props.onCreated(await api<Challenge>('/api/challenges/', { method: 'POST', body: { title, body, kind } }));
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <dialog ref={ref} class="dialog" onClose={props.onClose} aria-labelledby="new-title">
      <form onSubmit={submit}>
        <h2 id="new-title">New challenge</h2>
        {error && <p class="form-error" role="alert">{error}</p>}
        <div class="field">
          <label for="c-kind">Type</label>
          <select id="c-kind" class="select" value={kind} onChange={(e) => setKind((e.target as HTMLSelectElement).value as Kind)}>
            {kinds.map((k) => <option value={k}>{kindLabel[k]}</option>)}
          </select>
        </div>
        <div class="field">
          <label for="c-title">Title</label>
          <input id="c-title" class="input" required minLength={5} maxLength={120} value={title}
            onInput={(e) => setTitle((e.target as HTMLInputElement).value)} placeholder="Short, specific summary" />
        </div>
        <div class="field">
          <label for="c-body">What do you need and why?</label>
          <textarea id="c-body" class="textarea" required minLength={10} maxLength={4000} value={body}
            onInput={(e) => setBody((e.target as HTMLTextAreaElement).value)}
            placeholder="Describe the problem, who is affected and what a good outcome looks like." />
          <span class="hint">Do not include confidential data or personal information.</span>
        </div>
        <div class="dialog-actions">
          <button type="button" class="btn" onClick={() => ref.current?.close()}>Cancel</button>
          <button type="submit" class="btn primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit'}</button>
        </div>
      </form>
    </dialog>
  );
}

function Comments({ id, onCount }: { id: number; onCount: (delta: number) => void }) {
  const [items, setItems] = useState<Comment[] | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<Comment[]>(`/api/challenges/${id}/comments/`).then(setItems, (e) => setError(errorText(e)));
  }, [id]);

  async function add(e: Event) {
    e.preventDefault();
    setError('');
    try {
      const c = await api<Comment>(`/api/challenges/${id}/comments/`, { method: 'POST', body: { body: text } });
      setItems((prev) => [...(prev ?? []), c]);
      setText('');
      onCount(1);
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <div class="comments">
      {items === null && !error && <p class="muted">Loading…</p>}
      {items?.map((c) => (
        <p class="comment">
          <b>{person(c.author)}</b> <span class="tag">{fmtDate(c.createdAt)}</span>
          <br />
          <span style="white-space:pre-wrap">{c.body}</span>
        </p>
      ))}
      {error && <p class="form-error" role="alert">{error}</p>}
      <form class="comment-form" onSubmit={add}>
        <input class="input" required maxLength={1000} value={text} aria-label="Add a comment" placeholder="Add a comment…"
          onInput={(e) => setText((e.target as HTMLInputElement).value)} />
        <button class="btn primary" type="submit">Post</button>
      </form>
    </div>
  );
}

export default function ChallengeBoard({ initial }: Props) {
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<Status | ''>('');
  const [kind, setKind] = useState<Kind | ''>('');
  const [sort, setSort] = useState<'votes' | 'new'>('votes');
  const [dialog, setDialog] = useState<Kind | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [error, setError] = useState('');
  const first = useRef(true);

  async function reload() {
    const p = new URLSearchParams({ sort });
    if (q.trim()) p.set('q', q.trim());
    if (status) p.set('status', status);
    if (kind) p.set('kind', kind);
    try {
      setItems(await api<Challenge[]>(`/api/challenges/?${p}`));
      setError('');
    } catch (e) {
      setError(errorText(e));
    }
  }

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(reload, 200);
    return () => clearTimeout(t);
  }, [q, status, kind, sort]);

  useEffect(() => {
    // Enlace desde la biblioteca: /challenges/?new=resource
    const k = new URLSearchParams(location.search).get('new');
    if (k && (kinds as readonly string[]).includes(k)) setDialog(k as Kind);
  }, []);

  async function vote(c: Challenge) {
    try {
      const r = await api<{ voted: boolean; votes: number }>(`/api/challenges/${c.id}/vote/`, { method: 'POST' });
      setItems((prev) => {
        const next = prev.map((x) => (x.id === c.id ? { ...x, voted: r.voted, votes: r.votes } : x));
        return sort === 'votes' ? [...next].sort((a, b) => b.votes - a.votes) : next;
      });
    } catch (e) {
      setError(errorText(e));
    }
  }

  const bump = (id: number, delta: number) =>
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, comments: x.comments + delta } : x)));

  return (
    <div>
      <div class="toolbar">
        <input class="input" type="search" placeholder="Search challenges…" aria-label="Search challenges" value={q}
          onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
        <div class="chips" role="group" aria-label="Filter by status">
          <button type="button" class="chip" aria-pressed={status === ''} onClick={() => setStatus('')}>All</button>
          {statuses.map((s) => (
            <button type="button" class="chip" aria-pressed={status === s} onClick={() => setStatus(status === s ? '' : s)}>
              {statusLabel[s].label}
            </button>
          ))}
        </div>
        <select class="select" style="width:auto" aria-label="Filter by type" value={kind}
          onChange={(e) => setKind((e.target as HTMLSelectElement).value as Kind | '')}>
          <option value="">All types</option>
          {kinds.map((k) => <option value={k}>{kindLabel[k]}</option>)}
        </select>
        <select class="select" style="width:auto" aria-label="Sort" value={sort}
          onChange={(e) => setSort((e.target as HTMLSelectElement).value as 'votes' | 'new')}>
          <option value="votes">Most voted</option>
          <option value="new">Newest</option>
        </select>
        <button type="button" class="btn primary" onClick={() => setDialog('feature')}>+ New challenge</button>
      </div>

      {error && <p class="form-error" role="alert">{error}</p>}

      {items.length === 0 ? (
        <p class="empty">No challenges yet. Be the first to ask for something.</p>
      ) : (
        <div class="board">
          {items.map((c) => {
            const s = statusLabel[c.status];
            return (
              <article class="challenge">
                <button type="button" class="vote" aria-pressed={c.voted} aria-label={`${c.voted ? 'Remove vote from' : 'Vote for'} ${c.title}`}
                  onClick={() => vote(c)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m6 15 6-6 6 6" />
                  </svg>
                  {c.votes}
                </button>
                <div>
                  <h3>{c.title}</h3>
                  <div class="challenge-meta">
                    <span class={`badge ${s.variant}`}>{s.label}</span>
                    <span class="badge plain">{kindLabel[c.kind]}</span>
                    <span>{person(c.author)}</span>
                    <span>{fmtDate(c.createdAt)}</span>
                    <button type="button" class="chip" aria-expanded={open === c.id} onClick={() => setOpen(open === c.id ? null : c.id)}>
                      {c.comments} comment{c.comments === 1 ? '' : 's'}
                    </button>
                  </div>
                  <p class="challenge-body">{c.body}</p>
                  {open === c.id && <Comments id={c.id} onCount={(d) => bump(c.id, d)} />}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {dialog && (
        <NewChallengeDialog
          initialKind={dialog}
          onClose={() => setDialog(null)}
          onCreated={(c) => {
            setDialog(null);
            setItems((prev) => [c, ...prev]);
          }}
        />
      )}
    </div>
  );
}
