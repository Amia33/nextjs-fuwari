/**
 * Stands in for a protected item's cover image while it is locked.
 *
 * A cover is content: publishing its URL on a index page tells a visitor what
 * a private post or album contains, and in the album case would also hand out
 * a working link to a gated file. This component is what the lists render
 * instead.
 */
export function LockedCover() {
  return (
    <div className="flex h-full w-full items-center justify-center text-xs opacity-40">
      <span aria-hidden="true">🔒</span>
    </div>
  );
}
