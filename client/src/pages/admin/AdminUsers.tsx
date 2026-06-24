import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Users, 
  Search,
  MoreHorizontal,
  Shield,
  UserCog,
  Trash2,
  User,
  Coins
} from "lucide-react";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  
  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("User role updated");
      setEditingUser(null);
    },
    onError: () => {
      toast.error("Failed to update user role");
    }
  });
  
  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("User deleted");
      setDeletingUser(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    }
  });

  const adjustPoints = trpc.users.adjustPoints.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Points updated");
      setPointsUser(null);
      setPointsAmount(0);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update points");
    }
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<NonNullable<typeof users>[0] | null>(null);
  const [deletingUser, setDeletingUser] = useState<NonNullable<typeof users>[0] | null>(null);
  const [pointsUser, setPointsUser] = useState<NonNullable<typeof users>[0] | null>(null);
  const [pointsMode, setPointsMode] = useState<"add" | "deduct">("add");
  const [pointsAmount, setPointsAmount] = useState(0);
  const [newRole, setNewRole] = useState<"user" | "admin" | "agent">("user");
  
  const filteredUsers = users?.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Admin</Badge>;
      case "agent":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Agent</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };
  
  const handleUpdateRole = () => {
    if (editingUser) {
      updateRole.mutate({ userId: editingUser.id, role: newRole });
    }
  };
  
  const handleDeleteUser = () => {
    if (deletingUser) {
      deleteUser.mutate({ userId: deletingUser.id });
    }
  };

  const handleAdjustPoints = () => {
    if (!pointsUser || pointsAmount <= 0) {
      toast.error("Enter an amount greater than zero");
      return;
    }
    const delta = pointsMode === "add" ? pointsAmount : -pointsAmount;
    adjustPoints.mutate({ userId: pointsUser.id, delta });
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and roles</p>
        </div>
        
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users?.filter(u => u.role === "admin").length || 0}</div>
                <div className="text-sm text-muted-foreground">Admins</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <UserCog className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users?.filter(u => u.role === "agent").length || 0}</div>
                <div className="text-sm text-muted-foreground">Agents</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <Coins className="h-4 w-4 text-amber-500" />
                            {user.activationPoints ?? 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(user.lastSignedIn), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setEditingUser(user);
                                  setNewRole(user.role);
                                }}
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setPointsUser(user);
                                  setPointsMode("add");
                                  setPointsAmount(0);
                                }}
                              >
                                <Coins className="mr-2 h-4 w-4" />
                                Adjust Points
                              </DropdownMenuItem>
                              {user.id !== currentUser?.id && (
                                <DropdownMenuItem 
                                  onClick={() => setDeletingUser(user)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              )}
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
        
        {/* Edit Role Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for {editingUser?.name || editingUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={newRole} onValueChange={(v) => setNewRole(v as typeof newRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={handleUpdateRole} disabled={updateRole.isPending}>
                {updateRole.isPending ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Adjust Points Dialog */}
        <Dialog open={!!pointsUser} onOpenChange={() => { setPointsUser(null); setPointsAmount(0); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Activation Points</DialogTitle>
              <DialogDescription>
                {pointsUser?.name || pointsUser?.email} currently has{" "}
                <strong>{pointsUser?.activationPoints ?? 0}</strong> points
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={pointsMode} onValueChange={(v) => setPointsMode(v as "add" | "deduct")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add points</SelectItem>
                      <SelectItem value="deduct">Deduct points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min="1"
                    value={pointsAmount}
                    onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              {pointsUser && pointsAmount > 0 && (
                <p className="text-sm text-muted-foreground">
                  New balance:{" "}
                  <strong>
                    {Math.max((pointsUser.activationPoints ?? 0) + (pointsMode === "add" ? pointsAmount : -pointsAmount), 0)}
                  </strong>
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setPointsUser(null); setPointsAmount(0); }}>Cancel</Button>
              <Button onClick={handleAdjustPoints} disabled={adjustPoints.isPending}>
                {adjustPoints.isPending ? "Saving..." : pointsMode === "add" ? "Add Points" : "Deduct Points"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {deletingUser?.name || deletingUser?.email}? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteUser.isPending}>
                {deleteUser.isPending ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
