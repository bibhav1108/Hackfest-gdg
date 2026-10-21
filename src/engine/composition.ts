/**
 * Composition Key Builder & Salt Equivalence Engine (Section 4A.7)
 * Rules:
 * - Salts are lower-cased, aliased, sorted alphabetically, and joined with normalized strength and form
 * - Key format: salt1:strength+salt2:strength|form (e.g. amoxycillin:500mg+potassium-clavulanate:125mg|tablet)
 * - Match levels:
 *   - EXACT: identical salt set, strengths, and dosage form
 *   - PARTIAL: related salts or different strength/form (never claim headline savings)
 *   - NONE: no match
 */

export const SALT_ALIASES: Record<string, string> = {
  'acetaminophen': 'paracetamol',
  'amoxicillin': 'amoxycillin',
  'clavulanic acid': 'potassium clavulanate',
  'clavulanate': 'potassium clavulanate',
  'pantoprazole sodium': 'pantoprazole',
  'atorvastatin calcium': 'atorvastatin',
  'metformin hcl': 'metformin',
  'metformin hydrochloride': 'metformin',
  'telmisartan': 'telmisartan',
  'azithromycin dihydrate': 'azithromycin',
  'montelukast sodium': 'montelukast',
  'levocetirizine dihydrochloride': 'levocetirizine',
  'calcium carbonate': 'elemental calcium',
  'cholecalciferol': 'vitamin d3'
};

export function normalizeSaltName(salt: string): string {
  const lower = salt.toLowerCase().trim().replace(/[\(\)\.\,]/g, '');
  return SALT_ALIASES[lower] || lower;
}

export interface SaltComponent {
  salt: string;
  strength: string;
}

export function buildCanonicalCompositionKey(
  salts: SaltComponent[],
  dosageForm: string
): string {
  const normalized = salts.map(s => ({
    salt: normalizeSaltName(s.salt).replace(/\s+/g, '-'),
    strength: s.strength.toLowerCase().replace(/\s+/g, '')
  })).sort((a, b) => a.salt.localeCompare(b.salt));

  const saltKey = normalized.map(s => `${s.salt}:${s.strength}`).join('+');
  const formKey = dosageForm.toLowerCase().trim();

  return `${saltKey}|${formKey}`;
}

export type EquivalenceLevel = 'EXACT' | 'PARTIAL' | 'NONE';

export interface EquivalenceCheckResult {
  level: EquivalenceLevel;
  sameMolecule: boolean;
  sameStrength: boolean;
  sameDosageForm: boolean;
  samePackStandard: boolean;
  reasons: string[];
}

export function checkBioequivalence(
  brandKey: string,
  genericKey: string,
  brandForm: string,
  genericForm: string,
  brandStrength: string,
  genericStrength: string
): EquivalenceCheckResult {
  const sameKey = brandKey === genericKey;
  const sameDosageForm = brandForm.toLowerCase() === genericForm.toLowerCase();
  const sameStrength = brandStrength.toLowerCase().replace(/\s+/g, '') === genericStrength.toLowerCase().replace(/\s+/g, '');
  
  // Extract salts from keys
  const brandSalts = brandKey.split('|')[0];
  const genericSalts = genericKey.split('|')[0];
  const sameMolecule = brandSalts === genericSalts;

  const reasons: string[] = [];

  if (sameKey) {
    return {
      level: 'EXACT',
      sameMolecule: true,
      sameStrength: true,
      sameDosageForm: true,
      samePackStandard: true,
      reasons: ['Exact bioequivalent active pharmaceutical ingredients and strength.']
    };
  }

  if (sameMolecule && !sameStrength) {
    reasons.push(`Strength differs: prescribed ${brandStrength} vs generic ${genericStrength}.`);
  }

  if (!sameDosageForm) {
    reasons.push(`Dosage form differs: prescribed ${brandForm} vs generic ${genericForm}.`);
  }

  if (sameMolecule && (sameStrength || sameDosageForm)) {
    return {
      level: 'PARTIAL',
      sameMolecule: true,
      sameStrength,
      sameDosageForm,
      samePackStandard: false,
      reasons
    };
  }

  return {
    level: 'NONE',
    sameMolecule: false,
    sameStrength: false,
    sameDosageForm: false,
    samePackStandard: false,
    reasons: ['No matching bioequivalent formulation found in current dataset.']
  };
}
