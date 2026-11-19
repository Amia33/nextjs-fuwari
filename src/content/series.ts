import { allSeries, type Series } from "content-collections";

export function getSeries(): Series[] {
  return [...allSeries].sort((a, b) => a.title.localeCompare(b.title));
}

export function getSeriesBySlug(slug: string): Series | undefined {
  return allSeries.find((series) => series._meta.path === slug);
}
