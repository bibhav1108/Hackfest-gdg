import React, { useState } from 'react';
import { X, Plus, AlertCircle, Pill, User, Stethoscope, Clock, ShieldCheck } from 'lucide-react';
import { Medication, Prescription } from '../../types/pharmacy';

interface NewPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  onAddPrescription: (newRx: Omit<Prescription, 'id'>) => void;
}

export const NewPrescriptionModal: React.FC<NewPrescriptionModalProps> = ({
  isOpen,
  onClose,
  medications,
  onAddPrescription,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(35);
  const [doctorName, setDoctorName] = useState('Dr. Arthur Pendelton');
  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id || '');
  const [dosage, setDosage] = useState('1 cap TDS x 7 days');
  const [frequency, setFrequency] = useState('7:00 PM');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedMed = medications.find((m) => m.id === selectedMedId) || medications[0];
  const estimatedAmount = selectedMed ? selectedMed.unitPrice * 2 : 25;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Please enter a patient name');
      return;
    }

    const rxCode = `RX-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    onAddPrescription({
      rxNumber: rxCode,
      patientName: patientName.trim(),
      age: patientAge,
      doctorName,
      medicationName: `${selectedMed.name} ${selectedMed.dosage}`,
      dosage,
      frequency,
      prescribedTime: 'Just now',
      status: 'pending',
      amount: estimatedAmount,
      priority,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0e1d2c] text-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b344d] px-6 py-4 bg-[#0a1622]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 border border-teal-500/40 text-teal-300">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white tracking-wide text-sm">
                New Prescription Entry
              </h3>
              <p className="text-[11px] text-slate-400">
                Official Clinical Dispensing Record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                <User className="w-3 h-3 text-teal-400" /> Patient Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Eleanor Vance"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  setError('');
                }}
                className="w-full rounded-lg bg-[#142637] border border-[#203a54] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full rounded-lg bg-[#142637] border border-[#203a54] px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Physician */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-teal-400" /> Prescribing Physician
            </label>
            <select
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full rounded-lg bg-[#142637] border border-[#203a54] px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="Dr. Arthur Pendelton">Dr. Arthur Pendelton (Internal Medicine)</option>
              <option value="Dr. Clara Higgins">Dr. Clara Higgins (Cardiology)</option>
              <option value="Dr. Robert Mercer">Dr. Robert Mercer (Pulmonology)</option>
              <option value="Dr. Julian Croft">Dr. Julian Croft (General Practice)</option>
            </select>
          </div>

          {/* Medication Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
              <Pill className="w-3 h-3 text-teal-400" /> Select Medication & Stock
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full rounded-lg bg-[#142637] border border-[#203a54] px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              {medications.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name} ({med.dosage}) - {med.stock} units available [${med.unitPrice.toFixed(2)}]
                </option>
              ))}
            </select>
          </div>

          {/* Dosage & Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Dosage Regimen</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="1 tab TDS after meals"
                className="w-full rounded-lg bg-[#142637] border border-[#203a54] px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-teal-400" /> Dispense Slot
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-lg bg-[#142637] border border-[#203a54] px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="7:00 PM">7:00 PM (Evening)</option>
                <option value="2:00 AM">2:00 AM (Night)</option>
                <option value="1:00 PM">1:00 PM (Afternoon)</option>
                <option value="2:00 PM">2:00 PM (Afternoon)</option>
                <option value="8:00 AM">8:00 AM (Morning)</option>
              </select>
            </div>
          </div>

          {/* Priority & Clinical Notes */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Priority</label>
              <div className="flex gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`flex-1 py-1.5 text-xs rounded font-medium transition ${
                    priority === 'normal'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-[#142637] text-slate-400'
                  }`}
                >
                  Routine
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`flex-1 py-1.5 text-xs rounded font-medium transition ${
                    priority === 'urgent'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-[#142637] text-slate-400'
                  }`}
                >
                  Urgent
                </button>
              </div>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Pharmacist Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Allergy check, interaction warnings..."
                className="w-full rounded-lg bg-[#142637] border border-[#203a54] px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Price summary */}
          <div className="rounded-lg bg-[#0b1622] border border-[#1b344d] p-3 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Estimated Total Billable:
            </div>
            <div className="font-mono-numbers text-base font-bold text-teal-300">
              ${estimatedAmount.toFixed(2)}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#1b344d] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-[#142637] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs shadow-md transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Issue & Queue Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
