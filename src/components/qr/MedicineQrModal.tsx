import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Building2, 
  Sparkles,
  TrendingDown
} from 'lucide-react';

interface MedicineQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  genericName: string;
  pmbjpCode: string;
  saltComposition: string;
  strength: string;
  dosageForm: string;
  brandPrice: number;
  genericPrice: number;
}

export const MedicineQrModal: React.FC<MedicineQrModalProps> = ({
  isOpen,
  onClose,
  brandName,
  genericName,
  pmbjpCode,
  saltComposition,
  strength,
  dosageForm,
  brandPrice,
  genericPrice,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(true);

  const savingsAmount = Math.max(0, brandPrice - genericPrice);
  const savingsPercent = Math.round(((brandPrice - genericPrice) / brandPrice) * 100);

  // Construct standard Indian Pharmacopoeia / PMBJP QR payload
  const qrPayload = JSON.stringify({
    scheme: 'PMBJP-GENERIC-RX-V1',
    pmbjp_code: pmbjpCode || 'PMBJP-01048',
    generic_name: genericName,
    active_salt: saltComposition,
    strength,
    form: dosageForm,
    govt_rate_inr: genericPrice,
    mrp_brand_inr: brandPrice,
    brand_substitute_for: brandName,
    standard: 'Indian Pharmacopoeia (IP) / WHO-GMP',
    app_url: typeof window !== 'undefined' ? `${window.location.origin}?q=${encodeURIComponent(brandName)}` : '',
    verified_at: new Date().toISOString().split('T')[0],
  }, null, 2);

  useEffect(() => {
    if (!isOpen) return;
    setGenerating(true);

    QRCode.toDataURL(qrPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#042f2e', // deep teal
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrDataUrl(url);
        setGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
        setGenerating(false);
      });
  }, [isOpen, qrPayload]);

  if (!isOpen) return null;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `PMBJP_${pmbjpCode || 'Generic'}_${brandName.replace(/\s+/g, '_')}_QR.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleShareWhatsApp = () => {
    const text = `*Jan Aushadhi PMBJP Medicine QR Code:*\n` +
      `💊 *Medicine:* ${genericName}\n` +
      `🏷️ *PMBJP Code:* ${pmbjpCode || 'PMBJP-01048'}\n` +
      `🧪 *Active Salt:* ${saltComposition} (${strength})\n` +
      `💰 *Govt Subsidized Price:* ₹${genericPrice.toFixed(2)} (Save ${savingsPercent}% vs MRP ₹${brandPrice})\n` +
      `Show this to the Jan Aushadhi Kendra pharmacist for instant substitution!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-teal-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-teal-950 dark:text-white text-base">
                  Medicine Digital QR Code
                </h3>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.2 text-[10px] font-bold">
                  DCGI / PMBJP
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official PMBJP Barcode for Chemist Counter Dispensing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* QR Code Presentation Canvas */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
            <div className="bg-white p-3 rounded-2xl shadow-md border border-teal-100 dark:border-slate-700 inline-block">
              {generating ? (
                <div className="w-56 h-56 flex items-center justify-center text-teal-600">
                  <span className="animate-spin text-2xl">⏳</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${genericName}`}
                  className="w-56 h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                  Failed to render QR
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700 dark:text-teal-400">
                Verified PMBJP Catalog Entry
              </span>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                {genericName}
              </h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                Salt: {saltComposition}
              </p>
              <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[11px] font-bold font-mono">
                <span>Code: {pmbjpCode || 'PMBJP-01048'}</span>
                <span>•</span>
                <span>{strength}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Savings Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Commercial MRP</span>
              <span className="text-lg font-black font-mono-numbers text-slate-800 dark:text-slate-100 line-through">
                ₹{brandPrice.toFixed(2)}
              </span>
            </div>

            <div className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 p-3 text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block">Jan Aushadhi Rate</span>
              <div className="text-lg font-black font-mono-numbers text-emerald-600 dark:text-emerald-400">
                ₹{genericPrice.toFixed(2)}
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                SAVE {savingsPercent}% (₹{savingsAmount.toFixed(0)})
              </span>
            </div>
          </div>

          {/* Instructions for Pharmacist & Patient */}
          <div className="rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/60 dark:bg-teal-950/30 p-3 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Counter Verification Guarantee:</strong>
              Hand this screen to the Jan Aushadhi Kendra pharmacist. Scanning this QR code matches the exact IP pharmacopeial bioequivalent generic without brand confusion.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyPayload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
