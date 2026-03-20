import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { useGetChats, useGetChatMessages, useSendMessage, useAdminGetUsers, useStartDirectChat } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users, User, CircleDot } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export default function Chat() {
  const { user } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();
  const { data: chats, isLoading: chatsLoading } = useGetChats();
  const { data: allUsers } = useAdminGetUsers({ query: { enabled: user?.role === 'admin' } });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  
  const { data: messages, isLoading: messagesLoading } = useGetChatMessages(activeChatId || "", {
    query: { enabled: !!activeChatId }
  });
  
  const sendMessageMutation = useSendMessage();
  const startChatMutation = useStartDirectChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (socket && activeChatId) {
      socket.emit('join_chat', activeChatId);
      return () => { socket.emit('leave_chat', activeChatId); };
    }
  }, [socket, activeChatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChatId) return;

    const content = message;
    setMessage("");

    // Use REST to send, socket handles broadcasting
    await sendMessageMutation.mutateAsync({
      chatId: activeChatId,
      data: { content }
    });
  };

  const handleStartChat = async (userId: string) => {
    const chat = await startChatMutation.mutateAsync({ userId });
    queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    setActiveChatId(chat._id!);
  };

  const getChatName = (chat: any) => {
    if (chat.type === 'group') return chat.name;
    const otherParticipant = chat.participants.find((p: any) => p._id !== user?._id);
    return otherParticipant?.name || 'Unknown User';
  };

  const getChatAvatar = (chat: any) => {
    return chat.type === 'group' ? <Users className="w-5 h-5 text-blue-400" /> : <User className="w-5 h-5 text-indigo-400" />;
  };

  const isUserOnline = (chat: any) => {
    if (chat.type === 'group') return false;
    const otherParticipant = chat.participants.find((p: any) => p._id !== user?._id);
    return otherParticipant && onlineUsers.includes(otherParticipant._id);
  };

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto pb-4 h-screen flex flex-col">
      <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex border border-white/10 shadow-2xl mt-4">
        
        {/* Sidebar */}
        <div className="w-80 border-r border-white/5 bg-black/20 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-xl font-bold flex items-center justify-between">
              Messages
              <div className="flex items-center gap-2 text-xs font-normal bg-black/40 px-2 py-1 rounded-full border border-white/5">
                <CircleDot className={cn("w-3 h-3", isConnected ? "text-emerald-500 animate-pulse" : "text-red-500")} />
                {isConnected ? 'Connected' : 'Offline'}
              </div>
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {chatsLoading ? (
              <div className="p-4 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : chats?.map(chat => (
              <button
                key={chat._id}
                onClick={() => setActiveChatId(chat._id!)}
                className={cn(
                  "w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left",
                  activeChatId === chat._id ? "bg-primary/20 border border-primary/30" : "hover:bg-white/5 border border-transparent"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 relative">
                  {getChatAvatar(chat)}
                  {isUserOnline(chat) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#121827] rounded-full" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold text-sm truncate">{getChatName(chat)}</div>
                  {chat.lastMessage && (
                    <div className="text-xs text-muted-foreground truncate opacity-80">
                      {chat.lastMessage.content}
                    </div>
                  )}
                </div>
              </button>
            ))}

            {user?.role === 'admin' && allUsers && (
              <div className="pt-6 mt-6 border-t border-white/5 px-2">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 pl-2">Start new chat</div>
                {allUsers.filter(u => u._id !== user._id).map(u => (
                  <button
                    key={u._id}
                    onClick={() => handleStartChat(u._id!)}
                    className="w-full p-2 text-sm text-left hover:bg-white/5 rounded-lg flex items-center gap-2 text-white/80"
                  >
                    <User className="w-4 h-4 text-muted-foreground" /> {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0a0e1a]/50 relative">
          {activeChatId ? (
            <>
              {/* Header */}
              <div className="h-16 border-b border-white/5 bg-black/20 flex items-center px-6 shrink-0 backdrop-blur-md absolute top-0 w-full z-10">
                <div className="font-semibold text-lg">
                  {chats?.find(c => c._id === activeChatId) ? getChatName(chats.find(c => c._id === activeChatId)) : 'Chat'}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 pt-24 custom-scrollbar">
                {messagesLoading ? (
                  <div className="flex justify-center mt-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                  <div className="space-y-4">
                    {messages?.map(msg => {
                      const isOwn = msg.sender?._id === user?._id;
                      return (
                        <div key={msg._id} className={cn("flex flex-col max-w-[70%]", isOwn ? "ml-auto items-end" : "mr-auto items-start")}>
                          <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-sm relative group shadow-sm",
                            isOwn 
                              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm" 
                              : "bg-white/10 text-white rounded-bl-sm border border-white/5"
                          )}>
                            {msg.content}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-2">
                            {!isOwn && <span className="font-medium">{msg.sender?.name}</span>}
                            {formatTime(msg.createdAt!)}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-black/40 border-t border-white/5 shrink-0">
                <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
                  <Input 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border-white/10 rounded-full px-6"
                  />
                  <Button type="submit" variant="gradient" size="icon" className="rounded-full shrink-0 shadow-lg" disabled={!message.trim() || sendMessageMutation.isPending}>
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                <MessageSquare className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-lg">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
