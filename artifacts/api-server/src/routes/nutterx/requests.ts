import { Router, Response } from "express";
import { eq, and } from "drizzle-orm";
import { getDb } from "../../lib/db";
import { serviceRequests, users } from "../../schema";
import { authenticate, AuthRequest } from "../../middlewares/auth";

const router = Router();

function formatRequest(r: any) {
  const obj = { ...r, _id: r.id };
  if (obj.user && typeof obj.user === "object") obj.user = { ...obj.user, _id: obj.user.id };
  if (obj.paymentAmount != null) obj.paymentAmount = Number(obj.paymentAmount);
  let daysRemaining: number | undefined;
  if (obj.subscriptionEndsAt) {
    const msLeft = new Date(obj.subscriptionEndsAt).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  }
  return { ...obj, daysRemaining };
}

router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId, serviceName, description, requirements } = req.body;
    if (!serviceName || !description) {
      res.status(400).json({ message: "Service name and description are required" }); return;
    }
    const db = getDb();
    const [row] = await db.insert(serviceRequests).values({
      userId: req.user!.id,
      serviceId: serviceId || null,
      serviceName,
      description,
      requirements: requirements || null,
    }).returning();

    const [u] = await db.select({ id: users.id, name: users.name, email: users.email })
      .from(users).where(eq(users.id, row.userId)).limit(1);
    res.status(201).json(formatRequest({ ...row, user: u }));
  } catch {
    res.status(500).json({ message: "Failed to submit request" });
  }
});

router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const rows = await db.select().from(serviceRequests)
      .where(eq(serviceRequests.userId, req.user!.id));
    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const withUsers = await Promise.all(rows.map(async r => {
      const [u] = await db.select({ id: users.id, name: users.name, email: users.email })
        .from(users).where(eq(users.id, r.userId)).limit(1);
      return { ...r, user: u };
    }));
    res.json(withUsers.map(formatRequest));
  } catch {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const [row] = await db.select().from(serviceRequests)
      .where(and(eq(serviceRequests.id, req.params["id"]!), eq(serviceRequests.userId, req.user!.id)))
      .limit(1);
    if (!row) { res.status(404).json({ message: "Request not found" }); return; }
    const [u] = await db.select({ id: users.id, name: users.name, email: users.email })
      .from(users).where(eq(users.id, row.userId)).limit(1);
    res.json(formatRequest({ ...row, user: u }));
  } catch {
    res.status(500).json({ message: "Failed to fetch request" });
  }
});

export { formatRequest };
export default router;
