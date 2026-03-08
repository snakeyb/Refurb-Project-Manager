import { db } from "./db";
import { refurbProjects } from "@shared/schema";
import { log } from "./index";

export async function seedDatabase() {
  const existing = await db.select().from(refurbProjects);
  if (existing.length > 0) {
    log("Seed data already exists, skipping.");
    return;
  }

  log("Seeding database with sample refurb projects...");

  await db.insert(refurbProjects).values([
    {
      name: "14 Victoria Road - Full Refurbishment",
      description: "Complete refurbishment of 3-bed semi-detached property for rental market. Includes new kitchen, bathroom, and full redecoration throughout.",
      status: "In Progress",
      associatedEntityType: "Property",
      associatedEntityId: "prop-001",
      associatedEntityName: "14 Victoria Road, Manchester, M20 3FT",
      currency: "GBP",
      notes: "Contractor: BuildRight Ltd. Expected completion: 6 weeks.",
      lineItems: [
        { id: "li-1", description: "Kitchen - Supply & fit units, worktops, sink, taps", quantity: 1, unitCost: 3200, vatRate: 20, lineTotal: 3200, vatAmount: 640, lineTotalIncVat: 3840 },
        { id: "li-2", description: "Kitchen - Appliances (oven, hob, extractor, fridge)", quantity: 1, unitCost: 1800, vatRate: 20, lineTotal: 1800, vatAmount: 360, lineTotalIncVat: 2160 },
        { id: "li-3", description: "Bathroom - Full refit including suite, tiling, plumbing", quantity: 1, unitCost: 2800, vatRate: 20, lineTotal: 2800, vatAmount: 560, lineTotalIncVat: 3360 },
        { id: "li-4", description: "Decoration - Full house emulsion & gloss (labour & materials)", quantity: 1, unitCost: 1500, vatRate: 20, lineTotal: 1500, vatAmount: 300, lineTotalIncVat: 1800 },
        { id: "li-5", description: "Flooring - Carpet supply & fit (3 bedrooms, stairs, landing)", quantity: 45, unitCost: 22, vatRate: 20, lineTotal: 990, vatAmount: 198, lineTotalIncVat: 1188 },
        { id: "li-6", description: "Flooring - LVT supply & fit (kitchen, bathroom, hallway)", quantity: 18, unitCost: 38, vatRate: 20, lineTotal: 684, vatAmount: 136.80, lineTotalIncVat: 820.80 },
        { id: "li-7", description: "Electrical - New consumer unit & rewire", quantity: 1, unitCost: 2400, vatRate: 0, lineTotal: 2400, vatAmount: 0, lineTotalIncVat: 2400 },
        { id: "li-8", description: "Gas Safety Certificate & boiler service", quantity: 1, unitCost: 180, vatRate: 0, lineTotal: 180, vatAmount: 0, lineTotalIncVat: 180 },
      ],
      subtotal: "13554.00",
      vatTotal: "2194.80",
      grandTotal: "15748.80",
    },
    {
      name: "27 Park Lane - Cosmetic Refresh",
      description: "Light cosmetic refresh for quick turnaround. Property is structurally sound, needs decoration and minor repairs only.",
      status: "Draft",
      associatedEntityType: "Lead",
      associatedEntityId: "lead-002",
      associatedEntityName: "27 Park Lane, Leeds, LS1 4RT",
      currency: "GBP",
      notes: "Awaiting final viewing before committing to purchase.",
      lineItems: [
        { id: "li-9", description: "Decoration - Full house emulsion (walls & ceilings)", quantity: 1, unitCost: 950, vatRate: 20, lineTotal: 950, vatAmount: 190, lineTotalIncVat: 1140 },
        { id: "li-10", description: "Decoration - Gloss work (doors, skirting, architraves)", quantity: 1, unitCost: 600, vatRate: 20, lineTotal: 600, vatAmount: 120, lineTotalIncVat: 720 },
        { id: "li-11", description: "Garden - Tidy up and fencing repair", quantity: 1, unitCost: 350, vatRate: 20, lineTotal: 350, vatAmount: 70, lineTotalIncVat: 420 },
        { id: "li-12", description: "Deep clean throughout", quantity: 1, unitCost: 250, vatRate: 20, lineTotal: 250, vatAmount: 50, lineTotalIncVat: 300 },
      ],
      subtotal: "2150.00",
      vatTotal: "430.00",
      grandTotal: "2580.00",
    },
    {
      name: "Flat 3, 9 Brunswick Street - HMO Conversion",
      description: "Converting 2-bed flat into 4-bed HMO. Major works including partition walls, additional bathroom, fire safety compliance.",
      status: "Approved",
      associatedEntityType: "Property",
      associatedEntityId: "prop-003",
      associatedEntityName: "Flat 3, 9 Brunswick Street, Liverpool, L2 0PJ",
      currency: "GBP",
      notes: "Planning approved. Building regs sign-off required. Article 4 area - sui generis permission obtained.",
      lineItems: [
        { id: "li-13", description: "Partition walls - stud walls to create 2 additional bedrooms", quantity: 2, unitCost: 850, vatRate: 20, lineTotal: 1700, vatAmount: 340, lineTotalIncVat: 2040 },
        { id: "li-14", description: "En-suite shower room installation (2 rooms)", quantity: 2, unitCost: 2200, vatRate: 20, lineTotal: 4400, vatAmount: 880, lineTotalIncVat: 5280 },
        { id: "li-15", description: "Fire doors - FD30S supply & fit", quantity: 6, unitCost: 185, vatRate: 20, lineTotal: 1110, vatAmount: 222, lineTotalIncVat: 1332 },
        { id: "li-16", description: "Fire alarm system - Grade A LD2", quantity: 1, unitCost: 1200, vatRate: 0, lineTotal: 1200, vatAmount: 0, lineTotalIncVat: 1200 },
        { id: "li-17", description: "Emergency lighting installation", quantity: 1, unitCost: 650, vatRate: 0, lineTotal: 650, vatAmount: 0, lineTotalIncVat: 650 },
        { id: "li-18", description: "Kitchen upgrade - communal kitchen refurbishment", quantity: 1, unitCost: 2800, vatRate: 20, lineTotal: 2800, vatAmount: 560, lineTotalIncVat: 3360 },
        { id: "li-19", description: "Bedroom furniture package x4 (bed, wardrobe, desk)", quantity: 4, unitCost: 420, vatRate: 20, lineTotal: 1680, vatAmount: 336, lineTotalIncVat: 2016 },
        { id: "li-20", description: "Decoration throughout - all rooms", quantity: 1, unitCost: 1800, vatRate: 20, lineTotal: 1800, vatAmount: 360, lineTotalIncVat: 2160 },
        { id: "li-21", description: "Flooring - LVT throughout", quantity: 55, unitCost: 35, vatRate: 20, lineTotal: 1925, vatAmount: 385, lineTotalIncVat: 2310 },
      ],
      subtotal: "17265.00",
      vatTotal: "3083.00",
      grandTotal: "20348.00",
    },
    {
      name: "22 Elm Close - BTL Preparation",
      description: "Preparing newly purchased property for the buy-to-let market. Good condition, needs minimal work.",
      status: "Completed",
      associatedEntityType: "Property",
      associatedEntityId: "prop-004",
      associatedEntityName: "22 Elm Close, Birmingham, B15 2TT",
      currency: "GBP",
      lineItems: [
        { id: "li-22", description: "Gas safety certificate", quantity: 1, unitCost: 75, vatRate: 0, lineTotal: 75, vatAmount: 0, lineTotalIncVat: 75 },
        { id: "li-23", description: "EICR (Electrical Installation Condition Report)", quantity: 1, unitCost: 180, vatRate: 0, lineTotal: 180, vatAmount: 0, lineTotalIncVat: 180 },
        { id: "li-24", description: "EPC assessment", quantity: 1, unitCost: 65, vatRate: 20, lineTotal: 65, vatAmount: 13, lineTotalIncVat: 78 },
        { id: "li-25", description: "Smoke & CO alarm installation", quantity: 1, unitCost: 120, vatRate: 20, lineTotal: 120, vatAmount: 24, lineTotalIncVat: 144 },
        { id: "li-26", description: "Professional deep clean", quantity: 1, unitCost: 200, vatRate: 20, lineTotal: 200, vatAmount: 40, lineTotalIncVat: 240 },
        { id: "li-27", description: "Lock change - all external doors", quantity: 3, unitCost: 85, vatRate: 20, lineTotal: 255, vatAmount: 51, lineTotalIncVat: 306 },
      ],
      subtotal: "895.00",
      vatTotal: "128.00",
      grandTotal: "1023.00",
    },
  ]);

  log("Seed data inserted successfully.");
}
