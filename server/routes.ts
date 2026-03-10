import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { EspoCRMStorage } from "./storage";
import { insertRefurbProjectSchema } from "@shared/schema";

function getEspoStorage(req: Request): EspoCRMStorage | null {
  const espoUrl = req.headers["x-espo-url"] as string;
  const espoAuth = req.headers["x-espo-auth"] as string;
  const espoSecret = req.headers["x-espo-secret"] as string | undefined;
  if (!espoUrl || !espoAuth) return null;
  return new EspoCRMStorage(espoUrl, espoAuth, espoSecret);
}

function requireEspo(req: Request, res: Response): EspoCRMStorage | null {
  const storage = getEspoStorage(req);
  if (!storage) {
    res.status(401).json({ message: "EspoCRM connection required. Please open this app from your CRM." });
    return null;
  }
  return storage;
}

function extractEspoStatus(msg: string): number {
  const match = msg.match(/EspoCRM API error (\d+)/);
  if (match) {
    const code = parseInt(match[1], 10);
    if (code >= 400 && code < 600) return code;
  }
  return 500;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/refurb-projects", async (req, res) => {
    const espoUrl = req.headers["x-espo-url"] as string;
    const espoAuth = req.headers["x-espo-auth"] as string;
    const espoSecret = req.headers["x-espo-secret"] as string | undefined;
    console.log(`[debug] GET /api/refurb-projects - espoUrl: ${espoUrl ? 'present' : 'missing'}, espoAuth: ${espoAuth ? espoAuth.substring(0, 10) + '...' : 'missing'}, espoSecret: ${espoSecret ? 'present(' + espoSecret.length + ' chars)' : 'MISSING'}`);
    const storage = requireEspo(req, res);
    if (!storage) return;
    try {
      const projects = await storage.getRefurbProjects();
      res.json(projects);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch refurb projects";
      const status = extractEspoStatus(msg);
      res.status(status).json({ message: msg });
    }
  });

  app.get("/api/refurb-projects/:id", async (req, res) => {
    const storage = requireEspo(req, res);
    if (!storage) return;
    try {
      const project = await storage.getRefurbProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Refurb project not found" });
      }
      res.json(project);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch refurb project";
      const status = extractEspoStatus(msg);
      res.status(status).json({ message: msg });
    }
  });

  app.post("/api/refurb-projects", async (req, res) => {
    const storage = requireEspo(req, res);
    if (!storage) return;
    try {
      const parsed = insertRefurbProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      }
      const project = await storage.createRefurbProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to create refurb project";
      const status = extractEspoStatus(msg);
      res.status(status).json({ message: msg });
    }
  });

  app.patch("/api/refurb-projects/:id", async (req, res) => {
    const storage = requireEspo(req, res);
    if (!storage) return;
    try {
      const parsed = insertRefurbProjectSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      }
      const data = { ...parsed.data };
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
      if (!project) {
        return res.status(404).json({ message: "Refurb project not found" });
      }
      res.json(project);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update refurb project";
      const status = extractEspoStatus(msg);
      res.status(status).json({ message: msg });
    }
  });

  app.delete("/api/refurb-projects/:id", async (req, res) => {
    const storage = requireEspo(req, res);
    if (!storage) return;
    try {
      const deleted = await storage.deleteRefurbProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Refurb project not found" });
      }
      res.json({ message: "Refurb project deleted" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete refurb project";
      const status = extractEspoStatus(msg);
      res.status(status).json({ message: msg });
    }
  });

  return httpServer;
}
