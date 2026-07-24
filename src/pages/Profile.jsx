import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { User, Mail, Shield, Calendar, CheckCircle, XCircle, Camera, Pencil, Trash2, Loader2, Save, X, GraduationCap } from "lucide-react";
import moment from "moment";
import { formatLevel } from "@/lib/access";

export default function Profile() {
  const { profile, user, loading, refresh } = useStudentProfile();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [clearStatsOpen, setClearStatsOpen] = useState(false);
  const [clearingStats, setClearingStats] = useState(false);

  const displayName = profile?.full_name || user?.full_name || "Student";
  const profileImage = profile?.profile_image;

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      toast({ title: "Name cannot be empty", variant: "destructive" });
      return;
    }
    setSavingName(true);
    try {
      await base44.entities.StudentProfile.update(profile.id, { full_name: nameValue.trim() });
      await refresh();
      setEditingName(false);
      toast({ title: "Name updated" });
    } catch (err) {
      toast({ title: "Failed to update name", variant: "destructive" });
    } finally {
      setSavingName(false);
    }
  };

  const startEditing = () => {
    setNameValue(displayName);
    setEditingName(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.StudentProfile.update(profile.id, { profile_image: file_url });
      await refresh();
      toast({ title: "Profile image updated" });
    } catch (err) {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    try {
      await base44.entities.StudentProfile.update(profile.id, { profile_image: "" });
      await refresh();
      toast({ title: "Profile image removed" });
    } catch (err) {
      toast({ title: "Failed to remove image", variant: "destructive" });
    }
  };

  const handleClearStats = async () => {
    setClearingStats(true);
    try {
      await Promise.all([
        base44.entities.PracticeAttempt.deleteMany({ user_id: user.id }),
        base44.entities.MockExamResult.deleteMany({ user_id: user.id }),
        base44.entities.PracticeSession.deleteMany({ user_id: user.id }),
      ]);
      await base44.entities.StudentProfile.update(profile.id, {
        total_questions_answered: 0,
        total_correct: 0,
        total_practice_sessions: 0,
        total_mock_exams: 0,
      });
      await refresh();
      setClearStatsOpen(false);
      toast({ title: "Performance data cleared" });
    } catch (err) {
      toast({ title: "Failed to clear performance data", variant: "destructive" });
    } finally {
      setClearingStats(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (profile) {
        await base44.entities.StudentProfile.delete(profile.id);
      }
      await base44.entities.User.delete(user.id);
      window.location.href = "/landing";
    } catch (err) {
      toast({ title: "Failed to delete account. Please contact support.", variant: "destructive" });
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold">Profile</h1>

      {/* Profile card with image + name editing */}
      <div className="bg-card border border-border/60 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Profile image */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/5 flex items-center justify-center border-2 border-border">
              {profileImage ? (
                <img src={profileImage} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9 text-primary" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              title="Change profile image"
            >
              {uploadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
            {profileImage && (
              <button
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                title="Remove profile image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Name + email */}
          <div className="flex-1 text-center sm:text-left">
            {editingName ? (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="max-w-xs"
                  autoFocus
                />
                <Button size="icon" onClick={handleSaveName} disabled={savingName} className="shrink-0">
                  {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="outline" onClick={() => setEditingName(false)} disabled={savingName} className="shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="font-heading font-semibold text-lg">{displayName}</h2>
                <button onClick={startEditing} className="text-muted-foreground hover:text-primary transition-colors" title="Edit name">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Account info */}
        <div className="border-t border-border pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email</span>
            </div>
            <span className="text-sm font-medium">{user?.email}</span>
          </div>

          {profile?.department_name && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Department</span>
              </div>
              <span className="text-sm font-medium">{profile.department_name} • {formatLevel(profile.level)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Account Status</span>
            </div>
            {profile?.is_activated ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle className="w-4 h-4" /> Premium Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <XCircle className="w-4 h-4" /> Free Trial
              </span>
            )}
          </div>

          {profile?.activation_date && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Activated</span>
              </div>
              <span className="text-sm font-medium">{moment(profile.activation_date).format("MMM D, YYYY")}</span>
            </div>
          )}

          {profile?.activation_code && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Activation Code</span>
              <span className="text-sm font-mono font-medium">{profile.activation_code}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm font-medium">{moment(user?.created_date).format("MMM D, YYYY")}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold">Performance Summary</h3>
          <AlertDialog open={clearStatsOpen} onOpenChange={setClearStatsOpen}>
            <AlertDialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all performance data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your practice attempts, mock exam results, and reset your stats to zero. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={clearingStats}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearStats}
                  disabled={clearingStats}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {clearingStats ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1" /> Clearing...
                    </>
                  ) : (
                    "Yes, Clear All"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="font-display text-2xl font-bold">{profile?.total_questions_answered || 0}</p>
            <p className="text-xs text-muted-foreground">Questions Answered</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="font-display text-2xl font-bold">
              {profile?.total_questions_answered > 0
                ? Math.round(((profile?.total_correct || 0) / profile.total_questions_answered) * 100)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="font-display text-2xl font-bold">{profile?.total_mock_exams || 0}</p>
            <p className="text-xs text-muted-foreground">Mock Exams</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="font-display text-2xl font-bold">{profile?.total_practice_sessions || 0}</p>
            <p className="text-xs text-muted-foreground">Practice Sessions</p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-destructive/30 rounded-xl p-6">
        <h3 className="font-heading font-semibold text-destructive mb-2">Delete Account</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="rounded-full gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5">
              <Trash2 className="w-4 h-4" /> Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account, profile, and all practice/exam history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" /> Deleting...
                  </>
                ) : (
                  "Yes, Delete My Account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}