import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

const DEFAULT_PROMPT_PLACEHOLDER = `You are a friendly customer support assistant for an IPTV subscription service.
Be warm, concise, and professional. Reply in the same language the customer writes in.
Help with general questions about plans, connections, supported devices, payments, and activation points.
Do not invent order numbers, passwords, or prices. For account/payment issues, ask the customer to open a Support Ticket.`;

export default function AdminAISettings() {
  const utils = trpc.useUtils();
  const enabledQuery = trpc.settings.get.useQuery({ key: "ai_chat_enabled" });
  const promptQuery = trpc.settings.get.useQuery({ key: "ai_chat_prompt" });

  const [enabled, setEnabled] = useState(false);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!enabledQuery.isLoading) {
      setEnabled(enabledQuery.data?.value === "true");
    }
  }, [enabledQuery.data, enabledQuery.isLoading]);

  useEffect(() => {
    if (!promptQuery.isLoading) {
      setPrompt(promptQuery.data?.value ?? "");
    }
  }, [promptQuery.data, promptQuery.isLoading]);

  const setSetting = trpc.settings.set.useMutation();

  const handleSave = async () => {
    try {
      await setSetting.mutateAsync({
        key: "ai_chat_enabled",
        value: enabled ? "true" : "false",
        description: "Turn the AI assistant chat on or off for users",
      });
      await setSetting.mutateAsync({
        key: "ai_chat_prompt",
        value: prompt,
        description: "System prompt (instructions/persona) for the AI assistant",
      });
      await utils.settings.get.invalidate();
      toast.success("AI settings saved");
    } catch (e) {
      toast.error("Failed to save AI settings");
    }
  };

  const loading = enabledQuery.isLoading || promptQuery.isLoading;

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Chat
          </h1>
          <p className="text-muted-foreground">
            Control the AI assistant that answers customers in the "Chat" page.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assistant status</CardTitle>
            <CardDescription>
              When off, the Chat page shows users a message and points them to Support Tickets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="ai-enabled" className="text-base">Enable AI assistant</Label>
                <p className="text-sm text-muted-foreground">
                  Turn the AI chat on or off for all users.
                </p>
              </div>
              <Switch
                id="ai-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Assistant instructions (system prompt)</Label>
              <Textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={DEFAULT_PROMPT_PLACEHOLDER}
                rows={8}
                disabled={loading}
                className="resize-y font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the built-in default instructions. Describe how the
                assistant should behave, what it can help with, and what to avoid.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <strong>Note:</strong> The AI also needs an API key set in your hosting
              environment (<code>OPENAI_API_KEY</code>). Optionally set <code>AI_MODEL</code>
              {" "}(default <code>gpt-4o-mini</code>). Without a key, the assistant stays unavailable
              even when enabled here.
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={setSetting.isPending || loading}>
                {setSetting.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
