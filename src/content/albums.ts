import { allAlbums, type Album } from "content-collections";

export type PublicAlbum = Omit<Album, "passwordHash">;

function toPublic({ passwordHash: _hash, ...rest }: Album): PublicAlbum {
  return rest;
}

export function getAlbums(): PublicAlbum[] {
  return allAlbums
    .map(toPublic)
    .sort((a, b) => b.published.getTime() - a.published.getTime());
}

export function getAlbumById(id: string): PublicAlbum | undefined {
  return getAlbums().find((album) => album._meta.path === id);
}
