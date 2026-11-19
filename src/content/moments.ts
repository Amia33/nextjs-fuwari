import { allMoments, type Moment } from "content-collections";

export type PublicMoment = Omit<Moment, "passwordHash">;

function toPublic({ passwordHash: _hash, ...rest }: Moment): PublicMoment {
  return rest;
}

export function getMoments(): PublicMoment[] {
  return allMoments
    .map(toPublic)
    .sort((a, b) => b.published.getTime() - a.published.getTime());
}

export function getMomentBySlug(slug: string): PublicMoment | undefined {
  return getMoments().find((moment) => moment._meta.path === slug);
}

export function getPaginatedMoments(page: number, size: number) {
  const moments = getMoments();
  const totalPages = Math.max(1, Math.ceil(moments.length / size));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * size;
  return {
    moments: moments.slice(start, start + size),
    page: current,
    totalPages,
    total: moments.length,
  };
}
