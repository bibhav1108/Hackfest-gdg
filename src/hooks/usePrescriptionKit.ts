import { useState, useEffect } from 'react';
import { KitItem } from '../components/prescription/PrescriptionKitModal';

const KIT_STORAGE_KEY = 'jan_aushadhi_prescription_kit_v1';

export function usePrescriptionKit() {
  const [kitItems, setKitItems] = useState<KitItem[]>(() => {
    try {
      const stored = localStorage.getItem(KIT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KIT_STORAGE_KEY, JSON.stringify(kitItems));
    } catch (e) {
      console.warn('Failed to persist prescription kit:', e);
    }
  }, [kitItems]);

  const addToKit = (item: Omit<KitItem, 'monthlyPacks'>, quantity: number = 1) => {
    setKitItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id || i.brandName === item.brandName);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].monthlyPacks += quantity;
        return updated;
      }
      return [...prev, { ...item, monthlyPacks: quantity }];
    });
  };

  const removeFromKit = (id: string) => {
    setKitItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setKitItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, monthlyPacks: Math.max(1, qty) } : i))
    );
  };

  const addPreset = (presetItems: KitItem[]) => {
    setKitItems(presetItems);
  };

  const isInKit = (brandName: string) => {
    return kitItems.some((i) => i.brandName.toLowerCase() === brandName.toLowerCase());
  };

  const totalMonthlySavings = kitItems.reduce(
    (sum, it) => sum + Math.max(0, it.brandPrice - it.genericPrice) * it.monthlyPacks,
    0
  );

  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    kitItems,
    addToKit,
    removeFromKit,
    updateQuantity,
    addPreset,
    isInKit,
    totalMonthlySavings,
    totalAnnualSavings,
  };
}
