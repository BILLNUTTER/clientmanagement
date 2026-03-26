import { Router, Response } from "express";
import { ne, eq } from "drizzle-orm";
import { getDb } from "../../lib/db";
import { users } from "../../schema";
import { authenticate, AuthRequest } from "../../middlewares/auth";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const rows = await db.select({
      id: users.id, name: users.name, email: users.email,
      role: users.role, avatar: users.avatar, createdAt: users.createdAt,
    }).from(users).where(ne(users.id, req.user!.id));

    res.json(rows.map(r => ({ ...r, _id: r.id })));
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const [row] = await db.select({
      id: users.id, name: users.name, email: users.email,
      role: users.role, avatar: users.avatar, createdAt: users.createdAt,
    }).from(users).where(eq(users.id, req.params["id"]!)).limit(1);
    if (!row) { res.status(404).json({ message: "User not found" }); return; }
    res.json({ ...row, _id: row.id });
  } catch {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
