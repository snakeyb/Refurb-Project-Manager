import type { InsertRefurbProject, RefurbProject, RefurbLineItem } from "@shared/schema";

export interface IStorage {
  getRefurbProjects(): Promise<RefurbProject[]>;
  getRefurbProject(id: string): Promise<RefurbProject | undefined>;
  createRefurbProject(project: InsertRefurbProject): Promise<RefurbProject>;
  updateRefurbProject(id: string, project: Partial<InsertRefurbProject>): Promise<RefurbProject | undefined>;
  deleteRefurbProject(id: string): Promise<boolean>;
}

function parseLineItems(raw: unknown): RefurbLineItem[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapEspoToProject(record: Record<string, unknown>): RefurbProject {
  let associatedEntityType = record.associatedEntityType ? String(record.associatedEntityType) : null;
  let associatedEntityId = record.associatedEntityId ? String(record.associatedEntityId) : null;
  let associatedEntityName = record.associatedEntityName ? String(record.associatedEntityName) : null;

  if (record.leadId && !associatedEntityId) {
    associatedEntityType = "Lead";
    associatedEntityId = String(record.leadId);
    associatedEntityName = record.leadName ? String(record.leadName) : associatedEntityName;
  } else if (record.opportunityId && !associatedEntityId) {
    associatedEntityType = "Opportunity";
    associatedEntityId = String(record.opportunityId);
    associatedEntityName = record.opportunityName ? String(record.opportunityName) : associatedEntityName;
  }

  return {
    id: String(record.id || ""),
    name: String(record.name || ""),
    description: record.description ? String(record.description) : null,
    status: String(record.status || "Draft"),
    associatedEntityType,
    associatedEntityId,
    associatedEntityName,
    lineItems: parseLineItems(record.lineItems),
    subtotal: String(record.subtotal ?? "0"),
    vatTotal: String(record.vatTotal ?? "0"),
    grandTotal: String(record.grandTotal ?? "0"),
    currency: String(record.currency || "GBP"),
    notes: record.notes ? String(record.notes) : null,
    createdAt: String(record.createdAt || ""),
    updatedAt: String(record.modifiedAt || record.updatedAt || ""),
  };
}

function mapProjectToEspo(project: Partial<InsertRefurbProject>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  if (project.name !== undefined) mapped.name = project.name;
  if (project.description !== undefined) mapped.description = project.description || null;
  if (project.status !== undefined) mapped.status = project.status;
  if (project.associatedEntityType !== undefined) mapped.associatedEntityType = project.associatedEntityType || null;
  if (project.associatedEntityId !== undefined) mapped.associatedEntityId = project.associatedEntityId || null;
  if (project.associatedEntityName !== undefined) mapped.associatedEntityName = project.associatedEntityName || null;
  if (project.associatedEntityType !== undefined) {
    const entityType = project.associatedEntityType;
    const entityId = project.associatedEntityId || null;
    if (entityType === "Lead") {
      mapped.leadId = entityId;
      mapped.opportunityId = null;
    } else if (entityType === "Opportunity") {
      mapped.opportunityId = entityId;
      mapped.leadId = null;
    } else {
      mapped.leadId = null;
      mapped.opportunityId = null;
    }
  }
  if (project.lineItems !== undefined) mapped.lineItems = JSON.stringify(project.lineItems);
  const currencyCode = project.currency || "GBP";
  if (project.subtotal !== undefined) {
    mapped.subtotal = parseFloat(project.subtotal) || 0;
    mapped.subtotalCurrency = currencyCode;
  }
  if (project.vatTotal !== undefined) {
    mapped.vatTotal = parseFloat(project.vatTotal) || 0;
    mapped.vatTotalCurrency = currencyCode;
  }
  if (project.grandTotal !== undefined) {
    mapped.grandTotal = parseFloat(project.grandTotal) || 0;
    mapped.grandTotalCurrency = currencyCode;
  }
  if (project.currency !== undefined) mapped.currency = project.currency;
  if (project.notes !== undefined) mapped.notes = project.notes || null;
  return mapped;
}

function validateEspoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const hostname = parsed.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") return false;
    if (hostname.startsWith("10.") || hostname.startsWith("192.168.") || hostname.startsWith("172.")) return false;
    if (hostname === "169.254.169.254") return false;
    return true;
  } catch {
    return false;
  }
}

export class EspoCRMStorage implements IStorage {
  private baseUrl: string;
  private authHeader: string;
  private authSecret: string | null;

  constructor(espoUrl: string, authToken: string, authSecret?: string) {
    if (!validateEspoUrl(espoUrl)) {
      throw new Error("Invalid EspoCRM URL");
    }
    this.baseUrl = espoUrl.replace(/\/+$/, "") + "/api/v1";
    this.authHeader = authToken;
    this.authSecret = authSecret || null;
  }

  private async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Espo-Authorization": this.authHeader,
      "X-Espo-Authorization-By-Token": "true",
    };
    if (this.authSecret) {
      headers["Cookie"] = `auth-token-secret=${this.authSecret}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      throw new Error(`EspoCRM API error ${res.status}: ${errorText}`);
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return null;
    }

    return res.json();
  }

  async getRefurbProjects(): Promise<RefurbProject[]> {
    const result = await this.request("GET", "/RefurbProject?orderBy=createdAt&order=desc&maxSize=200") as {
      list: Record<string, unknown>[];
      total: number;
    };
    return (result.list || []).map(mapEspoToProject);
  }

  async getRefurbProject(id: string): Promise<RefurbProject | undefined> {
    try {
      const record = await this.request("GET", `/RefurbProject/${id}`) as Record<string, unknown>;
      return mapEspoToProject(record);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("404")) return undefined;
      throw err;
    }
  }

  async createRefurbProject(project: InsertRefurbProject): Promise<RefurbProject> {
    const data = mapProjectToEspo(project);
    const record = await this.request("POST", "/RefurbProject", data) as Record<string, unknown>;
    return mapEspoToProject(record);
  }

  async updateRefurbProject(id: string, project: Partial<InsertRefurbProject>): Promise<RefurbProject | undefined> {
    try {
      const data = mapProjectToEspo(project);
      await this.request("PUT", `/RefurbProject/${id}`, data);
      const record = await this.request("GET", `/RefurbProject/${id}`) as Record<string, unknown>;
      return mapEspoToProject(record);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("404")) return undefined;
      throw err;
    }
  }

  async deleteRefurbProject(id: string): Promise<boolean> {
    try {
      await this.request("DELETE", `/RefurbProject/${id}`);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("404")) return false;
      throw err;
    }
  }
}
