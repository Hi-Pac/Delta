import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// This is a simplified server for the application. In a real implementation,
// the API endpoints would be connected to Firebase directly from the frontend.
// This server serves as a proxy for development purposes only.

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefixed with /api
  
  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(parseInt(req.params.id));
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = await storage.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ message: "Error creating customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.updateCustomer(parseInt(req.params.id), req.body);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Error updating customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const success = await storage.deleteCustomer(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting customer" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Error creating product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(parseInt(req.params.id), req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error updating product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Sales
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getAllSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sales" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.getSale(parseInt(req.params.id));
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sale" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const sale = await storage.createSale(req.body);
      res.status(201).json(sale);
    } catch (error) {
      res.status(500).json({ message: "Error creating sale" });
    }
  });

  app.put("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.updateSale(parseInt(req.params.id), req.body);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ message: "Error updating sale" });
    }
  });

  // Returns
  app.get("/api/returns", async (req, res) => {
    try {
      const returns = await storage.getAllReturns();
      res.json(returns);
    } catch (error) {
      res.status(500).json({ message: "Error fetching returns" });
    }
  });

  app.get("/api/returns/:id", async (req, res) => {
    try {
      const returnItem = await storage.getReturn(parseInt(req.params.id));
      if (!returnItem) {
        return res.status(404).json({ message: "Return not found" });
      }
      res.json(returnItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching return" });
    }
  });

  app.post("/api/returns", async (req, res) => {
    try {
      const returnItem = await storage.createReturn(req.body);
      res.status(201).json(returnItem);
    } catch (error) {
      res.status(500).json({ message: "Error creating return" });
    }
  });

  // Payments
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payments" });
    }
  });

  app.get("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.getPayment(parseInt(req.params.id));
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const payment = await storage.createPayment(req.body);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Error creating payment" });
    }
  });

  // Customer balances
  app.get("/api/customer-balances/:customerId", async (req, res) => {
    try {
      const balance = await storage.getCustomerBalance(parseInt(req.params.customerId));
      if (!balance) {
        return res.status(404).json({ message: "Customer balance not found" });
      }
      res.json(balance);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customer balance" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
