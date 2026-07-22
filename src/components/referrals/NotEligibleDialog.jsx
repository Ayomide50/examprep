import React from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MIN_WITHDRAWAL, formatNaira } from "@/lib/referral";

export default function NotEligibleDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-7 h-7 text-amber-600" />
          </div>
          <DialogTitle>Withdrawal Not Available</DialogTitle>
          <DialogDescription className="text-center">
            You are not yet eligible for withdrawal.
            <br /><br />
            The minimum withdrawal amount is <strong>{formatNaira(MIN_WITHDRAWAL)}</strong>.
            <br /><br />
            Keep referring more users to earn additional rewards.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={() => onOpenChange(false)} className="rounded-full px-8">Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}