/**
 * Medical phonetic key generator adapted for Indian pharmaceuticals
 * Matches sound-alike brand names (e.g., Kalpol / Calpol, Pantocid / Pantoprazol)
 */

export function getPhoneticKey(input: string): string {
  if (!input) return '';
  let str = input.toLowerCase().trim();

  // Normalize common phonetic drug prefixes & suffixes
  str = str.replace(/ph/g, 'f');
  str = str.replace(/ce|ci|cy/g, 's');
  str = str.replace(/ca|co|cu|ck|k|q/g, 'k');
  str = str.replace(/th/g, 't');
  str = str.replace(/dg|dj|j/g, 'j');
  str = str.replace(/x/g, 'ks');
  str = str.replace(/wr/g, 'r');
  str = str.replace(/wh/g, 'w');
  str = str.replace(/z/g, 's');

  // Keep first char, remove subsequent vowels
  if (str.length === 0) return '';
  const first = str[0];
  const rest = str.slice(1).replace(/[aeiouy]/g, '');

  // Compress duplicate adjacent letters
  let deduplicated = first;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] !== deduplicated[deduplicated.length - 1]) {
      deduplicated += rest[i];
    }
  }

  return deduplicated.slice(0, 8);
}
