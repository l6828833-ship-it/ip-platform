import UserLayout from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { AppWindow, Coins, Zap, ExternalLink, CheckCircle, Clock, XCircle } from "lucide-react";

type AppField = {
  key: string;
  label: string;
  type: "text" | "mac" | "email" | "number";
  required: boolean;
  placeholder?: string;
};

export default function Apps() {
  const utils = trpc.useUtils();
  const { data: apps, isLoading } = trpc.apps.list.useQuery();
  const { data: pointsData } = trpc.activations.myPoints.useQuery();
  const { data: submissions } = trpc.activations.mySubmissions.useQuery();

  const points = pointsData?.points ?? 0;

  const submit = trpc.activations.submit.useMutation({
    onSuccess: () => {
      utils.activations.myPoints.invalidate();
      utils.activations.mySubmissions.invalidate();
      toast.success("Activation submitted! Our team will process it shortly.");
      setSelectedApp(null);
      setFormValues({});
    },
    onError: (e) => {
      // Silently ignore insufficient-points (the button is already disabled)
      if (e.message === "INSUFFICIENT_POINTS") return;
      toast.error(e.message || "Failed to submit activation");
    },
  });

  const [selectedApp, setSelectedApp] = useState<NonNullable<typeof apps>[0] | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const openApp = (app: NonNullable<typeof apps>[0]) => {
    setSelectedApp(app);
    setFormValues({});
  };

  const selectedFields = (selectedApp?.fields as AppField[] | null) || [];
  const canAfford = selectedApp ? points >= selectedApp.pointsCost : false;

  const requiredFilled = selectedFields
    .filter((f) => f.required)
    .every((f) => formValues[f.key]?.trim());

  const handleSubmit = () => {
    if (!selectedApp) return;
    submit.mutate({ appId: selectedApp.id, formData: formValues });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="badge-pending gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case "activated":
        return <Badge className="badge-verified gap-1"><CheckCircle className="h-3 w-3" />Activated</Badge>;
      case "rejected":
        return <Badge className="badge-rejected gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header + points */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Activation Apps</h1>
            <p className="text-muted-foreground">Use your points to activate apps</p>
          </div>
          <Card className="w-full md:w-auto">
            <CardContent className="flex items-center gap-3 py-3 px-5">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Coins className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Your Points</div>
                <div className="text-xl font-bold">{points}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Apps grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-40 rounded-xl" />
            ))}
          </div>
        ) : !apps || apps.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AppWindow className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">No Apps Available</h3>
              <p className="text-muted-foreground text-sm">Please check back later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => {
              const affordable = points >= app.pointsCost;
              return (
                <Card key={app.id} className="card-hover flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {app.iconUrl ? (
                          <img src={app.iconUrl} alt={app.title} className="h-full w-full object-cover" />
                        ) : (
                          <AppWindow className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{app.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Coins className="h-3 w-3 text-amber-500" />
                          {app.pointsCost} {app.pointsCost === 1 ? "point" : "points"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between gap-4">
                    {app.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
                    )}
                    <Button
                      className="w-full gradient-primary gap-2"
                      onClick={() => openApp(app)}
                      disabled={!affordable}
                    >
                      <Zap className="h-4 w-4" />
                      {affordable ? "Activate" : "Not enough points"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* History */}
        {submissions && submissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Activations</CardTitle>
              <CardDescription>History of your app activation requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {submissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <div className="font-medium">{s.appTitle}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(s.createdAt), "MMM d, yyyy")} • {s.pointsSpent} pts
                    </div>
                  </div>
                  {statusBadge(s.status)}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Activation dialog */}
        <Dialog
          open={!!selectedApp}
          onOpenChange={() => {
            setSelectedApp(null);
            setFormValues({});
          }}
        >
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedApp?.title}</DialogTitle>
              <DialogDescription>
                Costs {selectedApp?.pointsCost} {selectedApp?.pointsCost === 1 ? "point" : "points"} • You have {points}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Instructions */}
              {(selectedApp?.instructions || selectedApp?.instructionsLink) && (
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  {selectedApp?.instructions && (
                    <p className="text-sm whitespace-pre-line">{selectedApp.instructions}</p>
                  )}
                  {selectedApp?.instructionsLink && (
                    <a
                      href={selectedApp.instructionsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View instructions
                    </a>
                  )}
                </div>
              )}

              {/* Dynamic form */}
              {selectedFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                  <Input
                    type={field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                    value={formValues[field.key] || ""}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder || ""}
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedApp(null);
                  setFormValues({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!canAfford || !requiredFilled || submit.isPending} className="gap-2">
                <Zap className="h-4 w-4" />
                {submit.isPending ? "Submitting..." : "Submit Activation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
}
