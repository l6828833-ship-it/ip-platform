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
import { useState } from "react";
import { toast } from "sonner";
import { AppWindow, Plus, MoreHorizontal, Edit, Trash2, X, Coins } from "lucide-react";

type FieldType = "text" | "mac" | "email" | "number";

type AppField = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
};

type AppFormData = {
  title: string;
  iconUrl: string;
  description: string;
  instructions: string;
  instructionsLink: string;
  pointsCost: number;
  fields: AppField[];
  isActive: boolean;
  sortOrder: number;
};

const defaultAppForm: AppFormData = {
  title: "",
  iconUrl: "",
  description: "",
  instructions: "",
  instructionsLink: "",
  pointsCost: 1,
  fields: [{ key: "mac", label: "MAC Address", type: "mac", required: true, placeholder: "00:1A:79:..." }],
  isActive: true,
  sortOrder: 0,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";

export default function AdminApps() {
  const utils = trpc.useUtils();
  const { data: apps, isLoading } = trpc.apps.adminList.useQuery();

  const createApp = trpc.apps.create.useMutation({
    onSuccess: () => {
      utils.apps.adminList.invalidate();
      toast.success("App created");
      setShowCreateDialog(false);
      setAppForm(defaultAppForm);
    },
    onError: (e) => toast.error(e.message || "Failed to create app"),
  });

  const updateApp = trpc.apps.update.useMutation({
    onSuccess: () => {
      utils.apps.adminList.invalidate();
      toast.success("App updated");
      setEditingApp(null);
      setAppForm(defaultAppForm);
    },
    onError: (e) => toast.error(e.message || "Failed to update app"),
  });

  const deleteApp = trpc.apps.delete.useMutation({
    onSuccess: () => {
      utils.apps.adminList.invalidate();
      toast.success("App deleted");
      setDeletingApp(null);
    },
    onError: (e) => toast.error(e.message || "Failed to delete app"),
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingApp, setEditingApp] = useState<NonNullable<typeof apps>[0] | null>(null);
  const [deletingApp, setDeletingApp] = useState<NonNullable<typeof apps>[0] | null>(null);
  const [appForm, setAppForm] = useState<AppFormData>(defaultAppForm);

  const handleEdit = (app: NonNullable<typeof apps>[0]) => {
    setEditingApp(app);
    setAppForm({
      title: app.title,
      iconUrl: app.iconUrl || "",
      description: app.description || "",
      instructions: app.instructions || "",
      instructionsLink: app.instructionsLink || "",
      pointsCost: app.pointsCost,
      fields: ((app.fields as AppField[]) || []).map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: f.required,
        placeholder: f.placeholder || "",
      })),
      isActive: app.isActive,
      sortOrder: app.sortOrder,
    });
  };

  const addField = () => {
    setAppForm((prev) => ({
      ...prev,
      fields: [...prev.fields, { key: "", label: "", type: "text", required: true, placeholder: "" }],
    }));
  };

  const updateField = (index: number, patch: Partial<AppField>) => {
    setAppForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }));
  };

  const removeField = (index: number) => {
    setAppForm((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    if (!appForm.title.trim()) {
      toast.error("App title is required");
      return;
    }
    if (appForm.fields.length === 0) {
      toast.error("Add at least one form field");
      return;
    }
    // Normalize field keys and validate labels
    const seen = new Set<string>();
    const fields: AppField[] = [];
    for (const f of appForm.fields) {
      if (!f.label.trim()) {
        toast.error("Every field needs a label");
        return;
      }
      let key = (f.key.trim() || slugify(f.label));
      while (seen.has(key)) key = `${key}_1`;
      seen.add(key);
      fields.push({
        key,
        label: f.label.trim(),
        type: f.type,
        required: f.required,
        placeholder: f.placeholder?.trim() || undefined,
      });
    }

    const data = {
      title: appForm.title.trim(),
      iconUrl: appForm.iconUrl.trim() || null,
      description: appForm.description.trim() || null,
      instructions: appForm.instructions.trim() || null,
      instructionsLink: appForm.instructionsLink.trim() || null,
      pointsCost: appForm.pointsCost,
      fields,
      isActive: appForm.isActive,
      sortOrder: appForm.sortOrder,
    };

    if (editingApp) {
      updateApp.mutate({ id: editingApp.id, ...data });
    } else {
      createApp.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Activation Apps</h1>
            <p className="text-muted-foreground">Apps users can activate using their points</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add App
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Apps</CardTitle>
            <CardDescription>Each app collects its own form fields and costs points to activate</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            ) : !apps || apps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AppWindow className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No apps configured</p>
                <Button variant="link" onClick={() => setShowCreateDialog(true)}>
                  Add your first app
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>App</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Fields</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              {app.iconUrl ? (
                                <img src={app.iconUrl} alt={app.title} className="h-full w-full object-cover" />
                              ) : (
                                <AppWindow className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{app.title}</div>
                              {app.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">{app.description}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-amber-500" />
                            {app.pointsCost}
                          </div>
                        </TableCell>
                        <TableCell>{(app.fields as AppField[] | null)?.length ?? 0}</TableCell>
                        <TableCell>
                          {app.isActive ? (
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
                              <DropdownMenuItem onClick={() => handleEdit(app)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingApp(app)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog
          open={showCreateDialog || !!editingApp}
          onOpenChange={() => {
            setShowCreateDialog(false);
            setEditingApp(null);
            setAppForm(defaultAppForm);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingApp ? "Edit App" : "Add App"}</DialogTitle>
              <DialogDescription>Configure the app, its instructions, cost and form fields</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={appForm.title}
                    onChange={(e) => setAppForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., Smarters Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Points Cost</Label>
                  <Input
                    type="number"
                    min="0"
                    value={appForm.pointsCost}
                    onChange={(e) => setAppForm((p) => ({ ...p, pointsCost: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo / Icon Image URL</Label>
                <Input
                  value={appForm.iconUrl}
                  onChange={(e) => setAppForm((p) => ({ ...p, iconUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Short Description (optional)</Label>
                <Input
                  value={appForm.description}
                  onChange={(e) => setAppForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Shown under the app title"
                />
              </div>

              <div className="space-y-2">
                <Label>Instructions (shown in popup)</Label>
                <Textarea
                  value={appForm.instructions}
                  onChange={(e) => setAppForm((p) => ({ ...p, instructions: e.target.value }))}
                  placeholder="How to use this app / what to enter..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Instructions Link (optional)</Label>
                <Input
                  value={appForm.instructionsLink}
                  onChange={(e) => setAppForm((p) => ({ ...p, instructionsLink: e.target.value }))}
                  placeholder="https://... (tutorial / guide)"
                />
              </div>

              {/* Form fields builder */}
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label>Form Fields</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addField} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add Field
                  </Button>
                </div>
                {appForm.fields.length === 0 && (
                  <p className="text-xs text-muted-foreground">No fields. Add at least one (e.g. MAC Address).</p>
                )}
                {appForm.fields.map((field, i) => (
                  <div key={i} className="grid gap-2 md:grid-cols-[1fr_1fr_auto] items-end border-b pb-3 last:border-b-0">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(i, { label: e.target.value })}
                        placeholder="e.g., MAC Address"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <Select value={field.type} onValueChange={(v) => updateField(i, { type: v as FieldType })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="mac">MAC Address</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(c) => updateField(i, { required: c })}
                      />
                      <span className="text-xs text-muted-foreground">Req.</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removeField(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(i, { placeholder: e.target.value })}
                        placeholder="Placeholder (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={appForm.sortOrder}
                    onChange={(e) => setAppForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <Switch
                    checked={appForm.isActive}
                    onCheckedChange={(c) => setAppForm((p) => ({ ...p, isActive: c }))}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingApp(null);
                  setAppForm(defaultAppForm);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={createApp.isPending || updateApp.isPending}>
                {createApp.isPending || updateApp.isPending ? "Saving..." : editingApp ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deletingApp} onOpenChange={() => setDeletingApp(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete App</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deletingApp?.title}"? This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingApp(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deletingApp && deleteApp.mutate({ id: deletingApp.id })} disabled={deleteApp.isPending}>
                {deleteApp.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
