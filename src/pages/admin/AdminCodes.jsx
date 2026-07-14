import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { generateActivationCode } from "@/lib/constants";
import { KeyRound, Plus, Search, Trash2, Copy, CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

export default function AdminCodes() {
  const { toast } = useToast();
  const [codes, setCodes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [genDuration, setGenDuration] = useState("full_time");
  const [clearing, setClearing] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);

  const loadCodes = async () => {
    const data = await base44.entities.ActivationCode.list("-created_date", 200);
    setCodes(data);
    setLoading(false);
  };

  useEffect(() => { loadCodes(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    const count = Math.min(Math.max(1, genCount), 50);
    const newCodes = [];

    for (let i = 0; i < count; i++) {
      let code = generateActivationCode();
      // Ensure uniqueness
      while (codes.some((c) => c.code === code)) {
        code = generateActivationCode();
      }
      newCodes.push({
        code,
        status: "unused",
        access_duration: genDuration,
      });
    }

    await base44.entities.ActivationCode.bulkCreate(newCodes);
    toast({ title: `${count} code${count > 1 ? "s" : ""} generated` });
    setShowGenerate(false);
    loadCodes();
    setGenerating(false);
  };

  const handleRevoke = async (id) => {
    await base44.entities.ActivationCode.update(id, { status: "revoked" });
    toast({ title: "Code revoked" });
    loadCodes();
  };

  const handleDelete = async (id) => {
    await base44.entities.ActivationCode.delete(id);
    toast({ title: "Code deleted" });
    loadCodes();
  };

  const handleClearUnusedRevoked = async () => {
    setClearing(true);
    try {
      await base44.entities.ActivationCode.deleteMany({ status: "unused" });
      await base44.entities.ActivationCode.deleteMany({ status: "revoked" });
      toast({ title: "Unused and revoked codes cleared" });
      setClearOpen(false);
      loadCodes();
    } catch (error) {
      toast({ title: "Failed to clear codes", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied to clipboard" });
  };

  const filtered = codes.filter((c) => {
    const matchSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.assigned_student_email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Activation Codes</h1>
          <p className="text-muted-foreground mt-1">Generate and manage activation codes</p>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="rounded-full gap-2" disabled={clearing}>
                <Trash2 className="w-4 h-4" /> Clear Unused & Revoked
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all unused and revoked codes?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all activation codes with "unused" or "revoked" status. Used codes will not be affected. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={clearing}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearUnusedRevoked}
                  disabled={clearing}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {clearing ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Clearing...</> : "Yes, Clear All"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button className="rounded-full gap-2" onClick={() => setShowGenerate(true)}>
            <Plus className="w-4 h-4" /> Generate Codes
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search codes or emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 rounded-full">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="unused">Unused</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="rounded-full shrink-0" onClick={loadCodes}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="font-display text-xl font-bold text-green-700">{codes.filter((c) => c.status === "unused").length}</p>
          <p className="text-xs text-green-600">Unused</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="font-display text-xl font-bold text-blue-700">{codes.filter((c) => c.status === "used").length}</p>
          <p className="text-xs text-blue-600">Used</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="font-display text-xl font-bold text-red-700">{codes.filter((c) => c.status === "revoked").length}</p>
          <p className="text-xs text-red-600">Revoked</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">Code</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Duration</th>
                <th className="px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Student</th>
                <th className="px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Activated</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((code) => (
                <tr key={code.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono font-medium">{code.code}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      code.status === "unused"
                        ? "bg-green-100 text-green-700"
                        : code.status === "used"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {code.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground capitalize">{(code.access_duration || "full_time").replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{code.assigned_student_email || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">
                    {code.date_activated ? new Date(code.date_activated).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyCode(code.code)} className="p-1.5 hover:bg-muted rounded-md" title="Copy">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      {code.status === "unused" && (
                        <button onClick={() => handleRevoke(code.id)} className="p-1.5 hover:bg-amber-50 rounded-md" title="Revoke">
                          <XCircle className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                      )}
                      {code.status !== "used" && (
                        <button onClick={() => handleDelete(code.id)} className="p-1.5 hover:bg-red-50 rounded-md" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    {search ? "No codes match your search" : "No activation codes yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate dialog */}
      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Activation Codes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Number of Codes</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={genCount}
                onChange={(e) => setGenCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Access Duration</label>
              <Select value={genDuration} onValueChange={setGenDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time (No Expiry)</SelectItem>
                  <SelectItem value="30_days">30 Days</SelectItem>
                  <SelectItem value="60_days">60 Days</SelectItem>
                  <SelectItem value="90_days">90 Days</SelectItem>
                  <SelectItem value="180_days">180 Days</SelectItem>
                  <SelectItem value="365_days">365 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerate(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating..." : `Generate ${genCount} Code${genCount > 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}