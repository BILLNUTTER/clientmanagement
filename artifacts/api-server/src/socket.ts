import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "./middlewares/auth";
import { User } from "./models/User";
import { Message } from "./models/Chat";
import { Chat } from "./models/Chat";
import { logger } from "./lib/logger";

const onlineUsers = new Map<string, string>();

export function initSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socket.io",
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth["token"] as string;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error("Invalid token"));
    }
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("User not found"));
    }
    (socket as any).user = user;
    next();
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    const userId = user._id.toString();

    onlineUsers.set(userId, socket.id);
    logger.info({ userId, socketId: socket.id }, "User connected");

    io.emit("user_online", { userId });

    socket.on("join_chat", async (chatId: string) => {
      try {
        const chat = await Chat.findOne({ _id: chatId, participants: user._id });
        if (chat) {
          socket.join(chatId);
          await Message.updateMany(
            { chatId, sender: { $ne: user._id }, read: false },
            { read: true }
          );
        }
      } catch (err) {
        logger.error({ err }, "Error joining chat");
      }
    });

    socket.on("leave_chat", (chatId: string) => {
      socket.leave(chatId);
    });

    socket.on("send_message", async (data: { chatId: string; content: string }) => {
      try {
        const { chatId, content } = data;
        if (!content?.trim()) return;

        const chat = await Chat.findOne({ _id: chatId, participants: user._id });
        if (!chat) return;

        const message = new Message({
          chatId,
          sender: user._id,
          content: content.trim(),
        });
        await message.save();
        await message.populate("sender", "name email avatar");

        chat.lastMessage = message._id;
        chat.updatedAt = new Date();
        await chat.save();

        io.to(chatId).emit("new_message", message);

        chat.participants.forEach((participantId) => {
          const pid = participantId.toString();
          if (pid !== userId) {
            const targetSocketId = onlineUsers.get(pid);
            if (targetSocketId) {
              io.to(targetSocketId).emit("chat_updated", {
                chatId,
                lastMessage: message,
              });
            }
          }
        });
      } catch (err) {
        logger.error({ err }, "Error sending message");
      }
    });

    socket.on("typing", (data: { chatId: string }) => {
      socket.to(data.chatId).emit("user_typing", { userId, chatId: data.chatId });
    });

    socket.on("stop_typing", (data: { chatId: string }) => {
      socket.to(data.chatId).emit("user_stop_typing", { userId, chatId: data.chatId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("user_offline", { userId });
      logger.info({ userId }, "User disconnected");
    });
  });

  return io;
}
