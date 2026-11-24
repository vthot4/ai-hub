import { useState } from 'preact/hooks';
import type { Challenge } from '../lib/repo';
import { kindLabel, statusLabel, statuses, type Status } from '../lib/constants';
import { api, errorText, fmtDate } from './api-client';

type RecentComment = { id: number; challengeId: number; challengeTitle: string; author: string; body: string; createdAt: string };

export default function AdminPanel(props: { challenges: Challenge[]; comments: RecentComment[] }) {
  const [challenges, setChallenges] = useState(props.challenges);
  const [comments, setComments] = useState(props.comments);
  const [error, setError] = useState('');

  async function run(fn: () => Promise<void>) {
    setError('');
    try { await fn(); } catch (e) { setError(errorText(e)); }
  }

  const setStatus = (c: Challenge, status: Status) =>
    run(async () => {
      const upd = await api<Challenge>(`/api/challenges/${c.id}/`, { method: 'PATCH', body: { status } });
      setChallenges((prev) => prev.map((x) => (x.id === c.id ? upd : x)));
    });

  const removeChallenge = (c: Challenge) =>
    confirm(`Delete “${c.title}” with its votes and comments?`) &&
    run(async () => {
      await api(`/api/challenges/${c.id}/`, { method: 'DELETE' });
      setChallenges((prev) => prev.filter((x) => x.id !== c.id));
      setComments((prev) => prev.filter((x) => x.challengeId !== c.id));
    });

  const removeComment = (id: number) =>
    confirm('Delete this comment?') &&
    run(async () => {
      await api(`/api/comments/${id}/`, { method: 'DELETE' });
      setComments((prev) => prev.filter((x) => x.id !== id));
    });

  return (
    <div>
      {error && <p class="form-error" role="alert">{error}</p>}

      <div class="section-head"><h2>Challenges ({challenges.length})</h2></div>
      {challenges.length === 0 ? <p class="empty">Nothing to moderate.</p> : (
        <div class="panel" style="overflow-x:auto">
          <table class="prose" style="width:100%">
            <thead><tr><th>Title</th><th>Type</th><th>Author</th><th>Votes</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {challenges.map((c) => (
                <tr>
                  <td>{c.title}<br /><span class="tag">{fmtDate(c.createdAt)}</span></td>
                  <td>{kindLabel[c.kind]}</td>
                  <td>{c.author}</td>
                  <td>{c.votes}</td>
                  <td>
                    <select class="select" aria-label={`Status of ${c.title}`} value={c.status}
                      onChange={(e) => setStatus(c, (e.target as HTMLSelectElement).value as Status)}>
                      {statuses.map((s) => <option value={s}>{statusLabel[s].label}</option>)}
                    </select>
                  </td>
                  <td><button type="button" class="btn sm" onClick={() => removeChallenge(c)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div class="section-head section"><h2>Recent comments</h2></div>
      {comments.length === 0 ? <p class="empty">No comments.</p> : (
        <div class="panel board">
          {comments.map((c) => (
            <div class="comment" style="display:flex;gap:1rem;justify-content:space-between;align-items:flex-start">
              <div>
                <b>{c.author}</b> on <i>{c.challengeTitle}</i> <span class="tag">{fmtDate(c.createdAt)}</span>
                <br /><span style="white-space:pre-wrap">{c.body}</span>
              </div>
              <button type="button" class="btn sm" onClick={() => removeComment(c.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
