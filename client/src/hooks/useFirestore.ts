import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  QueryConstraint,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { firestore } from "@/config/firebase";

// Generic hook for fetching a collection
export const useCollection = <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  deps: any[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(collection(firestore, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);
        
        const results: T[] = [];
        querySnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() } as T;
          
          // Convert Firestore Timestamps to regular dates for easier handling
          Object.keys(data).forEach(key => {
            if (data[key] instanceof Timestamp) {
              data[key] = (data[key] as Timestamp).toDate();
            }
          });
          
          results.push(data);
        });
        
        setData(results);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching collection:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, deps);

  return { data, loading, error };
};

// Hook for fetching a single document
export const useDocument = <T extends DocumentData>(
  collectionName: string,
  documentId: string | null,
  deps: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        setLoading(true);
        const docRef = doc(firestore, collectionName, documentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const docData = { id: docSnap.id, ...docSnap.data() } as T;
          
          // Convert Firestore Timestamps to regular dates
          Object.keys(docData).forEach(key => {
            if (docData[key] instanceof Timestamp) {
              docData[key] = (docData[key] as Timestamp).toDate();
            }
          });
          
          setData(docData);
        } else {
          setData(null);
        }
        
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        console.error("Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [collectionName, documentId, ...deps]);

  return { data, loading, error };
};

// Utility functions for CRUD operations
export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> => {
  try {
    // Add createdAt timestamp
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(firestore, collectionName), dataWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  try {
    // Add updatedAt timestamp
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    const docRef = doc(firestore, collectionName, documentId);
    await updateDoc(docRef, dataWithTimestamp);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (
  collectionName: string,
  documentId: string
): Promise<void> => {
  try {
    const docRef = doc(firestore, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};
