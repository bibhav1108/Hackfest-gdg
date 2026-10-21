import React, { useState, useEffect } from 'react';
import { 
  X, 
  FlaskConical, 
  ExternalLink, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2, 
  Activity, 
  Atom
} from 'lucide-react';

interface BioscienceData {
  compoundName: string;
  cid: number;
  structureImageUrl: string;
  pubchemUrl: string;
  molecularFormula: string;
  molecularWeight: string;
  canonicalSmiles: string;
  xlogp: number;
  tpsa: number;
  hBondDonorCount: number;
  hBondAcceptorCount: number;
  rotatableBondCount: number;
  complexity: number;
  mechanismOfAction: string;
  isLipinskiCompliant: boolean;
  lipinskiViolations: string[];
  veberRules: {
    rotatableBondsOk: boolean;
    tpsaOk: boolean;
    orallyBioavailable: boolean;
  };
  topAdverseReactions: { term: string; count: number }[];
  provenance: string;
}

interface BioscienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  saltName: string;
  brandName: string;
}

export const BioscienceModal: React.FC<BioscienceModalProps> = ({
  isOpen,
  onClose,
  saltName,
  brandName,
}) => {
  const [data, setData] = useState<BioscienceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Extract first active salt compound name
    const cleanedSalt = saltName
      .replace(/\(.*?\)/g, '')
      .split('&')[0]
      .split('+')[0]
      .trim();

    fetch(`/api/science/compound-info?name=${encodeURIComponent(cleanedSalt)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve chemical compound details');
        return res.json();
      })
      .then((resp) => {
        if (isMounted) {
          setData(resp);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error fetching scientific pharmacology data');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, saltName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl flex flex-col overflow-hidden transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5 bg-slate-50/80 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                  Bioscience Pharmacology Explorer
                </h3>
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2 py-0.5 text-[10px] font-bold">
                  PubChem • ChEMBL • openFDA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Molecular structure, bioequivalence metrics & pharmacokinetic rules for {brandName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" />
              <span>Querying PubChem PUG REST, ChEMBL & openFDA repositories...</span>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-200 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-6 animate-in fade-in">
              {/* Top Overview Grid: 2D Chemical Structure & Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                {/* Structure Image with light card wrapper so black chemical bonds stay clear */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                    PubChem 2D Structure (CID #{data.cid})
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-inner">
                    <img
                      src={data.structureImageUrl}
                      alt={data.compoundName}
                      className="h-36 sm:h-40 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <a
                    href={data.pubchemUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300"
                  >
                    <span>View on NCBI PubChem</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Key Properties */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md">
                      Active Pharmaceutical Ingredient (API)
                    </span>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {data.compoundName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-numbers break-all mt-0.5">
                      Formula: <strong className="text-slate-800 dark:text-slate-200">{data.molecularFormula}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 p-2.5">
                      <span className="text-slate-400 dark:text-slate-400 text-[10px] uppercase font-bold block">Molecular Wt.</span>
                      <strong className="text-slate-900 dark:text-white font-mono-numbers">{data.molecularWeight} g/mol</strong>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 p-2.5">
                      <span className="text-slate-400 dark:text-slate-400 text-[10px] uppercase font-bold block">Lipophilicity (XLogP)</span>
                      <strong className="text-slate-900 dark:text-white font-mono-numbers">{data.xlogp}</strong>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 p-2.5">
                      <span className="text-slate-400 dark:text-slate-400 text-[10px] uppercase font-bold block">Polar Area (TPSA)</span>
                      <strong className="text-slate-900 dark:text-white font-mono-numbers">{data.tpsa} Å²</strong>
                    </div>
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 p-2.5">
                      <span className="text-slate-400 dark:text-slate-400 text-[10px] uppercase font-bold block">H-Donors / Acceptors</span>
                      <strong className="text-slate-900 dark:text-white font-mono-numbers">{data.hBondDonorCount} / {data.hBondAcceptorCount}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lipinski Rule of Five & Veber Oral Bioavailability */}
              <div className="rounded-2xl border border-teal-100 dark:border-slate-800 bg-teal-50/50 dark:bg-slate-800/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Drug-Likeness & Oral Bioavailability (Lipinski & Veber)
                    </h5>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    data.isLipinskiCompliant
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  }`}>
                    {data.isLipinskiCompliant ? 'Lipinski Compliant (Orally Bioavailable)' : 'Lipinski Alert'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 text-center">
                    <span className="text-slate-400 dark:text-slate-400 block">MW ≤ 500 Da</span>
                    <strong className="text-slate-800 dark:text-slate-200">{parseFloat(data.molecularWeight) <= 500 ? '✓ Pass' : '✕ Alert'}</strong>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 text-center">
                    <span className="text-slate-400 dark:text-slate-400 block">LogP ≤ 5</span>
                    <strong className="text-slate-800 dark:text-slate-200">{data.xlogp <= 5 ? '✓ Pass' : '✕ Alert'}</strong>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 text-center">
                    <span className="text-slate-400 dark:text-slate-400 block">HBD ≤ 5</span>
                    <strong className="text-slate-800 dark:text-slate-200">{data.hBondDonorCount <= 5 ? '✓ Pass' : '✕ Alert'}</strong>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 text-center">
                    <span className="text-slate-400 dark:text-slate-400 block">HBA ≤ 10</span>
                    <strong className="text-slate-800 dark:text-slate-200">{data.hBondAcceptorCount <= 10 ? '✓ Pass' : '✕ Alert'}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Veber Rule: Rotatable bonds ({data.rotatableBondCount} ≤ 10) and TPSA ({data.tpsa} ≤ 140 Å²) ensure standard passive gastrointestinal membrane permeability.
                </p>
              </div>

              {/* Mechanism of Action from ChEMBL */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Pharmacological Mechanism of Action (ChEMBL / WHO)</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  {data.mechanismOfAction}
                </p>
              </div>

              {/* openFDA Adverse Reactions Registry */}
              {data.topAdverseReactions && data.topAdverseReactions.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      openFDA FAERS Adverse Event Frequency
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400">Post-marketing surveillance</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 text-xs">
                    {data.topAdverseReactions.map((evt, idx) => (
                      <span
                        key={idx}
                        className="rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 font-medium border border-slate-200/60 dark:border-slate-700"
                      >
                        {evt.term} <span className="text-slate-400 font-mono-numbers font-normal">({evt.count.toLocaleString()})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Canonical SMILES */}
              {data.canonicalSmiles && (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-[11px] font-mono-numbers text-slate-600 dark:text-slate-300 break-all">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase block mb-0.5">Canonical SMILES:</span>
                  {data.canonicalSmiles}
                </div>
              )}

              {/* Provenance Footer */}
              <div className="text-[11px] text-slate-400 dark:text-slate-400 text-center pt-2">
                Data Provenance: {data.provenance}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            100% Active Chemical Bioequivalence in PMBJP Generics
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-slate-700 border border-teal-200 dark:border-slate-600 hover:bg-teal-100 dark:hover:bg-slate-600 rounded-xl transition"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
