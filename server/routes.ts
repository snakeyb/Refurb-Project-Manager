import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRefurbProjectSchema } from "@shared/schema";
import { seedDatabase } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  app.get("/api/refurb-projects", async (_req, res) => {
    try {
      const projects = await storage.getRefurbProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch refurb projects" });
    }
  });

  app.get("/api/refurb-projects/:id", async (req, res) => {
    try {
      const project = await storage.getRefurbProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Refurb project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch refurb project" });
    }
  });

  app.post("/api/refurb-projects", async (req, res) => {
    try {
      const parsed = insertRefurbProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      }
      const project = await storage.createRefurbProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to create refurb project" });
    }
  });

  app.patch("/api/refurb-projects/:id", async (req, res) => {
    try {
      const existing = await storage.getRefurbProject(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: "Refurb project not found" });
      }
      const data = { ...req.body };
      if (data.lineItems && Array.isArray(data.lineItems)) {
        let subtotal = 0;
        let vatTotal = 0;
        for (const item of data.lineItems) {
          const qty = Number(item.quantity) || 0;
          const cost = Number(item.unitCost) || 0;
          const vatRate = Number(item.vatRate) || 0;
          item.lineTotal = Math.round(qty * cost * 100) / 100;
          item.vatAmount = Math.round(item.lineTotal * (vatRate / 100) * 100) / 100;
          item.lineTotalIncVat = Math.round((item.lineTotal + item.vatAmount) * 100) / 100;
          subtotal += item.lineTotal;
          vatTotal += item.vatAmount;
        }
        data.subtotal = String(Math.round(subtotal * 100) / 100);
        data.vatTotal = String(Math.round(vatTotal * 100) / 100);
        data.grandTotal = String(Math.round((subtotal + vatTotal) * 100) / 100);
      }
      const project = await storage.updateRefurbProject(req.params.id, data);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update refurb project" });
    }
  });

  app.delete("/api/refurb-projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRefurbProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Refurb project not found" });
      }
      res.json({ message: "Refurb project deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete refurb project" });
    }
  });

  return httpServer;
}
