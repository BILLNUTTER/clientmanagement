import { Router, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getDb } from "../../lib/db";
import { services } from "../../schema";
import { authenticate, requireAdmin, AuthRequest } from "../../middlewares/auth";

const router = Router();

function fmt(s: any) {
  return { ...s, _id: s.id, price: s.price ? Number(s.price) : undefined };
}

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await getDb().select().from(services);
    res.json(rows.map(fmt));
  } catch {
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const [row] = await getDb().select().from(services).where(eq(services.id, req.params["id"]!)).limit(1);
    if (!row) { res.status(404).json({ message: "Service not found" }); return; }
    res.json(fmt(row));
  } catch {
    res.status(500).json({ message: "Failed to fetch service" });
  }
});

router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, price, features, icon, category, popular } = req.body;
    if (!title || !description) {
      res.status(400).json({ message: "Title and description are required" }); return;
    }
    const [row] = await getDb().insert(services).values({
      title, description,
      price: price != null ? String(price) : null,
      features: features || [],
      icon: icon || null,
      category: category || null,
      popular: popular || false,
    }).returning();
    res.status(201).json(fmt(row));
  } catch {
    res.status(500).json({ message: "Failed to create service" });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, price, features, icon, category, popular } = req.body;
    const [row] = await getDb().update(services).set({
      ...(title       !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(price       !== undefined && { price: price != null ? String(price) : null }),
      ...(features    !== undefined && { features }),
      ...(icon        !== undefined && { icon }),
      ...(category    !== undefined && { category }),
      ...(popular     !== undefined && { popular }),
    }).where(eq(services.id, req.params["id"]!)).returning();
    if (!row) { res.status(404).json({ message: "Service not found" }); return; }
    res.json(fmt(row));
  } catch {
    res.status(500).json({ message: "Failed to update service" });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await getDb().delete(services).where(eq(services.id, req.params["id"]!));
    res.json({ message: "Service deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete service" });
  }
});

export default router;
