import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Users, Send } from "lucide-react";

interface ChatMessage {
  userName: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

const FAKE_MESSAGES: ChatMessage[] = [
  { userName: "System", message: "Welcome to The Lucky Riverboat live chat!", timestamp: new Date(Date.now() - 300000), isSystem: true },
  { userName: "CryptoKing", message: "Just hit a 5x on Beached! 🚀", timestamp: new Date(Date.now() - 240000) },
  { userName: "LuckyDice", message: "Nice! I love that game", timestamp: new Date(Date.now() - 180000) },
  { userName: "GoldRush88", message: "Keno is where it's at tonight 🎱", timestamp: new Date(Date.now() - 120000) },
  { userName: "WhaleBet", message: "Anyone tried the new Plinko?", timestamp: new Date(Date.now() - 60000) },
  { userName: "NeonSailor", message: "Plinko is amazing, just won 200 USDT", timestamp: new Date(Date.now() - 30000) },
];

export default function ChatOverlay() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(FAKE_MESSAGES);
  const [messageInput, setMessageInput] = useState("");
  const [onlineCount] = useState(Math.floor(Math.random() * 50) + 15);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !isAuthenticated || !user) return;

    const newMessage: ChatMessage = {
      userName: user.username || "Player",
      message: messageInput.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
        style={{ backgroundColor: "var(--gold)", color: "var(--navy)" }}
        title="Open chat"
        data-testid="btn-chat-toggle"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 border-border/50 bg-card/95 backdrop-blur-sm shadow-xl flex flex-col"
          style={{ maxHeight: "400px" }}
          data-testid="chat-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-gold" />
              <span className="font-semibold text-gold text-sm">Live Chat</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                <Users size={10} />
                {onlineCount}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3" style={{ height: "260px" }}>
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className="text-sm">
                  {msg.isSystem ? (
                    <div className="text-center text-muted-foreground italic text-xs py-1">
                      {msg.message}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gold text-xs">{msg.userName}</span>
                        <span className="text-muted-foreground text-xs">
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-foreground/80 break-words text-xs">{msg.message}</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border/50">
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="text-sm h-8"
                  data-testid="chat-input"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  size="sm"
                  className="h-8 px-3"
                  style={{ backgroundColor: "var(--gold)", color: "var(--navy)" }}
                  data-testid="chat-send"
                >
                  <Send size={14} />
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">Sign in to chat</p>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
