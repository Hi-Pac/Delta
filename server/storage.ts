import {
  users, type User, type InsertUser,
  customers, type Customer, type InsertCustomer,
  products, type Product, type InsertProduct,
  sales, type Sale, type InsertSale,
  saleItems, type SaleItem, type InsertSaleItem,
  returns, type Return, type InsertReturn,
  returnItems, type ReturnItem, type InsertReturnItem,
  payments, type Payment, type InsertPayment,
  customerBalances, type CustomerBalance
} from "@shared/schema";

// Define the storage interface with all required methods
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Omit<Customer, 'id'>>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Sales
  getAllSales(): Promise<Sale[]>;
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<Omit<Sale, 'id'>>): Promise<Sale | undefined>;
  getSaleItems(saleId: number): Promise<SaleItem[]>;
  addSaleItem(saleItem: InsertSaleItem): Promise<SaleItem>;

  // Returns
  getAllReturns(): Promise<Return[]>;
  getReturn(id: number): Promise<Return | undefined>;
  createReturn(returnItem: InsertReturn): Promise<Return>;
  getReturnItems(returnId: number): Promise<ReturnItem[]>;
  addReturnItem(returnItem: InsertReturnItem): Promise<ReturnItem>;

  // Payments
  getAllPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsBySale(saleId: number): Promise<Payment[]>;

  // Customer Balances
  getCustomerBalance(customerId: number): Promise<CustomerBalance | undefined>;
  updateCustomerBalance(customerId: number): Promise<CustomerBalance | undefined>;

  // Dashboard
  getDashboardStats(): Promise<{
    totalSales: number;
    totalCustomers: number;
    totalProducts: number;
    totalReturns: number;
  }>;
}

// Memory storage implementation for development/testing
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private customersMap: Map<number, Customer>;
  private productsMap: Map<number, Product>;
  private salesMap: Map<number, Sale>;
  private saleItemsMap: Map<number, SaleItem[]>;
  private returnsMap: Map<number, Return>;
  private returnItemsMap: Map<number, ReturnItem[]>;
  private paymentsMap: Map<number, Payment>;
  private customerBalancesMap: Map<number, CustomerBalance>;

  private userIdCounter: number;
  private customerIdCounter: number;
  private productIdCounter: number;
  private saleIdCounter: number;
  private saleItemIdCounter: number;
  private returnIdCounter: number;
  private returnItemIdCounter: number;
  private paymentIdCounter: number;

  constructor() {
    this.usersMap = new Map();
    this.customersMap = new Map();
    this.productsMap = new Map();
    this.salesMap = new Map();
    this.saleItemsMap = new Map();
    this.returnsMap = new Map();
    this.returnItemsMap = new Map();
    this.paymentsMap = new Map();
    this.customerBalancesMap = new Map();

    this.userIdCounter = 1;
    this.customerIdCounter = 1;
    this.productIdCounter = 1;
    this.saleIdCounter = 1;
    this.saleItemIdCounter = 1;
    this.returnIdCounter = 1;
    this.returnItemIdCounter = 1;
    this.paymentIdCounter = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.usersMap.set(id, user);
    return user;
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customersMap.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customersMap.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.customerIdCounter++;
    const now = new Date();
    const customer: Customer = { 
      ...insertCustomer, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.customersMap.set(id, customer);
    return customer;
  }

  async updateCustomer(id: number, customerData: Partial<Omit<Customer, 'id'>>): Promise<Customer | undefined> {
    const customer = this.customersMap.get(id);
    if (!customer) {
      return undefined;
    }

    const updatedCustomer: Customer = {
      ...customer,
      ...customerData,
      updatedAt: new Date()
    };
    this.customersMap.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const exists = this.customersMap.has(id);
    if (exists) {
      this.customersMap.delete(id);
      return true;
    }
    return false;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const product: Product = { 
      ...insertProduct, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.productsMap.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<Omit<Product, 'id'>>): Promise<Product | undefined> {
    const product = this.productsMap.get(id);
    if (!product) {
      return undefined;
    }

    const updatedProduct: Product = {
      ...product,
      ...productData,
      updatedAt: new Date()
    };
    this.productsMap.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const exists = this.productsMap.has(id);
    if (exists) {
      this.productsMap.delete(id);
      return true;
    }
    return false;
  }

  // Sales
  async getAllSales(): Promise<Sale[]> {
    return Array.from(this.salesMap.values());
  }

  async getSale(id: number): Promise<Sale | undefined> {
    return this.salesMap.get(id);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.saleIdCounter++;
    const now = new Date();
    
    // Generate invoice number
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const invoiceNumber = `INV-${year}${month}-${String(id).padStart(4, '0')}`;
    
    const sale: Sale = {
      ...insertSale,
      id,
      invoiceNumber,
      createdAt: now,
      updatedAt: now
    };
    
    this.salesMap.set(id, sale);
    this.saleItemsMap.set(id, []);
    
    // Update customer balance
    await this.updateCustomerBalance(sale.customerId);
    
    return sale;
  }

  async updateSale(id: number, saleData: Partial<Omit<Sale, 'id'>>): Promise<Sale | undefined> {
    const sale = this.salesMap.get(id);
    if (!sale) {
      return undefined;
    }

    const updatedSale: Sale = {
      ...sale,
      ...saleData,
      updatedAt: new Date()
    };
    this.salesMap.set(id, updatedSale);
    
    // Update customer balance
    await this.updateCustomerBalance(sale.customerId);
    
    return updatedSale;
  }

  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    return this.saleItemsMap.get(saleId) || [];
  }

  async addSaleItem(insertSaleItem: InsertSaleItem): Promise<SaleItem> {
    const id = this.saleItemIdCounter++;
    const saleItem: SaleItem = { ...insertSaleItem, id };
    
    const saleItems = this.saleItemsMap.get(saleItem.saleId) || [];
    saleItems.push(saleItem);
    this.saleItemsMap.set(saleItem.saleId, saleItems);
    
    // Update product stock
    const product = this.productsMap.get(saleItem.productId);
    if (product) {
      const updatedProduct = {
        ...product,
        stock: product.stock - saleItem.quantity,
        updatedAt: new Date()
      };
      this.productsMap.set(product.id, updatedProduct);
    }
    
    return saleItem;
  }

  // Returns
  async getAllReturns(): Promise<Return[]> {
    return Array.from(this.returnsMap.values());
  }

  async getReturn(id: number): Promise<Return | undefined> {
    return this.returnsMap.get(id);
  }

  async createReturn(insertReturn: InsertReturn): Promise<Return> {
    const id = this.returnIdCounter++;
    const now = new Date();
    
    // Generate return number
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const returnNumber = `RET-${year}${month}-${String(id).padStart(4, '0')}`;
    
    const returnItem: Return = {
      ...insertReturn,
      id,
      returnNumber,
      createdAt: now,
      updatedAt: now
    };
    
    this.returnsMap.set(id, returnItem);
    this.returnItemsMap.set(id, []);
    
    // Update customer balance
    await this.updateCustomerBalance(returnItem.customerId);
    
    return returnItem;
  }

  async getReturnItems(returnId: number): Promise<ReturnItem[]> {
    return this.returnItemsMap.get(returnId) || [];
  }

  async addReturnItem(insertReturnItem: InsertReturnItem): Promise<ReturnItem> {
    const id = this.returnItemIdCounter++;
    const returnItem: ReturnItem = { ...insertReturnItem, id };
    
    const returnItems = this.returnItemsMap.get(returnItem.returnId) || [];
    returnItems.push(returnItem);
    this.returnItemsMap.set(returnItem.returnId, returnItems);
    
    // Update product stock
    const product = this.productsMap.get(returnItem.productId);
    if (product) {
      const updatedProduct = {
        ...product,
        stock: product.stock + returnItem.quantity,
        updatedAt: new Date()
      };
      this.productsMap.set(product.id, updatedProduct);
    }
    
    return returnItem;
  }

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.paymentsMap.values());
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.paymentsMap.get(id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const now = new Date();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: now
    };
    
    this.paymentsMap.set(id, payment);
    
    // Update sale payment status
    const sale = this.salesMap.get(payment.saleId);
    if (sale) {
      const payments = await this.getPaymentsBySale(payment.saleId);
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      
      let paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' = 'pending';
      if (totalPaid >= Number(sale.totalAmount)) {
        paymentStatus = 'paid';
      } else if (totalPaid > 0) {
        paymentStatus = 'partially_paid';
      }
      
      const updatedSale = {
        ...sale,
        paymentStatus,
        updatedAt: new Date()
      };
      this.salesMap.set(sale.id, updatedSale);
      
      // Update customer balance
      await this.updateCustomerBalance(sale.customerId);
    }
    
    return payment;
  }

  async getPaymentsBySale(saleId: number): Promise<Payment[]> {
    return Array.from(this.paymentsMap.values()).filter(
      payment => payment.saleId === saleId
    );
  }

  // Customer Balances
  async getCustomerBalance(customerId: number): Promise<CustomerBalance | undefined> {
    return this.customerBalancesMap.get(customerId);
  }

  async updateCustomerBalance(customerId: number): Promise<CustomerBalance | undefined> {
    // Calculate total sales
    const customerSales = Array.from(this.salesMap.values()).filter(
      sale => sale.customerId === customerId
    );
    const totalSales = customerSales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
    
    // Calculate total returns
    const customerReturns = Array.from(this.returnsMap.values()).filter(
      returnItem => returnItem.customerId === customerId
    );
    const totalReturns = customerReturns.reduce((sum, returnItem) => sum + Number(returnItem.totalAmount), 0);
    
    // Calculate total payments
    let totalPayments = 0;
    for (const sale of customerSales) {
      const paymentsForSale = await this.getPaymentsBySale(sale.id);
      totalPayments += paymentsForSale.reduce((sum, payment) => sum + Number(payment.amount), 0);
    }
    
    // Calculate balance
    const balance = totalSales - totalPayments - totalReturns;
    const now = new Date();
    
    // Create or update balance
    const customerBalance: CustomerBalance = {
      id: customerId,
      customerId,
      totalSales: String(totalSales),
      totalPayments: String(totalPayments),
      totalReturns: String(totalReturns),
      balance: String(balance),
      updatedAt: now
    };
    
    this.customerBalancesMap.set(customerId, customerBalance);
    return customerBalance;
  }

  // Dashboard
  async getDashboardStats(): Promise<{
    totalSales: number;
    totalCustomers: number;
    totalProducts: number;
    totalReturns: number;
  }> {
    // Calculate total sales amount
    const totalSales = Array.from(this.salesMap.values()).reduce(
      (sum, sale) => sum + Number(sale.totalAmount), 0
    );
    
    return {
      totalSales,
      totalCustomers: this.customersMap.size,
      totalProducts: this.productsMap.size,
      totalReturns: this.returnsMap.size
    };
  }
}

// Export the storage instance
export const storage = new MemStorage();
