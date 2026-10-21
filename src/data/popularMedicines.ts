export interface MedicineRecord {
  id: string;
  brandName: string;
  category: 'antibiotic' | 'cardiac' | 'diabetes' | 'acidity' | 'pain' | 'vitamins' | 'respiratory';
  categoryLabel: string;
  manufacturer: string;
  saltComposition: string;
  strength: string;
  dosageForm: string;
  packageSize: string;
  brandPrice: number;
  genericName: string;
  pmbjpCode: string;
  genericManufacturer: string;
  genericPrice: number;
  savingsPercentage: number;
  tags: string[];
}

export const POPULAR_MEDICINES: MedicineRecord[] = [
  {
    id: 'augmentin-228',
    brandName: 'Augmentin 228.5 mg/5ml suspension',
    category: 'antibiotic',
    categoryLabel: 'Antibiotic & Infection',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals',
    saltComposition: 'Amoxycillin & Potassium Clavulanate',
    strength: '228.5 mg/5ml',
    dosageForm: 'Suspension',
    packageSize: 'Bottle of 30ml',
    brandPrice: 210.0,
    genericName: 'Amoxycillin & Potassium Clavulanate Oral Suspension IP',
    pmbjpCode: 'PMBJP-01048',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 46.88,
    savingsPercentage: 78,
    tags: ['augmentin', 'amoxyclav', 'pediatric', 'suspension', 'amoxicillin', 'clavulanate', 'infection', 'fever']
  },
  {
    id: 'augmentin-625',
    brandName: 'Augmentin 625 Duo Tablet',
    category: 'antibiotic',
    categoryLabel: 'Antibiotic & Infection',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals',
    saltComposition: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
    strength: '625 mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 10 tablets',
    brandPrice: 223.5,
    genericName: 'Amoxycillin & Potassium Clavulanate Tablets IP 625mg',
    pmbjpCode: 'PMBJP-01052',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 58.0,
    savingsPercentage: 74,
    tags: ['augmentin 625', 'amoxyclav 625', 'moxikind-cv', 'amoxicillin', 'clavulanic acid']
  },
  {
    id: 'pan-40',
    brandName: 'Pan 40 mg Tablet',
    category: 'acidity',
    categoryLabel: 'Acidity & Digestion',
    manufacturer: 'Alkem Laboratories',
    saltComposition: 'Pantoprazole Sodium (40mg)',
    strength: '40 mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 15 tablets',
    brandPrice: 155.0,
    genericName: 'Pantoprazole Gastro-Resistant Tablets IP 40mg',
    pmbjpCode: 'PMBJP-01002',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 23.5,
    savingsPercentage: 85,
    tags: ['pan 40', 'pantocid', 'pantodac', 'pantoprazole', 'gas', 'acid reflux', 'gerd']
  },
  {
    id: 'crocin-650',
    brandName: 'Crocin 650 Advance Tablet',
    category: 'pain',
    categoryLabel: 'Pain & Fever',
    manufacturer: 'GlaxoSmithKline Asia',
    saltComposition: 'Paracetamol (Acetaminophen) (650mg)',
    strength: '650 mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 15 tablets',
    brandPrice: 38.5,
    genericName: 'Paracetamol Tablets IP 650mg',
    pmbjpCode: 'PMBJP-01008',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 12.0,
    savingsPercentage: 69,
    tags: ['crocin', 'dolo 650', 'calpol 650', 'paracetamol', 'fever', 'headache', 'body pain']
  },
  {
    id: 'atorva-10',
    brandName: 'Atorva 10 mg Tablet',
    category: 'cardiac',
    categoryLabel: 'Heart & Cholesterol',
    manufacturer: 'Zydus Cadila',
    saltComposition: 'Atorvastatin Calcium (10mg)',
    strength: '10 mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 10 tablets',
    brandPrice: 124.0,
    genericName: 'Atorvastatin Tablets IP 10mg',
    pmbjpCode: 'PMBJP-01120',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 18.0,
    savingsPercentage: 85,
    tags: ['atorva', 'lipitor', 'atorlip', 'atorvastatin', 'cholesterol', 'heart', 'cardiac']
  },
  {
    id: 'glycomet-500',
    brandName: 'Glycomet 500 mg Tablet',
    category: 'diabetes',
    categoryLabel: 'Diabetes Care',
    manufacturer: 'USV Private Limited',
    saltComposition: 'Metformin Hydrochloride (500mg)',
    strength: '500 mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 10 tablets',
    brandPrice: 48.0,
    genericName: 'Metformin Hydrochloride Tablets IP 500mg',
    pmbjpCode: 'PMBJP-01004',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 8.5,
    savingsPercentage: 82,
    tags: ['glycomet', 'glucophage', 'metformin', 'sugar', 'diabetes', 'type 2']
  },
  {
    id: 'telma-40',
    brandName: 'Telma 40 mg Tablet',
    category: 'cardiac',
    categoryLabel: 'Heart & Blood Pressure',
    manufacturer: 'Glenmark Pharmaceuticals',
    saltComposition: 'Telmisartan (40mg)',
    strength: '40 mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 15 tablets',
    brandPrice: 142.0,
    genericName: 'Telmisartan Tablets IP 40mg',
    pmbjpCode: 'PMBJP-01184',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 16.5,
    savingsPercentage: 88,
    tags: ['telma', 'telmikind', 'telmisartan', 'bp', 'blood pressure', 'hypertension']
  },
  {
    id: 'azithral-500',
    brandName: 'Azithral 500 mg Tablet',
    category: 'antibiotic',
    categoryLabel: 'Antibiotic & Infection',
    manufacturer: 'Alembic Pharmaceuticals',
    saltComposition: 'Azithromycin Dihydrate (500mg)',
    strength: '500 mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 5 tablets',
    brandPrice: 132.0,
    genericName: 'Azithromycin Tablets IP 500mg',
    pmbjpCode: 'PMBJP-01012',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 35.0,
    savingsPercentage: 73,
    tags: ['azithral', 'azee', 'zithromax', 'azithromycin', 'throat infection', 'chest']
  },
  {
    id: 'montair-lc',
    brandName: 'Montair LC Tablet',
    category: 'respiratory',
    categoryLabel: 'Asthma & Allergy',
    manufacturer: 'Cipla Limited',
    saltComposition: 'Montelukast (10mg) + Levocetirizine (5mg)',
    strength: '10mg / 5mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 10 tablets',
    brandPrice: 220.0,
    genericName: 'Montelukast & Levocetirizine Tablets IP',
    pmbjpCode: 'PMBJP-01342',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 42.0,
    savingsPercentage: 81,
    tags: ['montair lc', 'telekast-l', 'montek-lc', 'montelukast', 'allergy', 'cough', 'asthma']
  },
  {
    id: 'shelcal-500',
    brandName: 'Shelcal 500 mg Tablet',
    category: 'vitamins',
    categoryLabel: 'Vitamins & Minerals',
    manufacturer: 'Torrent Pharmaceuticals',
    saltComposition: 'Calcium Carbonate (500mg) + Vitamin D3 (250 IU)',
    strength: '500 mg + 250 IU',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 15 tablets',
    brandPrice: 138.0,
    genericName: 'Calcium & Vitamin D3 Tablets IP',
    pmbjpCode: 'PMBJP-01090',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 22.0,
    savingsPercentage: 84,
    tags: ['shelcal', 'gemcal', 'ostocalcium', 'calcium', 'vitamin d3', 'bones', 'deficiency']
  },
  {
    id: 'amlong-5',
    brandName: 'Amlong 5 mg Tablet',
    category: 'cardiac',
    categoryLabel: 'Heart & Blood Pressure',
    manufacturer: 'Micro Labs Ltd',
    saltComposition: 'Amlodipine Besylate (5mg)',
    strength: '5 mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 15 tablets',
    brandPrice: 58.0,
    genericName: 'Amlodipine Tablets IP 5mg',
    pmbjpCode: 'PMBJP-01115',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 7.5,
    savingsPercentage: 87,
    tags: ['amlong', 'stamlo', 'amlodac', 'amlodipine', 'bp', 'blood pressure']
  },
  {
    id: 'rantac-150',
    brandName: 'Rantac 150 mg Tablet',
    category: 'acidity',
    categoryLabel: 'Acidity & Digestion',
    manufacturer: 'J.B. Chemicals & Pharmaceuticals',
    saltComposition: 'Ranitidine Hydrochloride (150mg)',
    strength: '150 mg',
    dosageForm: 'Tablet',
    packageSize: 'Strip of 30 tablets',
    brandPrice: 44.0,
    genericName: 'Ranitidine Tablets IP 150mg',
    pmbjpCode: 'PMBJP-01024',
    genericManufacturer: 'Jan Aushadhi Kendra (PMBI / BPPI)',
    genericPrice: 9.8,
    savingsPercentage: 78,
    tags: ['rantac', 'zantac', 'ranitidine', 'acidity', 'gas', 'heartburn']
  }
];

export const THERAPY_CATEGORIES = [
  { id: 'all', label: 'All Popular', icon: 'Sparkles' },
  { id: 'cardiac', label: 'BP & Heart', icon: 'HeartPulse' },
  { id: 'diabetes', label: 'Diabetes', icon: 'Activity' },
  { id: 'antibiotic', label: 'Antibiotics', icon: 'ShieldCheck' },
  { id: 'acidity', label: 'Acidity & GI', icon: 'FlaskConical' },
  { id: 'pain', label: 'Pain & Fever', icon: 'Zap' },
  { id: 'respiratory', label: 'Asthma & Allergy', icon: 'Wind' },
  { id: 'vitamins', label: 'Vitamins & Calcium', icon: 'Award' },
];

export const INDIAN_CITIES = [
  'Delhi NCR',
  'Mumbai',
  'Bengaluru',
  'Lucknow',
  'Jaipur',
  'Patna',
  'Ahmedabad',
  'Kolkata',
  'Hyderabad',
  'Chandigarh'
];
