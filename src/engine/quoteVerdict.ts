/**
 * Counter Mode Verdict Engine (Section 4A.3)
 * Evaluates quoted prices at the pharmacy counter.
 * Tone guideline: Always polite and objective ("ask" and "check", never accusatory).
 */

export type CounterVerdictStatus = 'GENERIC_RANGE' | 'GENERIC_AVAILABLE' | 'ABOVE_CEILING' | 'NO_DATA';

export interface CounterVerdict {
  status: CounterVerdictStatus;
  quotedPrice: number;
  genericPrice: number;
  brandPrice: number;
  potentialSavingsInr: number;
  verdictHeadline: string;
  verdictDetail: string;
  recommendedAction: string;
  badgeColor: 'emerald' | 'amber' | 'rose' | 'slate';
}

export function evaluateChemistQuote(
  quotedPrice: number,
  brandPrice: number,
  genericPrice: number,
  genericName: string,
  nppaCeiling?: number
): CounterVerdict {
  if (quotedPrice <= 0 || !brandPrice || !genericPrice) {
    return {
      status: 'NO_DATA',
      quotedPrice,
      genericPrice,
      brandPrice,
      potentialSavingsInr: 0,
      verdictHeadline: 'No Reliable Benchmark',
      verdictDetail: "We don't have verified price caps for this specific pack size. Please check the printed MRP on the strip.",
      recommendedAction: 'Ask pharmacist for the printed MRP on the package.',
      badgeColor: 'slate'
    };
  }

  // 1. Quoted price is at or below generic price
  if (quotedPrice <= genericPrice * 1.05) {
    return {
      status: 'GENERIC_RANGE',
      quotedPrice,
      genericPrice,
      brandPrice,
      potentialSavingsInr: 0,
      verdictHeadline: 'Matches Generic Price Range',
      verdictDetail: `The quoted price (₹${quotedPrice.toFixed(2)}) aligns with government subsidized Jan Aushadhi generic pricing (₹${genericPrice.toFixed(2)}).`,
      recommendedAction: 'Fair price confirmed. You may proceed with purchase.',
      badgeColor: 'emerald'
    };
  }

  // 2. Quoted price is above generic, but at or below brand price / ceiling
  const ceiling = nppaCeiling || brandPrice * 1.05;
  if (quotedPrice <= ceiling) {
    const savings = Math.max(0, quotedPrice - genericPrice);
    return {
      status: 'GENERIC_AVAILABLE',
      quotedPrice,
      genericPrice,
      brandPrice,
      potentialSavingsInr: savings,
      verdictHeadline: `Lower-Cost Generic Equivalent Available (Save ₹${savings.toFixed(2)})`,
      verdictDetail: `A PMBJP generic with the identical molecule and strength (${genericName}) is listed at ₹${genericPrice.toFixed(2)}.`,
      recommendedAction: 'You can politely ask: "Is the Jan Aushadhi generic equivalent available for this?"',
      badgeColor: 'amber'
    };
  }

  // 3. Quoted price is above listed brand price or NPPA price ceiling
  const overcharge = quotedPrice - (nppaCeiling || brandPrice);
  return {
    status: 'ABOVE_CEILING',
    quotedPrice,
    genericPrice,
    brandPrice,
    potentialSavingsInr: quotedPrice - genericPrice,
    verdictHeadline: `Above Listed Maximum Retail Price (MRP)`,
    verdictDetail: `The quoted ₹${quotedPrice.toFixed(2)} is above the listed MRP/NPPA ceiling of ₹${(nppaCeiling || brandPrice).toFixed(2)}. Note: Retailers cannot charge above the printed MRP under Indian law.`,
    recommendedAction: 'Please check the printed MRP and batch sticker directly on the box before paying.',
    badgeColor: 'rose'
  };
}
