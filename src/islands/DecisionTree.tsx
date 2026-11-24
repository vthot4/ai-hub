import { useState } from 'preact/hooks';

export interface TreeNode {
  id: string;
  question?: string;
  options: { label: string; next: string }[];
  result?: {
    verdict: 'yes' | 'conditions' | 'no';
    title: string;
    text: string;
    links: { label: string; href: string }[];
  };
}

const verdictBadge = { yes: 'Yes, go ahead', conditions: 'Yes, with conditions', no: 'No' } as const;

export default function DecisionTree({ nodes, start = 'start' }: { nodes: TreeNode[]; start?: string }) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  // Pila de pasos: el nodo mostrado en cada momento es el último elemento.
  const [path, setPath] = useState<{ id: string; choice?: string }[]>([{ id: start }]);
  const node = byId.get(path[path.length - 1].id);

  if (!node) return <p class="form-error">This guide is misconfigured (missing node “{path[path.length - 1].id}”).</p>;

  const choose = (label: string, next: string) =>
    setPath((p) => [...p.slice(0, -1), { ...p[p.length - 1], choice: label }, { id: next }]);
  const back = () => setPath((p) => (p.length > 1 ? [...p.slice(0, -2), { id: p[p.length - 2].id }] : p));
  const reset = () => setPath([{ id: start }]);

  return (
    <div class="tree" aria-live="polite">
      {path.length > 1 && (
        <div class="tree-crumbs">
          {path.slice(0, -1).map((s) => (
            <span class="badge plain">{byId.get(s.id)?.question} → {s.choice}</span>
          ))}
        </div>
      )}

      {node.result ? (
        <div class={`verdict ${node.result.verdict}`}>
          <p class="eyebrow" style="margin-bottom:.4rem">{verdictBadge[node.result.verdict]}</p>
          <h3>{node.result.title}</h3>
          <p>{node.result.text}</p>
          {node.result.links.length > 0 && (
            <ul>
              {node.result.links.map((l) => (
                <li><a class="btn sm" href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          <h3 class="tree-q">{node.question}</h3>
          <div class="tree-options">
            {node.options.map((o) => (
              <button type="button" class="tree-option" onClick={() => choose(o.label, o.next)}>{o.label}</button>
            ))}
          </div>
        </>
      )}

      <div style="display:flex;gap:.6rem;margin-top:1.2rem">
        {path.length > 1 && <button type="button" class="btn sm" onClick={back}>← Back</button>}
        {path.length > 1 && <button type="button" class="btn sm" onClick={reset}>Start over</button>}
      </div>
    </div>
  );
}
