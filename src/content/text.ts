const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
const LATIN_WORD = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;

const WORDS_PER_MINUTE = 200;
const CJK_CHARS_PER_MINUTE = 400;

export function readingTimeOf(markdown: string): {
  words: number;
  minutes: number;
} {
  const plain = toPlainText(markdown);
  const cjk = plain.match(CJK)?.length ?? 0;
  const latin = plain.match(LATIN_WORD)?.length ?? 0;
  const minutes = latin / WORDS_PER_MINUTE + cjk / CJK_CHARS_PER_MINUTE;
  return { words: latin + cjk, minutes: Math.max(1, Math.round(minutes)) };
}

export function excerptOf(markdown: string, maxLength = 160): string {
  const plain = toPlainText(markdown);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}

export function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/[*_`>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
