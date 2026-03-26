import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getDb } from "../lib/db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import type { IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env["JWT_SECRET"] || "nutterx_jwt_secret_2024";

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "30d" });
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const db = getDb();
    const [row] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    if (!row) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    req.user = { ...row, _id: row.id };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}

export function verifyToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}
