import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, type User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Customer types
export type CustomerClassification = "institution" | "store" | "individual";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  classification: CustomerClassification;
  discountPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export type ProductCategory = "construction" | "external_facades" | "decorative";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  colorOrBatch: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Invoice related types
export type PaymentMethod = "cash" | "credit_card" | "bank_transfer" | "check";
export type InvoiceStatus = "pending" | "paid" | "partially_paid" | "overdue" | "cancelled";

export interface SaleItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  date: Date;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: InvoiceStatus;
  notes: string;
  items: SaleItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReturnItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Return {
  id: string;
  returnNumber: string;
  saleId: string;
  customerId: string;
  customer?: Customer;
  date: Date;
  totalAmount: number;
  reason: string;
  items: ReturnItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  saleId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: Date;
  reference: string;
  createdBy: string;
  createdAt: Date;
}

export interface CustomerBalance {
  customerId: string;
  totalSales: number;
  totalPayments: number;
  totalReturns: number;
  balance: number;
  updatedAt: Date;
}

// Authentication functions
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

export const registerUser = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  
  // Create user document in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    email,
    displayName,
    role: "user",
    createdAt: new Date(),
    lastLogin: new Date()
  });
  
  return userCredential.user;
};

// Firestore CRUD functions

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  const customersRef = collection(db, "customers");
  const snapshot = await getDocs(customersRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  } as Customer));
};

export const getCustomer = async (id: string): Promise<Customer | null> => {
  const docRef = doc(db, "customers", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
    } as Customer;
  }
  
  return null;
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = new Date();
  const customerData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await addDoc(collection(db, "customers"), customerData);
  return docRef.id;
};

export const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<void> => {
  const docRef = doc(db, "customers", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date()
  });
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "customers", id));
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  } as Product));
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, "products", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
    } as Product;
  }
  
  return null;
};

export const createProduct = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = new Date();
  const productData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await addDoc(collection(db, "products"), productData);
  return docRef.id;
};

export const updateProduct = async (id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> => {
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date()
  });
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "products", id));
};

// Sales
export const getSales = async (): Promise<Sale[]> => {
  const salesRef = collection(db, "sales");
  const snapshot = await getDocs(salesRef);
  const sales = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  } as Sale));
  
  // Get items for each sale
  for (const sale of sales) {
    const itemsRef = collection(db, "sales", sale.id, "items");
    const itemsSnapshot = await getDocs(itemsRef);
    
    sale.items = itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SaleItem));
  }
  
  return sales;
};

export const getSale = async (id: string): Promise<Sale | null> => {
  const docRef = doc(db, "sales", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const sale = {
      id: docSnap.id,
      ...docSnap.data(),
      date: docSnap.data().date?.toDate() || new Date(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
    } as Sale;
    
    // Get customer
    if (sale.customerId) {
      sale.customer = await getCustomer(sale.customerId);
    }
    
    // Get items
    const itemsRef = collection(db, "sales", id, "items");
    const itemsSnapshot = await getDocs(itemsRef);
    
    sale.items = await Promise.all(itemsSnapshot.docs.map(async doc => {
      const item = {
        id: doc.id,
        ...doc.data()
      } as SaleItem;
      
      // Get product details
      if (item.productId) {
        item.product = await getProduct(item.productId);
      }
      
      return item;
    }));
    
    return sale;
  }
  
  return null;
};

export const createSale = async (
  data: Omit<Sale, 'id' | 'items' | 'createdAt' | 'updatedAt'>, 
  items: Omit<SaleItem, 'id'>[]
): Promise<string> => {
  const now = new Date();
  const saleData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  // Generate invoice number
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const querySnapshot = await getDocs(
    query(collection(db, "sales"), orderBy("createdAt", "desc"), limit(1))
  );
  
  let lastNumber = 0;
  if (!querySnapshot.empty) {
    const lastInvoice = querySnapshot.docs[0].data().invoiceNumber || '';
    const match = lastInvoice.match(/\d+$/);
    if (match) {
      lastNumber = parseInt(match[0], 10);
    }
  }
  
  saleData.invoiceNumber = `INV-${year}${month}-${String(lastNumber + 1).padStart(4, '0')}`;
  
  // Create sale document
  const docRef = await addDoc(collection(db, "sales"), saleData);
  
  // Add items to the sale
  for (const item of items) {
    await addDoc(collection(db, "sales", docRef.id, "items"), item);
    
    // Update product stock
    const product = await getProduct(item.productId);
    if (product) {
      await updateProduct(item.productId, {
        stock: product.stock - item.quantity
      });
    }
  }
  
  // Update customer balance
  await updateCustomerBalance(data.customerId);
  
  return docRef.id;
};

export const updateSale = async (
  id: string, 
  data: Partial<Omit<Sale, 'id' | 'items' | 'createdAt'>>,
  items?: Omit<SaleItem, 'id'>[]
): Promise<void> => {
  const docRef = doc(db, "sales", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date()
  });
  
  if (items) {
    // Get existing items to adjust inventory
    const sale = await getSale(id);
    if (sale) {
      // Remove existing items and add new ones
      const itemsRef = collection(db, "sales", id, "items");
      const itemsSnapshot = await getDocs(itemsRef);
      
      // Delete existing items
      for (const doc of itemsSnapshot.docs) {
        const item = doc.data() as SaleItem;
        // Return items to inventory
        const product = await getProduct(item.productId);
        if (product) {
          await updateProduct(item.productId, {
            stock: product.stock + item.quantity
          });
        }
        await deleteDoc(doc.ref);
      }
      
      // Add new items
      for (const item of items) {
        await addDoc(collection(db, "sales", id, "items"), item);
        
        // Update product stock
        const product = await getProduct(item.productId);
        if (product) {
          await updateProduct(item.productId, {
            stock: product.stock - item.quantity
          });
        }
      }
    }
  }
  
  // Update customer balance
  const sale = await getSale(id);
  if (sale) {
    await updateCustomerBalance(sale.customerId);
  }
};

// Returns
export const getReturns = async (): Promise<Return[]> => {
  const returnsRef = collection(db, "returns");
  const snapshot = await getDocs(returnsRef);
  const returns = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date()
  } as Return));
  
  // Get items for each return
  for (const returnDoc of returns) {
    const itemsRef = collection(db, "returns", returnDoc.id, "items");
    const itemsSnapshot = await getDocs(itemsRef);
    
    returnDoc.items = itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ReturnItem));
  }
  
  return returns;
};

export const getReturn = async (id: string): Promise<Return | null> => {
  const docRef = doc(db, "returns", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const returnDoc = {
      id: docSnap.id,
      ...docSnap.data(),
      date: docSnap.data().date?.toDate() || new Date(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
    } as Return;
    
    // Get customer
    if (returnDoc.customerId) {
      returnDoc.customer = await getCustomer(returnDoc.customerId);
    }
    
    // Get items
    const itemsRef = collection(db, "returns", id, "items");
    const itemsSnapshot = await getDocs(itemsRef);
    
    returnDoc.items = await Promise.all(itemsSnapshot.docs.map(async doc => {
      const item = {
        id: doc.id,
        ...doc.data()
      } as ReturnItem;
      
      // Get product details
      if (item.productId) {
        item.product = await getProduct(item.productId);
      }
      
      return item;
    }));
    
    return returnDoc;
  }
  
  return null;
};

export const createReturn = async (
  data: Omit<Return, 'id' | 'items' | 'createdAt' | 'updatedAt'>, 
  items: Omit<ReturnItem, 'id'>[]
): Promise<string> => {
  const now = new Date();
  const returnData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  // Generate return number
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const querySnapshot = await getDocs(
    query(collection(db, "returns"), orderBy("createdAt", "desc"), limit(1))
  );
  
  let lastNumber = 0;
  if (!querySnapshot.empty) {
    const lastReturn = querySnapshot.docs[0].data().returnNumber || '';
    const match = lastReturn.match(/\d+$/);
    if (match) {
      lastNumber = parseInt(match[0], 10);
    }
  }
  
  returnData.returnNumber = `RET-${year}${month}-${String(lastNumber + 1).padStart(4, '0')}`;
  
  // Create return document
  const docRef = await addDoc(collection(db, "returns"), returnData);
  
  // Add items to the return
  for (const item of items) {
    await addDoc(collection(db, "returns", docRef.id, "items"), item);
    
    // Update product stock
    const product = await getProduct(item.productId);
    if (product) {
      await updateProduct(item.productId, {
        stock: product.stock + item.quantity
      });
    }
  }
  
  // Update customer balance
  await updateCustomerBalance(data.customerId);
  
  return docRef.id;
};

// Payments
export const getPayments = async (): Promise<Payment[]> => {
  const paymentsRef = collection(db, "payments");
  const snapshot = await getDocs(paymentsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  } as Payment));
};

export const getPaymentsBySale = async (saleId: string): Promise<Payment[]> => {
  const paymentsRef = collection(db, "payments");
  const q = query(paymentsRef, where("saleId", "==", saleId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  } as Payment));
};

export const createPayment = async (data: Omit<Payment, 'id' | 'createdAt'>): Promise<string> => {
  const paymentData = {
    ...data,
    createdAt: new Date()
  };
  
  const docRef = await addDoc(collection(db, "payments"), paymentData);
  
  // Update sale payment status
  const sale = await getSale(data.saleId);
  if (sale) {
    const payments = await getPaymentsBySale(data.saleId);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    let paymentStatus: InvoiceStatus = "pending";
    if (totalPaid >= sale.totalAmount) {
      paymentStatus = "paid";
    } else if (totalPaid > 0) {
      paymentStatus = "partially_paid";
    }
    
    await updateSale(data.saleId, { paymentStatus });
    
    // Update customer balance
    await updateCustomerBalance(sale.customerId);
  }
  
  return docRef.id;
};

// Customer Balance
export const getCustomerBalance = async (customerId: string): Promise<CustomerBalance | null> => {
  const docRef = doc(db, "customerBalances", customerId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      ...docSnap.data(),
      updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
    } as CustomerBalance;
  }
  
  return null;
};

export const updateCustomerBalance = async (customerId: string): Promise<void> => {
  // Calculate total sales
  const salesRef = collection(db, "sales");
  const salesQuery = query(salesRef, where("customerId", "==", customerId));
  const salesSnapshot = await getDocs(salesQuery);
  
  const totalSales = salesSnapshot.docs.reduce((sum, doc) => {
    return sum + (doc.data().totalAmount || 0);
  }, 0);
  
  // Calculate total returns
  const returnsRef = collection(db, "returns");
  const returnsQuery = query(returnsRef, where("customerId", "==", customerId));
  const returnsSnapshot = await getDocs(returnsQuery);
  
  const totalReturns = returnsSnapshot.docs.reduce((sum, doc) => {
    return sum + (doc.data().totalAmount || 0);
  }, 0);
  
  // Calculate total payments
  let totalPayments = 0;
  for (const saleDoc of salesSnapshot.docs) {
    const paymentsForSale = await getPaymentsBySale(saleDoc.id);
    totalPayments += paymentsForSale.reduce((sum, payment) => sum + payment.amount, 0);
  }
  
  // Calculate balance
  const balance = totalSales - totalPayments - totalReturns;
  
  // Update or create the balance document
  const balanceRef = doc(db, "customerBalances", customerId);
  const balanceSnap = await getDoc(balanceRef);
  
  if (balanceSnap.exists()) {
    await updateDoc(balanceRef, {
      totalSales,
      totalPayments,
      totalReturns,
      balance,
      updatedAt: new Date()
    });
  } else {
    await setDoc(balanceRef, {
      customerId,
      totalSales,
      totalPayments,
      totalReturns,
      balance,
      updatedAt: new Date()
    });
  }
};

// Dashboard data
export const getDashboardStats = async () => {
  // Get total sales
  const salesRef = collection(db, "sales");
  const salesSnapshot = await getDocs(salesRef);
  const totalSales = salesSnapshot.docs.reduce((sum, doc) => {
    return sum + (doc.data().totalAmount || 0);
  }, 0);
  
  // Get total customers
  const customersRef = collection(db, "customers");
  const customersSnapshot = await getDocs(customersRef);
  const totalCustomers = customersSnapshot.size;
  
  // Get total products
  const productsRef = collection(db, "products");
  const productsSnapshot = await getDocs(productsRef);
  const totalProducts = productsSnapshot.size;
  
  // Get total returns
  const returnsRef = collection(db, "returns");
  const returnsSnapshot = await getDocs(returnsRef);
  const totalReturns = returnsSnapshot.size;
  
  return {
    totalSales,
    totalCustomers,
    totalProducts,
    totalReturns
  };
};

export const getRecentSales = async (limit: number = 5) => {
  const salesRef = collection(db, "sales");
  const q = query(salesRef, orderBy("createdAt", "desc"), limit(limit));
  const snapshot = await getDocs(q);
  
  const sales = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate() || new Date()
  }));
  
  // Get customer details for each sale
  return Promise.all(sales.map(async (sale) => {
    const customer = await getCustomer(sale.customerId);
    return {
      ...sale,
      customer
    };
  }));
};

export const getRecentCustomers = async (limit: number = 5) => {
  const customersRef = collection(db, "customers");
  const q = query(customersRef, orderBy("createdAt", "desc"), limit(limit));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  }));
};

export const getTopProducts = async (limit: number = 5) => {
  // This is a simplification, in a real app you'd track product sales
  const productsRef = collection(db, "products");
  const q = query(productsRef, orderBy("stock", "desc"), limit(limit));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export { app, auth, db, storage, onAuthStateChanged };
