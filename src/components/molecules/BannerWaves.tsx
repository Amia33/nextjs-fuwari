/**
 * Water waves along the banner's bottom edge.
 *
 * This is pure CSS: four `<use>` layers of two mirrored paths, translated by a
 * linear keyframe. Being server-rendered and animation-only, the waves are in
 * the first payload and already moving on first paint — no canvas, no client
 * JavaScript, no blank frame while a hydration effect spins up.
 *
 * Geometry is ported from the upstream Shirone `BannerWaves` component. Each
 * path spans several periods and is shifted by exactly one period
 * (`--waves-period`), so the loop is seamless.
 */

type WavePathOptions = {
  amplitude: number;
  baseline: number;
  bottom: number;
  end: number;
  inverted?: boolean;
  period: number;
  start: number;
};

/** Builds one full-width wave path: cosine-like humps, closed at the bottom. */
function buildWavePath({
  amplitude,
  baseline,
  bottom,
  end,
  inverted = false,
  period,
  start,
}: WavePathOptions): string {
  const direction = inverted ? -1 : 1;
  let path = `M ${start} ${baseline}`;

  for (let x = start; x < end; x += period) {
    path += ` C ${x + period / 8} ${baseline - amplitude * direction}`;
    path += ` ${x + (period * 3) / 8} ${baseline - amplitude * direction}`;
    path += ` ${x + period / 2} ${baseline}`;
    path += ` C ${x + (period * 5) / 8} ${baseline + amplitude * direction}`;
    path += ` ${x + (period * 7) / 8} ${baseline + amplitude * direction}`;
    path += ` ${x + period} ${baseline}`;
  }

  return `${path} V ${bottom} H ${start} Z`;
}

const SHARED_WAVE = { bottom: 60, end: 1024, period: 128, start: -768 };
const WAVE_A = buildWavePath({ ...SHARED_WAVE, amplitude: 14, baseline: 18 });
const WAVE_B = buildWavePath({
  ...SHARED_WAVE,
  amplitude: 12,
  baseline: 20,
  inverted: true,
});

export function BannerWaves() {
  return (
    <div className="banner-waves" aria-hidden="true">
      <svg viewBox="0 0 240 42" preserveAspectRatio="none" focusable="false">
        <defs>
          <path id="banner-wave-a" d={WAVE_A} />
          <path id="banner-wave-b" d={WAVE_B} />
        </defs>
        <g className="banner-waves-layers">
          <use
            href="#banner-wave-a"
            className="banner-waves-layer banner-waves-layer-haze"
          />
          <use
            href="#banner-wave-b"
            className="banner-waves-layer banner-waves-layer-far"
          />
          <use
            href="#banner-wave-a"
            className="banner-waves-layer banner-waves-layer-middle"
          />
          <use
            href="#banner-wave-b"
            className="banner-waves-layer banner-waves-layer-near"
          />
        </g>
      </svg>
    </div>
  );
}
