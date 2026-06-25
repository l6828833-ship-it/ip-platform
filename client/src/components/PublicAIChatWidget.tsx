import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Headset, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Public "Live Agent" chat for the marketing homepage. Works for anonymous
 * visitors (no login) via the ai.publicChat endpoint. Only shows when the
 * admin has enabled the assistant.
 */
export default function PublicAIChatWidget() {
  const { data: config } = trpc.ai.publicConfig.useQuery(undefined, { staleTime: 60_000 });
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const chat = trpc.ai.publicChat.useMutation({
    onSuccess: (res) => {
      setMessages((prev) => [...prev, { role: "assistant", content: res.content }]);
    },
    onError: (err) => {
      toast.error(err.message || "The agent couldn't respond. Please try again.");
    },
  });

  const handleSend = (content: string) => {
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    chat.mutate({ messages: next });
  };

  if (!config?.enabled) return null;

  return (
    <>
      {open && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-50",
            "w-[calc(100vw-3rem)] max-w-[400px] h-[70vh] max-h-[600px]",
            "flex flex-col rounded-2xl border bg-white shadow-2xl overflow-hidden"
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3 bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] text-white">
            <div className="flex items-center gap-2 min-w-0">
              <Headset className="h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold leading-none truncate">Live Agent</p>
                <p className="text-[11px] opacity-90 mt-0.5">We're online to help</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors shrink-0"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSend}
              isLoading={chat.isPending}
              height="100%"
              className="border-0 shadow-none rounded-none h-full"
              placeholder="Ask us anything..."
              emptyStateMessage="Hi! 👋 How can we help you today?"
              suggestedPrompts={[
                "What plans do you offer?",
                "Which devices are supported?",
                "How do I get a free trial?",
                "How do payments work?",
              ]}
            />
          </div>
        </div>
      )}

      <Button
        size="lg"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] hover:opacity-90 transition-opacity z-50"
        aria-label={open ? "Close chat" : "Chat with a live agent"}
      >
        {open ? <X className="h-6 w-6" /> : <Headset className="h-6 w-6" />}
      </Button>
    </>
  );
}
