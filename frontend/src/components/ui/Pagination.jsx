import { ChevronLeft, ChevronRight } from 'lucide-react';

function range(page, total) {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) out.push('…' + p);
    out.push(p);
  });
  return out;
}

export function Pagination({ page, totalPages, total, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Paginación">
      <button className="pagination__page" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Página anterior">
        <ChevronLeft size={16} />
      </button>
      {range(page, totalPages).map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="muted">…</span>
        ) : (
          <button key={p} className="pagination__page" aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>
            {p}
          </button>
        ),
      )}
      <button className="pagination__page" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Página siguiente">
        <ChevronRight size={16} />
      </button>
      {total !== undefined && <span className="pagination__info">{total} resultados en total</span>}
    </nav>
  );
}
