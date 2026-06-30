import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Code2, Loader2, AlertTriangle } from "lucide-react";

const HEAD_PLACEHOLDER = `<!-- Code added here is injected into the page <head> on every page. -->
<!-- Example: Google Analytics, meta verification tags, custom <style>. -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>`;

const BODY_PLACEHOLDER = `<!-- Code added here is injected at the end of the page <body> on every page. -->
<!-- Example: chat widgets, tracking pixels, <noscript> tags. -->`;

export default function AdminCustomCode() {
  const utils = trpc.useUtils();
  const headQuery = trpc.settings.get.useQuery({ key: "custom_head_html" });
  const bodyQuery = trpc.settings.get.useQuery({ key: "custom_body_html" });

  const [headHtml, setHeadHtml] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");

  useEffect(() => {
    if (!headQuery.isLoading) {
      setHeadHtml(headQuery.data?.value ?? "");
    }
  }, [headQuery.data, headQuery.isLoading]);

  useEffect(() => {
    if (!bodyQuery.isLoading) {
      setBodyHtml(bodyQuery.data?.value ?? "");
    }
  }, [bodyQuery.data, bodyQuery.isLoading]);

  const setSetting = trpc.settings.set.useMutation();

  const handleSave = async () => {
    try {
      await setSetting.mutateAsync({
        key: "custom_head_html",
        value: headHtml,
        description: "Custom HTML injected into the page <head> on every page",
      });
      await setSetting.mutateAsync({
        key: "custom_body_html",
        value: bodyHtml,
        description: "Custom HTML injected at the end of the page <body> on every page",
      });
      await utils.settings.get.invalidate();
      await utils.settings.publicCustomCode.invalidate();
      toast.success("Custom code saved. Reload the site to see changes take effect.");
    } catch (e) {
      toast.error("Failed to save custom code");
    }
  };

  const loading = headQuery.isLoading || bodyQuery.isLoading;

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            Custom Code
          </h1>
          <p className="text-muted-foreground">
            Add custom HTML and scripts to the page head and body. Useful for analytics,
            verification tags, tracking pixels, and third-party chat widgets.
          </p>
        </div>

        <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              This code runs on every page for every visitor. Only paste code from
              sources you trust &mdash; invalid or malicious code can break the site or
              expose your users.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Head code</CardTitle>
            <CardDescription>
              Injected into the page <code>&lt;head&gt;</code>. Best for analytics
              snippets, meta tags, and stylesheets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="head-html" className="sr-only">Head HTML</Label>
            <Textarea
              id="head-html"
              value={headHtml}
              onChange={(e) => setHeadHtml(e.target.value)}
              placeholder={HEAD_PLACEHOLDER}
              rows={10}
              disabled={loading}
              className="resize-y font-mono text-sm"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Body code</CardTitle>
            <CardDescription>
              Injected at the end of the page <code>&lt;body&gt;</code>. Best for chat
              widgets, tracking pixels, and <code>&lt;noscript&gt;</code> tags.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="body-html" className="sr-only">Body HTML</Label>
            <Textarea
              id="body-html"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              placeholder={BODY_PLACEHOLDER}
              rows={10}
              disabled={loading}
              className="resize-y font-mono text-sm"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={setSetting.isPending || loading}>
            {setSetting.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save changes
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
