export const ROOT = "__root__";

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

// Normalises managerId and builds a parent -> children lookup.
export function buildIndex(list = []) {
  const ids = new Set(list.map((p) => p.id));
  const byId = new Map();
  const children = new Map();

  list.forEach((p) => {
    const managerId =
      p.managerId && p.managerId !== p.id && ids.has(p.managerId) ? p.managerId : null;
    byId.set(p.id, { ...p, managerId });
  });

  byId.forEach((p) => {
    const key = p.managerId || ROOT;
    if (!children.has(key)) children.set(key, []);
    children.get(key).push(p.id);
  });

  return { byId, children };
}

// Everyone below `id` (children, grandchildren, ...).
export function descendants(id, children) {
  const out = new Set();
  const stack = [...(children.get(id) || [])];

  while (stack.length) {
    const next = stack.pop();
    if (out.has(next)) continue;
    out.add(next);
    stack.push(...(children.get(next) || []));
  }

  return out;
}

export function depthOf(children) {
  let max = 0;

  const walk = (id, depth) => {
    max = Math.max(max, depth);
    (children.get(id) || []).forEach((kid) => walk(kid, depth + 1));
  };

  (children.get(ROOT) || []).forEach((id) => walk(id, 1));
  return max;
}

/**
 * Same rules as the backend:
 *  - admin can move anyone anywhere
 *  - employee can only move people below them, into their own team
 *  - nobody can be moved under their own team (loop)
 */
export function checkMove(me, index, targetId, newManagerId) {
  const target = index.byId.get(targetId);

  if (!target) return { ok: false, reason: "Employee not found." };
  if (newManagerId === targetId) return { ok: false, reason: "Cannot report to themselves." };
  if ((target.managerId || null) === (newManagerId || null)) {
    return { ok: false, reason: "Already reports there." };
  }
  if (newManagerId && descendants(targetId, index.children).has(newManagerId)) {
    return { ok: false, reason: "Cannot move someone under their own team." };
  }

  if (me.role === "admin") return { ok: true };

  const mine = descendants(me.id, index.children);

  if (!mine.has(targetId)) {
    return { ok: false, reason: "Only people above you can move this person." };
  }
  if (!newManagerId || (newManagerId !== me.id && !mine.has(newManagerId))) {
    return { ok: false, reason: "You can only move people inside your own team." };
  }

  return { ok: true };
}