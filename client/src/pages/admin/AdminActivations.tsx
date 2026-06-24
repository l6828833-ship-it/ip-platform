import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Zap, CheckCircle, XCircle, Clock, Coins } from "lucide-react";

type StatusFilter = "pending" | "activated" | "rejected" | "all";

export default function AdminActivations() {
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const { data: requests, isLoading } = trpc.activations.adminList.useQuery(
    statusFilter === "all" ? undefined : { status: statusFilter }
  );
  const { data: users } = trpc.users.list.useQuery();

  const userMap = useMemo(() => {
    const m = new Map<number, { name: string | null; email: string | null }>();
    (users || []).forEach((u) => m.set(u.id, { name: u.name, email: u.email }));
    return m;
  }, [users]);

  const process = trpc.activations.process.useMutation({
    onSuccess: () => {
      utils.activations.adminList.invalidate();
      toast.success("Request processed");
      setActioning(null);
      setNotes("");
    },
    onError: (e) => toast.error(e.message || "Failed to process request"),
  });

  const [actioning, setActioning] = useState<{ id: number; action: "activated" | "rejected" } | null>(null);
  const [notes, setNotes] = useState("");

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
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Activation Requests</h1>
          <p className="text-muted-foreground">Review and activate user app submissions</p>
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="activated">Activated</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
            <CardDescription>Activating does not refund points; rejecting refunds the user's points</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            ) : !requests || requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No requests</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>App</TableHead>
                      <TableHead>Submitted Data</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-40"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((r) => {
                      const u = userMap.get(r.userId);
                      const formData = (r.formData as Record<string, string> | null) || {};
                      return (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="font-medium">{u?.name || `User #${r.userId}`}</div>
                            <div className="text-xs text-muted-foreground">{u?.email || ""}</div>
                          </TableCell>
                          <TableCell>{r.appTitle}</TableCell>
                          <TableCell>
                            <div className="space-y-0.5 text-sm">
                              {Object.entries(formData).map(([k, v]) => (
                                <div key={k}>
                                  <span className="text-muted-foreground">{k}:</span>{" "}
                                  <span className="font-mono">{v}</span>
                                </div>
                              ))}
                              {Object.keys(formData).length === 0 && <span className="text-muted-foreground">-</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-amber-500" />
                              {r.pointsSpent}
                            </div>
                          </TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(r.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {r.status === "pending" ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="badge-verified"
                                  onClick={() => setActioning({ id: r.id, action: "activated" })}
                                >
                                  Activate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive"
                                  onClick={() => setActioning({ id: r.id, action: "rejected" })}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {r.adminNotes ? r.adminNotes : "-"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Process dialog */}
        <Dialog open={!!actioning} onOpenChange={() => { setActioning(null); setNotes(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actioning?.action === "activated" ? "Activate Request" : "Reject Request"}
              </DialogTitle>
              <DialogDescription>
                {actioning?.action === "activated"
                  ? "Mark this activation as done."
                  : "Rejecting will refund the points to the user."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Message / reason..." />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setActioning(null); setNotes(""); }}>
                Cancel
              </Button>
              <Button
                onClick={() => actioning && process.mutate({ id: actioning.id, status: actioning.action, adminNotes: notes || undefined })}
                disabled={process.isPending}
                variant={actioning?.action === "rejected" ? "destructive" : "default"}
              >
                {process.isPending ? "Saving..." : actioning?.action === "activated" ? "Activate" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
