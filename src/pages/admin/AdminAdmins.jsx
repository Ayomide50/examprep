import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, UserPlus, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminAdmins() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [inviting, setInviting] = useState(false);

  const fetchUsers = async () => {
    try {
      const allUsers = await base44.entities.User.list();
      setUsers(allUsers);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async () => {
    if (!email) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(email, role);
      toast({
        title: "Invitation sent",
        description: `${email} has been invited as ${role}`,
      });
      setEmail("");
      fetchUsers();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to send invitation",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await base44.entities.User.update(userId, { role: newRole });
      toast({ title: "Role updated", description: `User is now ${newRole}` });
      fetchUsers();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update role",
      });
    }
  };

  const adminUsers = users.filter((u) => u.role === "admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Admin Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Invite users and assign roles to manage the platform
        </p>
      </div>

      {/* Invite section */}
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <h2 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          Invite New User
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Student</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleInvite} disabled={inviting || !email} className="gap-2">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Send Invite
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          The invitee will receive an email to set their password and join the platform.
        </p>
      </div>

      {/* Admin users table */}
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border/60">
          <h2 className="font-heading font-semibold text-sm">Platform Admins</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {adminUsers.length} admin(s) with full access
          </p>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role || "user"}
                      onValueChange={(val) => handleRoleChange(u.id, val)}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.created_date
                      ? new Date(u.created_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}