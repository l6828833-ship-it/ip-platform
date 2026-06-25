import UserLayout from "@/components/UserLayout";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, LifeBuoy } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AIChat() {
  const { data: config, isLoading } = trpc.ai.config.useQuery();
  const [messages, setMessages] = useState<Message[]>([]);

  const chat = trpc.ai.chat.useMutation({
    onSuccess: (res) => {
      setMessages((prev) => [...prev, { role: "assistant", content: res.content }]);
    },
    onError: (err) => {
      toast.error(err.message || "The assistant couldn't respond. Please try again.");
    },
  });

  const handleSend = (content: string) => {
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    chat.mutate({ messages: next });
  };

  return (
    <UserLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Chat
          </h1>
          <p className="text-muted-foreground">
            Get instant answers from our AI assistant. For account or payment
            issues, please open a Support Ticket.
          </p>
        </div>

        {isLoading ? (
          <div className="skeleton h-[60vh] rounded-lg" />
        ) : config?.enabled ? (
          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={chat.isPending}
            height="calc(100vh - 16rem)"
            placeholder="Ask the assistant anything..."
            emptyStateMessage="Hi! I'm your AI assistant. How can I help you today?"
            suggestedPrompts={[
              "What subscription plans do you offer?",
              "Which devices are supported?",
              "How do activation points work?",
              "How can I pay with crypto?",
            ]}
          />
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
              <h3 className="font-semibold mb-1">The AI assistant is currently unavailable</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Our team is here to help in the meantime.
              </p>
              <Link href="/chat">
                <Button variant="outline">
                  <LifeBuoy className="h-4 w-4 mr-2" />
                  Open a Support Ticket
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}
