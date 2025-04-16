import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

// Customer classifications
export const customerClassificationEnum = z.enum(["institution", "store", "individual"]);
export type CustomerClassification = z.infer<typeof customerClassificationEnum>;

// Customer schema
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  classification: text("classification").notNull(),
  discountPercentage: numeric("discount_percentage").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  classification: customerClassificationEnum
});

// Product categories
export const productCategoryEnum = z.enum(["construction", "external_facades", "decorative"]);
export type ProductCategory = z.infer<typeof productCategoryEnum>;

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  colorOrBatch: text("color_or_batch"),
  price: numeric("price").notNull(),
  stock: integer("stock").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  category: productCategoryEnum,
  price: z.string().or(z.number()).transform(val => String(val)),
  stock: z.string().or(z.number()).transform(val => Number(val)),
});

// Payment methods
export const paymentMethodEnum = z.enum(["cash", "credit_card", "bank_transfer", "check"]);
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

// Invoice status
export const invoiceStatusEnum = z.enum(["pending", "paid", "partially_paid", "overdue", "cancelled"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

// Sales schema
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  date: timestamp("date").defaultNow(),
  subTotal: numeric("subtotal").notNull(),
  discountAmount: numeric("discount_amount").default("0"),
  totalAmount: numeric("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  paymentMethod: paymentMethodEnum,
  paymentStatus: invoiceStatusEnum,
  subTotal: z.string().or(z.number()).transform(val => String(val)),
  discountAmount: z.string().or(z.number()).transform(val => String(val)),
  totalAmount: z.string().or(z.number()).transform(val => String(val)),
});

// Sale items schema
export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  totalPrice: numeric("total_price").notNull(),
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true,
}).extend({
  quantity: z.string().or(z.number()).transform(val => Number(val)),
  unitPrice: z.string().or(z.number()).transform(val => String(val)),
  totalPrice: z.string().or(z.number()).transform(val => String(val)),
});

// Returns schema
export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  returnNumber: text("return_number").notNull().unique(),
  saleId: integer("sale_id").notNull(),
  customerId: integer("customer_id").notNull(),
  date: timestamp("date").defaultNow(),
  totalAmount: numeric("total_amount").notNull(),
  reason: text("reason"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReturnSchema = createInsertSchema(returns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  totalAmount: z.string().or(z.number()).transform(val => String(val)),
});

// Return items schema
export const returnItems = pgTable("return_items", {
  id: serial("id").primaryKey(),
  returnId: integer("return_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  totalPrice: numeric("total_price").notNull(),
});

export const insertReturnItemSchema = createInsertSchema(returnItems).omit({
  id: true,
}).extend({
  quantity: z.string().or(z.number()).transform(val => Number(val)),
  unitPrice: z.string().or(z.number()).transform(val => String(val)),
  totalPrice: z.string().or(z.number()).transform(val => String(val)),
});

// Payments schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull(),
  amount: numeric("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  date: timestamp("date").defaultNow(),
  reference: text("reference"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.string().or(z.number()).transform(val => String(val)),
  paymentMethod: paymentMethodEnum,
});

// Customer Balance View
export const customerBalances = pgTable("customer_balances", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().unique(),
  totalSales: numeric("total_sales").notNull().default("0"),
  totalPayments: numeric("total_payments").notNull().default("0"),
  totalReturns: numeric("total_returns").notNull().default("0"),
  balance: numeric("balance").notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItems.$inferSelect;

export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type Return = typeof returns.$inferSelect;

export type InsertReturnItem = z.infer<typeof insertReturnItemSchema>;
export type ReturnItem = typeof returnItems.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type CustomerBalance = typeof customerBalances.$inferSelect;
