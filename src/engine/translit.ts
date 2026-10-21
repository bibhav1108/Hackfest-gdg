/**
 * Devanagari to Latin transliteration & Hindi pharma alias table
 */

const DEVANAGARI_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'f', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', '्': '',
  // Devanagari numerals
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

export const HINDI_BRAND_ALIASES: Record<string, string> = {
  'डोलो': 'dolo',
  'डोलो ६५०': 'dolo 650',
  'डोलो 650': 'dolo 650',
  'क्रॉसिन': 'crocin',
  'क्रोसीन': 'crocin',
  'क्रोसीन ६५०': 'crocin 650',
  'ऑगमेंटिन': 'augmentin',
  'ऑगमेंटिन ६२५': 'augmentin 625',
  'ऑगमेंटिन 625': 'augmentin 625',
  'पैन ४०': 'pan 40',
  'पैन 40': 'pan 40',
  'पैनटोसिड': 'pantocid',
  'अटोरवा': 'atorva',
  'ग्लाइकोमेट': 'glycomet',
  'टेल्मा': 'telma',
  'अज़िथ्रल': 'azithral',
  'मोंटेयर': 'montair',
  'शेल्कल': 'shelcal',
  'बेनाड्रिल': 'benadryl',
  'एमलॉन्ग': 'amlong',
  'रैनटैक': 'rantac'
};

export function transliterateDevanagari(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // Check alias table first
  if (HINDI_BRAND_ALIASES[trimmed]) {
    return HINDI_BRAND_ALIASES[trimmed];
  }

  let result = '';
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (DEVANAGARI_MAP[char] !== undefined) {
      result += DEVANAGARI_MAP[char];
    } else {
      result += char;
    }
  }

  return result.toLowerCase();
}
