import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export interface SavedMedicineItem {
  id: string;
  userId: string;
  brandName: string;
  saltComposition: string;
  dosageForm: string;
  strength: string;
  brandPrice: number;
  genericName: string;
  pmbjpCode: string;
  genericPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  savedAt: string;
}

const LOCAL_STORAGE_KEY = 'jan_aushadhi_saved_medicines_v2';

export function useFirebaseSavedMedicines() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [savedItems, setSavedItems] = useState<SavedMedicineItem[]>(() => {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_KEY);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Track auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore when user is authenticated
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const path = `users/${user.uid}/savedMedicines`;
    const colRef = collection(db, 'users', user.uid, 'savedMedicines');

    const unsubscribeSnapshot = onSnapshot(
      colRef,
      (snapshot) => {
        const items: SavedMedicineItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as SavedMedicineItem);
        });
        setSavedItems(items);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
          console.warn('Storage sync error:', e);
        }
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribeSnapshot();
  }, [user]);

  // Add or update medicine in Firestore (and localStorage)
  const saveMedicine = async (item: Omit<SavedMedicineItem, 'id' | 'userId' | 'savedAt'>) => {
    const id = item.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 64);
    const userId = user?.uid || 'guest_user';
    const completeItem: SavedMedicineItem = {
      ...item,
      id,
      userId,
      savedAt: new Date().toISOString(),
    };

    if (user) {
      const path = `users/${user.uid}/savedMedicines/${id}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'savedMedicines', id), completeItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const updated = [...savedItems.filter(i => i.id !== id), completeItem];
      setSavedItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Remove medicine
  const removeMedicine = async (id: string) => {
    if (user) {
      const path = `users/${user.uid}/savedMedicines/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'savedMedicines', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      const updated = savedItems.filter(i => i.id !== id);
      setSavedItems(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const isSaved = (brandName: string) => {
    const id = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 64);
    return savedItems.some(i => i.id === id);
  };

  const totalMonthlySavings = savedItems.reduce((acc, curr) => acc + curr.savingsAmount, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    user,
    savedItems,
    loading,
    saveMedicine,
    removeMedicine,
    isSaved,
    totalMonthlySavings,
    totalAnnualSavings,
  };
}
