import { Router, Response } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { getDb } from "../../lib/db";
import { users, chats, chatParticipants } from "../../schema";
import { authenticate, AuthRequest } from "../../middlewares/auth";

const router = Router();

router.post("/contact-admin", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const db = getDb();
    const userId = req.user!.id;

    const [admin] = await db.select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar, role: users.role })
      .from(users).where(eq(users.role, "admin")).limit(1);
    if (!admin) { res.status(404).json({ message: "No admin found" }); return; }

    // Check if direct chat already exists
    const myChats = await db.select({ chatId: chatParticipants.chatId })
      .from(chatParticipants).where(eq(chatParticipants.userId, userId));
    const myIds = myChats.map(r => r.chatId);

    let existingChatId: string | null = null;
    if (myIds.length) {
      const adminChats = await db.select({ chatId: chatParticipants.chatId })
        .from(chatParticipants)
        .where(and(eq(chatParticipants.userId, admin.id), inArray(chatParticipants.chatId, myIds)));
      for (const row of adminChats) {
        const [c] = await db.select().from(chats)
          .where(and(eq(chats.id, row.chatId), eq(chats.type, "direct"))).limit(1);
        if (c) { existingChatId = c.id; break; }
      }
    }

    if (!existingChatId) {
      const [chat] = await db.insert(chats).values({ type: "direct" }).returning();
      await db.insert(chatParticipants).values([
        { chatId: chat.id, userId },
        { chatId: chat.id, userId: admin.id },
      ]);
      existingChatId = chat.id;
    }

    const [chatRow] = await db.select().from(chats).where(eq(chats.id, existingChatId)).limit(1);
    const parts = await db.select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar, role: users.role })
      .from(chatParticipants).innerJoin(users, eq(chatParticipants.userId, users.id))
      .where(eq(chatParticipants.chatId, existingChatId));

    res.json({ ...chatRow, _id: chatRow.id, participants: parts.map(p => ({ ...p, _id: p.id })) });
  } catch {
    res.status(500).json({ message: "Failed to contact admin" });
  }
});

export default router;
