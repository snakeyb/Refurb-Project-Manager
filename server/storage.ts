import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { refurbProjects, type InsertRefurbProject, type RefurbProject } from "@shared/schema";

export interface IStorage {
  getRefurbProjects(): Promise<RefurbProject[]>;
  getRefurbProject(id: string): Promise<RefurbProject | undefined>;
  createRefurbProject(project: InsertRefurbProject): Promise<RefurbProject>;
  updateRefurbProject(id: string, project: Partial<InsertRefurbProject>): Promise<RefurbProject | undefined>;
  deleteRefurbProject(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getRefurbProjects(): Promise<RefurbProject[]> {
    return db.select().from(refurbProjects).orderBy(desc(refurbProjects.createdAt));
  }

  async getRefurbProject(id: string): Promise<RefurbProject | undefined> {
    const [project] = await db.select().from(refurbProjects).where(eq(refurbProjects.id, id));
    return project;
  }

  async createRefurbProject(project: InsertRefurbProject): Promise<RefurbProject> {
    const [created] = await db.insert(refurbProjects).values({
      ...project,
      updatedAt: new Date(),
    }).returning();
    return created;
  }

  async updateRefurbProject(id: string, project: Partial<InsertRefurbProject>): Promise<RefurbProject | undefined> {
    const [updated] = await db.update(refurbProjects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(refurbProjects.id, id))
      .returning();
    return updated;
  }

  async deleteRefurbProject(id: string): Promise<boolean> {
    const result = await db.delete(refurbProjects).where(eq(refurbProjects.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
