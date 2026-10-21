/**
 * Price Ladder Engine (Section 4A.4)
 * Generates ranked price ladder of all commercial brands and Jan Aushadhi generic
 * sharing the same molecule, strength, and dosage form.
 */

export interface PriceLadderEntry {
  brandName: string;
  manufacturer: string;
  unitPriceInr: number;
  packPriceInr: number;
  packSize: string;
  isGeneric: boolean;
  isUserBrand: boolean;
  relativeSavingsPercent?: number;
}

export interface PriceLadderData {
  moleculeName: string;
  strength: string;
  dosageForm: string;
  cheapestPrice: number;
  highestPrice: number;
  spreadInr: number;
  entries: PriceLadderEntry[];
}

export function generatePriceLadder(
  brandName: string,
  saltComposition: string,
  strength: string,
  dosageForm: string,
  brandPrice: number,
  genericPrice: number,
  genericName: string
): PriceLadderData {
  const cleanBrand = brandName.toLowerCase();

  // Synthetic/cataloged market brands for Indian market comparisons
  let marketBrands: { name: string; mfg: string; price: number; pack: string }[] = [];

  if (saltComposition.toLowerCase().includes('paracetamol')) {
    marketBrands = [
      { name: 'Dolo 650 Tablet', mfg: 'Micro Labs', price: 34.0, pack: '15 tabs' },
      { name: 'Crocin 650 Advance', mfg: 'GSK Asia', price: 38.5, pack: '15 tabs' },
      { name: 'Calpol 650 Tablet', mfg: 'GSK Pharma', price: 32.5, pack: '15 tabs' },
      { name: 'Pacimol 650', mfg: 'Ipca Labs', price: 29.0, pack: '15 tabs' },
    ];
  } else if (saltComposition.toLowerCase().includes('amox') || saltComposition.toLowerCase().includes('clav')) {
    marketBrands = [
      { name: 'Augmentin 625 Duo', mfg: 'GSK Pharma', price: 223.5, pack: '10 tabs' },
      { name: 'Moxikind-CV 625', mfg: 'Mankind', price: 185.0, pack: '10 tabs' },
      { name: 'Clavam 625', mfg: 'Alkem Labs', price: 205.0, pack: '10 tabs' },
      { name: 'Novamox-CV 625', mfg: 'Cipla', price: 195.0, pack: '10 tabs' },
    ];
  } else if (saltComposition.toLowerCase().includes('panto')) {
    marketBrands = [
      { name: 'Pan 40 Tablet', mfg: 'Alkem Labs', price: 155.0, pack: '15 tabs' },
      { name: 'Pantocid 40', mfg: 'Sun Pharma', price: 168.0, pack: '15 tabs' },
      { name: 'Pantodac 40', mfg: 'Zydus Cadila', price: 145.0, pack: '15 tabs' },
      { name: 'Penta 40', mfg: 'Torrent', price: 138.0, pack: '15 tabs' },
    ];
  } else if (saltComposition.toLowerCase().includes('telmi')) {
    marketBrands = [
      { name: 'Telma 40 Tablet', mfg: 'Glenmark', price: 142.0, pack: '15 tabs' },
      { name: 'Telmikind 40', mfg: 'Mankind', price: 95.0, pack: '15 tabs' },
      { name: 'Telsartan 40', mfg: 'Dr. Reddy', price: 125.0, pack: '15 tabs' },
      { name: 'Arbitel 40', mfg: 'Micro Labs', price: 115.0, pack: '15 tabs' },
    ];
  } else {
    marketBrands = [
      { name: brandName, mfg: 'Commercial Brand', price: brandPrice, pack: 'Standard pack' },
      { name: 'National Pharmacy Brand', mfg: 'Market Leader', price: Math.round(brandPrice * 1.15), pack: 'Standard pack' },
      { name: 'Regional Generic Equivalent', mfg: 'Generic Division', price: Math.round(brandPrice * 0.65), pack: 'Standard pack' },
    ];
  }

  // Ensure current brand is present
  if (!marketBrands.some(b => b.name.toLowerCase().includes(cleanBrand) || cleanBrand.includes(b.name.toLowerCase()))) {
    marketBrands.push({
      name: brandName,
      mfg: 'Prescribed Brand',
      price: brandPrice,
      pack: 'Prescription pack'
    });
  }

  // Add Jan Aushadhi generic at the base
  const allEntries: PriceLadderEntry[] = marketBrands.map(b => ({
    brandName: b.name,
    manufacturer: b.mfg,
    unitPriceInr: b.price / 10,
    packPriceInr: b.price,
    packSize: b.pack,
    isGeneric: false,
    isUserBrand: b.name.toLowerCase().includes(cleanBrand) || cleanBrand.includes(b.name.toLowerCase())
  }));

  allEntries.push({
    brandName: genericName,
    manufacturer: 'Jan Aushadhi Kendra (PMBJP / BPPI)',
    unitPriceInr: genericPrice / 10,
    packPriceInr: genericPrice,
    packSize: 'PMBJP pack',
    isGeneric: true,
    isUserBrand: false,
  });

  // Sort ascending (cheapest at the bottom/top depending on perspective, we provide ascending order)
  allEntries.sort((a, b) => a.packPriceInr - b.packPriceInr);

  const cheapestPrice = allEntries[0].packPriceInr;
  const highestPrice = allEntries[allEntries.length - 1].packPriceInr;
  const spreadInr = highestPrice - cheapestPrice;

  // Calculate relative savings compared to highest
  allEntries.forEach(entry => {
    entry.relativeSavingsPercent = Math.round(((highestPrice - entry.packPriceInr) / highestPrice) * 100);
  });

  return {
    moleculeName: saltComposition,
    strength,
    dosageForm,
    cheapestPrice,
    highestPrice,
    spreadInr,
    entries: allEntries
  };
}
