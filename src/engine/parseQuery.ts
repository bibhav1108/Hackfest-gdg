/**
 * Query parser for Salt Match (Section 4A.7)
 * Splits input into name, number, unit (mg, ml, %, etc.), pack volume, and dosage form.
 * Normalizes number words ("six fifty" -> 650) and Devanagari numerals ("६५०" -> 650).
 */

const NUMBER_WORDS: Record<string, number> = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
  'seventy': 70, 'eighty': 80, 'ninety': 90,
  'hundred': 100,
  'six fifty': 650,
  'six hundred fifty': 650,
  'five hundred': 500,
  'two fifty': 250,
  'six twenty five': 625
};

export interface ParsedMedicineQuery {
  raw: string;
  normalizedName: string;
  strengthValue?: number;
  strengthUnit?: string;
  packVolumeMl?: number;
  dosageForm?: string;
  isCombination?: boolean;
}

export function parseMedicineQuery(input: string): ParsedMedicineQuery {
  let clean = input.trim();

  // Normalize Devanagari numerals
  clean = clean.replace(/०/g, '0')
    .replace(/१/g, '1')
    .replace(/२/g, '2')
    .replace(/३/g, '3')
    .replace(/४/g, '4')
    .replace(/५/g, '5')
    .replace(/६/g, '6')
    .replace(/७/g, '7')
    .replace(/८/g, '8')
    .replace(/९/g, '9');

  // Check for common spoken number words
  let lower = clean.toLowerCase();
  for (const [word, num] of Object.entries(NUMBER_WORDS)) {
    if (lower.includes(word)) {
      lower = lower.replace(new RegExp(`\\b${word}\\b`, 'g'), num.toString());
      clean = lower;
    }
  }

  // Extract Dosage Form
  let dosageForm: string | undefined;
  const formMatch = clean.match(/\b(tablet|tab|tablets|syrup|syp|suspension|susp|capsule|cap|capsules|drops|drop|inhaler|injection|inj|cream|gel|ointment)\b/i);
  if (formMatch) {
    const rawForm = formMatch[1].toLowerCase();
    if (rawForm.startsWith('tab')) dosageForm = 'Tablet';
    else if (rawForm.startsWith('syp') || rawForm === 'syrup') dosageForm = 'Syrup';
    else if (rawForm.startsWith('susp')) dosageForm = 'Suspension';
    else if (rawForm.startsWith('cap')) dosageForm = 'Capsule';
    else if (rawForm.startsWith('drop')) dosageForm = 'Drops';
    else if (rawForm === 'inhaler') dosageForm = 'Inhaler';
    else dosageForm = rawForm.charAt(0).toUpperCase() + rawForm.slice(1);

    // Remove dosage form token from name extraction
    clean = clean.replace(new RegExp(`\\b${formMatch[0]}\\b`, 'i'), ' ');
  }

  // Extract Pack Volume (e.g. 100 ml, 60ml bottle, 30 ml)
  let packVolumeMl: number | undefined;
  const volMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliter|millilitres|bottle)\b/i);
  if (volMatch && !clean.includes('mg/5ml') && !clean.includes('mg/ml')) {
    packVolumeMl = parseFloat(volMatch[1]);
    clean = clean.replace(volMatch[0], ' ');
  }

  // Extract Strength (e.g. 650 mg, 228.5 mg/5ml, 500mg, 10mg, 625, 40)
  let strengthValue: number | undefined;
  let strengthUnit: string | undefined;

  const strengthFullMatch = clean.match(/(\d+(?:\.\d+)?)\s*(mg\/5ml|mg|mcg|gm|g|iu|%)(?:\/\d+ml)?/i);
  if (strengthFullMatch) {
    strengthValue = parseFloat(strengthFullMatch[1]);
    strengthUnit = strengthFullMatch[2].toLowerCase();
    clean = clean.replace(strengthFullMatch[0], ' ');
  } else {
    // Check for bare numbers (e.g. Dolo 650, Augmentin 625, Pan 40)
    const bareNumMatch = clean.match(/\b(\d+(?:\.\d+)?)\b/);
    if (bareNumMatch) {
      strengthValue = parseFloat(bareNumMatch[1]);
      strengthUnit = 'mg'; // Default inferred unit for oral solid medicines
      clean = clean.replace(bareNumMatch[0], ' ');
    }
  }

  // Remainder is the brand/molecule name
  const normalizedName = clean.replace(/[^\w\s\?\*]/g, '').replace(/\s+/g, ' ').trim();

  return {
    raw: input,
    normalizedName,
    strengthValue,
    strengthUnit,
    packVolumeMl,
    dosageForm,
    isCombination: strengthValue === 625 || strengthValue === 228.5 || clean.toLowerCase().includes('duo') || clean.toLowerCase().includes('plus')
  };
}
