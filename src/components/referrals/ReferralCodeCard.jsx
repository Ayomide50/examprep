import React, { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getReferralLink } from "@/lib/referral";

export default function ReferralCodeCard({ code }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Referral code copied!" });
  };

  const shareLink = async () => {
    const link = getReferralLink(code);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join MyStudyApp",
          text: `Sign up with my referral code ${code} and start practicing!`,
          url: link,
        });
        return;
      } catch (_) {
        // user cancelled — fall through to copy
      }
    }
    await navigator.clipboard.writeText(link);
    toast({ title: "Referral link copied!", description: "Share it with your friends." });
  };

  return (
    <div className="bg-card border border-border/60 rounded-xl p-6 space-y-4">
      <h2 className="font-heading font-semibold">Your Referral Code</h2>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-muted/60 border border-border rounded-lg py-3 text-center font-mono text-lg md:text-xl font-bold tracking-widest">
          {code}
        </div>
        <Button size="icon" variant="outline" onClick={copyCode} className="h-12 w-12 shrink-0" title="Copy code">
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <Button variant="outline" onClick={shareLink} className="w-full rounded-full gap-2">
        <Share2 className="w-4 h-4" /> Share Referral Link
      </Button>
    </div>
  );
}