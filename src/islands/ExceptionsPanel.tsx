import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { EXPIRING_SOON_DAYS, MAX_EXCEPTION_DAYS, exceptionStatuses, type Exception, type ExceptionStatus } from '../lib/exceptions';
import { api, errorText } from './api-client';

interface Props {
  initial: Exception[];
  tools: { id: string; name: string }[];
  isAdmin: boolean;
}

const statusView: Record<ExceptionStatus, { label: string; variant: string }> = {
  active: { label: 'Active', variant: 'ok' },
  scheduled: { label: 'Scheduled', variant: 'info' },
  expired: { label: 'Expired', variant: 'plain' },
  revoked: { label: 'Revoked', variant: 'bad' },
};

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

function GrantDialog(props: { tools: Props['tools']; onClose: () => void; onCreated: (e: Exception) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tool, setTool] = useState(props.tools[0]?.id ?? '');
  const [holder, setHolder] = useState('');
  const [reason, setReason] = useState('');
  const [startsOn, setStartsOn] = useState(today());
  const [expiresOn, setExpiresOn] = useState(addDays(today(), 90));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => ref.current?.showModal(), []);

  async function submit(e: Event) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      props.onCreated(await api<Exception>('/api/exceptions/', { method: 'POST', body: { tool, holder, reason, startsOn, expiresOn } }));
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <dialog ref={ref} class="dialog" onClose={props.onClose} aria-labelledby="grant-title">
      <form onSubmit={submit}>
        <h2 id="grant-title">Grant an exception</h2>
        {error && <p class="form-error" role="alert">{error}</p>}
        <div class="field">
          <label for="x-tool">Restricted tool</label>
          <select id="x-tool" class="select" value={tool} onChange={(e) => setTool((e.target as HTMLSelectElement).value)}>
            {props.tools.map((t) => <option value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div class="field">
          <label for="x-holder">Holder</label>
          <input id="x-holder" class="input" required minLength={2} maxLength={100} value={holder}
            onInput={(e) => setHolder((e.target as HTMLInputElement).value)} placeholder="person@example.org or team name" />
        </div>
        <div class="field">
          <label for="x-reason">Justification</label>
          <textarea id="x-reason" class="textarea" required minLength={10} maxLength={1000} value={reason}
            onInput={(e) => setReason((e.target as HTMLTextAreaElement).value)} placeholder="Why is it needed, what data is involved, which controls apply." />
        </div>
        <div class="field" style="flex-direction:row;gap:1rem">
          <div style="flex:1;display:flex;flex-direction:column;gap:.4rem">
            <label for="x-start">Starts</label>
            <input id="x-start" class="input" type="date" required value={startsOn} onInput={(e) => setStartsOn((e.target as HTMLInputElement).value)} />
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:.4rem">
            <label for="x-end">Expires</label>
            <input id="x-end" class="input" type="date" required value={expiresOn} min={startsOn} max={addDays(startsOn, MAX_EXCEPTION_DAYS)}
              onInput={(e) => setExpiresOn((e.target as HTMLInputElement).value)} />
          </div>
        </div>
        <span class="hint">Exceptions last at most {MAX_EXCEPTION_DAYS} days and are recorded with your name as approver.</span>
        <div class="dialog-actions">
          <button type="button" class="btn" onClick={() => ref.current?.close()}>Cancel</button>
          <button type="submit" class="btn primary" disabled={busy || !tool}>{busy ? 'Saving…' : 'Grant'}</button>
        </div>
      </form>
    </dialog>
  );
}

function RenewDialog(props: { exception: Exception; onClose: () => void; onRenewed: (e: Exception) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [expiresOn, setExpiresOn] = useState(props.exception.expiresOn);
  const [error, setError] = useState('');
  useEffect(() => ref.current?.showModal(), []);

  async function submit(e: Event) {
    e.preventDefault();
    try {
      props.onRenewed(await api<Exception>(`/api/exceptions/${props.exception.id}/`, { method: 'PATCH', body: { action: 'renew', expiresOn } }));
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <dialog ref={ref} class="dialog" onClose={props.onClose} aria-labelledby="renew-title">
      <form onSubmit={submit}>
        <h2 id="renew-title">Change expiry</h2>
        {error && <p class="form-error" role="alert">{error}</p>}
        <div class="field">
          <label for="r-end">New expiry date</label>
          <input id="r-end" class="input" type="date" required value={expiresOn} min={props.exception.startsOn}
            max={addDays(props.exception.startsOn, MAX_EXCEPTION_DAYS)} onInput={(e) => setExpiresOn((e.target as HTMLInputElement).value)} />
          <span class="hint">Counted from the start date ({props.exception.startsOn}); at most {MAX_EXCEPTION_DAYS} days.</span>
        </div>
        <div class="dialog-actions">
          <button type="button" class="btn" onClick={() => ref.current?.close()}>Cancel</button>
          <button type="submit" class="btn primary">Save</button>
        </div>
      </form>
    </dialog>
  );
}

export default function ExceptionsPanel({ initial, tools, isAdmin }: Props) {
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ExceptionStatus | ''>('');
  const [tool, setTool] = useState('');
  const [grant, setGrant] = useState(false);
  const [renewing, setRenewing] = useState<Exception | null>(null);
  const [error, setError] = useState('');

  const toolName = (id: string) => tools.find((t) => t.id === id)?.name ?? id;
  const replace = (e: Exception) => setItems((prev) => prev.map((x) => (x.id === e.id ? e : x)));

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (e) =>
        (!status || e.status === status) &&
        (!tool || e.tool === tool) &&
        (!needle || `${e.holder} ${e.reason} ${toolName(e.tool)} ${e.approvedBy}`.toLowerCase().includes(needle)),
    );
  }, [items, q, status, tool]);

  async function revoke(e: Exception) {
    if (!confirm(`Revoke ${toolName(e.tool)} access for ${e.holder}? This cannot be undone.`)) return;
    setError('');
    try {
      replace(await api<Exception>(`/api/exceptions/${e.id}/`, { method: 'PATCH', body: { action: 'revoke' } }));
    } catch (err) {
      setError(errorText(err));
    }
  }

  return (
    <div>
      <div class="toolbar">
        <input class="input" type="search" placeholder="Search holder, tool or reason…" aria-label="Search exceptions" value={q}
          onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
        <div class="chips" role="group" aria-label="Filter by status">
          <button type="button" class="chip" aria-pressed={status === ''} onClick={() => setStatus('')}>All</button>
          {exceptionStatuses.map((s) => (
            <button type="button" class="chip" aria-pressed={status === s} onClick={() => setStatus(status === s ? '' : s)}>{statusView[s].label}</button>
          ))}
        </div>
        <select class="select" style="width:auto" aria-label="Filter by tool" value={tool} onChange={(e) => setTool((e.target as HTMLSelectElement).value)}>
          <option value="">All tools</option>
          {tools.map((t) => <option value={t.id}>{t.name}</option>)}
        </select>
        {isAdmin && <button type="button" class="btn primary" onClick={() => setGrant(true)}>+ Grant exception</button>}
      </div>

      {error && <p class="form-error" role="alert">{error}</p>}

      {shown.length === 0 ? (
        <p class="empty">{isAdmin ? 'No exceptions match.' : 'You have no exceptions.'}</p>
      ) : (
        <div class="panel" style="overflow-x:auto;padding:0">
          <table class="prose" style="width:100%;margin:0">
            <thead>
              <tr><th>Tool</th><th>Holder</th><th>Justification</th><th>Period</th><th>Status</th>{isAdmin && <th>Approved by</th>}{isAdmin && <th></th>}</tr>
            </thead>
            <tbody>
              {shown.map((e) => {
                const s = statusView[e.status];
                const soon = e.status === 'active' && e.daysLeft <= EXPIRING_SOON_DAYS;
                return (
                  <tr>
                    <td><a href={`/tools/${e.tool}/`}>{toolName(e.tool)}</a></td>
                    <td>{e.holder}</td>
                    <td style="max-width:320px">{e.reason}</td>
                    <td class="mono" style="white-space:nowrap;font-size:.85rem">{e.startsOn} → {e.expiresOn}</td>
                    <td>
                      <span class={`badge ${s.variant}`}>{s.label}</span>
                      {soon && <span class="badge warn plain" style="margin-left:.3rem">{e.daysLeft === 0 ? 'expires today' : `${e.daysLeft} d left`}</span>}
                    </td>
                    {isAdmin && <td class="tag">{e.approvedBy}</td>}
                    {isAdmin && (
                      <td style="white-space:nowrap">
                        {e.status !== 'revoked' && (
                          <>
                            <button type="button" class="btn sm" onClick={() => setRenewing(e)}>Expiry</button>{' '}
                            <button type="button" class="btn sm" onClick={() => revoke(e)}>Revoke</button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {grant && (
        <GrantDialog tools={tools} onClose={() => setGrant(false)} onCreated={(e) => { setGrant(false); setItems((prev) => [e, ...prev]); }} />
      )}
      {renewing && (
        <RenewDialog exception={renewing} onClose={() => setRenewing(null)} onRenewed={(e) => { setRenewing(null); replace(e); }} />
      )}
    </div>
  );
}
