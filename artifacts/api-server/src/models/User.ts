// Compatibility shim — real data is in Drizzle schema (src/schema.ts)
// This file is kept for import references in middlewares/auth.ts
export type IUser = {
  _id: string;
  id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  avatar?: string | null;
  createdAt: Date;
};
