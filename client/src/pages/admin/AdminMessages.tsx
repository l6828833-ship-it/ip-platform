import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";

type Style = "info" | "success" | "warning" | "error";

const GLOBAL = "global";

type MessageFormData = {
  title: string;
  body: string;
  style: Style;
  target: string; // "global" or a userId string
  isDismissible: boolean;
  isActive: boolean;
};

const defaultForm: MessageFormData = {
  title: "",
  body: "",
  style: "info",
  target: GLOBAL,
  isDismissible: true,
  isActive: true,
};

const styleBadge: Record<Style, string> = {
  info: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  error: "bg-red-500/10 text-red-600 border-red-500/30",
};

export default function AdminMessages() {
  const utils = trpc.useUtils();
  const { data: messages, isLoading } = trpc.dashboardMessages.adminList.useQuery();
  const { data: users } = trpc.users.list.useQuery();

  const userMap = useMemo(() => {
    const m = new Map<number, { name: string | null; email: string | null }>();
    (users || []).forEach((u) => m.set(u.id, { name: u.name, email: u.email }));
    return m;
  }, [users]);

  const createMsg = trpc.dashboardMessages.create.useMutation({
    onSuccess: () => {
      utils.dashboardMessages.adminList.invalidate();
      toast.success("Message created");
      setShowCreate(false);
      setForm(defaultForm);
    },
    onError: (e) => toast.error(e.message || "Failed to create message"),
  });

  const updateMsg = trpc.dashboardMessages.update.useMutation({
    onSuccess: () => {
      utils.dashboardMessages.adminList.invalidate();
      toast.success("Message updated");
      setEditing(null);
      setForm(defaultForm);
    },
    onError: (e) => toast.error(e.message || "Failed to update message"),
  });

  const deleteMsg = trpc.dashboardMessages.delete.useMutation({
    onSuccess: () => {
      utils.dashboardMessages.adminList.invalidate();
      toast.success("Message deleted");
      setDeleting(null);
    },
    onError: (e) => toast.error(e.message || "Failed to delete message"),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<NonNullable<typeof messages>[0] | null>(null);
  const [deleting, setDeleting] = useState<NonNullable<typeof messages>[0] | null>(null);
  const [form, setForm] = useState<MessageFormData>(defaultForm);

  const handleEdit = (m: NonNullable<typeof messages>[0]) => {
    setEditing(m);
    setForm({
      title: m.title || "",
      body: m.body,
      style: m.style as Style,
      target: m.userId ? String(m.userId) : GLOBAL,
      isDismissible: m.isDismissible,
      isActive: m.isActive,
    });
  };

  const handleSave = () => {
    if (!form.body.trim()) {
      toast.error("Message body is required");
      return;
    }
    const data = {
      title: form.title.trim() || null,
      body: form.body.trim(),
      style: form.style,
      userId: form.target === GLOBAL ? null : parseInt(form.target),
      isDismissible: form.isDismissible,
      isActive: form.isActive,
    };
    if (editing) {
      updateMsg.mutate({ id: editing.id, ...data });
    } else {
      createMsg.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Messages</h1>
            <p className="text-muted-foreground">Show announcements to all users or a specific user</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Message
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Messages</CardTitle>
            <CardDescription>Global messages target every user; targeted ones go to one user</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
                <Button variant="link" onClick={() => setShowCreate(true)}>
                  Create your first message
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>Style</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Dismissible</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((m) => {
                      const u = m.userId ? userMap.get(m.userId) : null;
                      return (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div className="font-medium">{m.title || "(no title)"}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{m.body}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize ${styleBadge[m.style as Style]}`}>
                              {m.style}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {m.userId ? (
                              <span className="text-sm">{u?.name || u?.email || `User #${m.userId}`}</span>
                            ) : (
                              <Badge variant="secondary">All users</Badge>
                            )}
                          </TableCell>
                          <TableCell>{m.isDismissible ? "Yes" : "No"}</TableCell>
                          <TableCell>
                            {m.isActive ? (
                              <Badge className="badge-verified">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(m)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleting(m)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

        {/* Create/Edit dialog */}
        <Dialog
          open={showCreate || !!editing}
          onOpenChange={() => {
            setShowCreate(false);
            setEditing(null);
            setForm(defaultForm);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Message" : "New Message"}</DialogTitle>
              <DialogDescription>This appears on the user dashboard</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., Scheduled maintenance" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={4} placeholder="Write your message..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={form.style} onValueChange={(v) => setForm((p) => ({ ...p, style: v as Style }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Audience</Label>
                  <Select value={form.target} onValueChange={(v) => setForm((p) => ({ ...p, target: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GLOBAL}>All users</SelectItem>
                      {(users || []).map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name || u.email || `User #${u.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isDismissible} onCheckedChange={(c) => setForm((p) => ({ ...p, isDismissible: c }))} />
                  <Label>User can dismiss</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.isActive} onCheckedChange={(c) => setForm((p) => ({ ...p, isActive: c }))} />
                  <Label>Active</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreate(false);
                  setEditing(null);
                  setForm(defaultForm);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={createMsg.isPending || updateMsg.isPending}>
                {createMsg.isPending || updateMsg.isPending ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete dialog */}
        <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Message</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deleting && deleteMsg.mutate({ id: deleting.id })} disabled={deleteMsg.isPending}>
                {deleteMsg.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
