import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatNaira } from "@/lib/referral";

export default function WithdrawDialog({ open, onOpenChange, balance, user, profile, onSubmitted }) {
  const { toast } = useToast();
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      toast({ title: "Please fill in all bank details", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.WithdrawalRequest.create({
        user_id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.full_name || "",
        amount: balance,
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        status: "pending",
      });
      toast({ title: "Withdrawal request submitted", description: "You will receive your payment shortly." });
      onOpenChange(false);
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      onSubmitted();
    } catch (err) {
      toast({ title: "Failed to submit withdrawal request", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw {formatNaira(balance)}</DialogTitle>
          <DialogDescription>
            Enter your bank details. Your full available balance will be paid out.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" placeholder="e.g. GTBank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" inputMode="numeric" placeholder="0123456789" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input id="accountName" placeholder="Name on the account" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}