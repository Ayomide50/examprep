import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import moment from "moment";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ADMIN_WHATSAPP } from "@/lib/constants";
import { formatNaira } from "@/lib/referral";

export default function WithdrawReceiptDialog({ open, onOpenChange, request }) {
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!request) return null;

  const dateStr = moment(request.created_date).format("MMM D, YYYY h:mm A");

  const whatsappMessage = encodeURIComponent(
    `Hello Admin,\n\nI would like to request the withdrawal of my referral earnings.\n\nName: ${request.full_name || request.email}\nReferral ID: ${request.referral_code || "—"}\nAmount: ₦${(request.amount || 0).toLocaleString()}\nDate: ${dateStr}\n\nMy withdrawal receipt has been generated. Kindly process my payment.\n\nThank you.`
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `withdrawal-receipt-${request.id.slice(-8)}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Withdrawal Request Submitted
          </DialogTitle>
          <DialogDescription>
            Save your receipt and send it to the admin on WhatsApp to process your payment.
          </DialogDescription>
        </DialogHeader>

        {/* Receipt — fixed light colors so the downloaded image is always readable */}
        <div ref={receiptRef} className="bg-white text-slate-900 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <p className="font-bold text-lg">MyStudyApp</p>
            <p className="text-xs text-slate-500">Referral Withdrawal Receipt</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Receipt No.</span><span className="font-mono font-medium">{request.id.slice(-8).toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-medium">{request.full_name || request.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Referral ID</span><span className="font-mono font-medium">{request.referral_code || "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-bold">{formatNaira(request.amount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Date & Time</span><span className="font-medium">{dateStr}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-300 pt-3">
            Keep this receipt as proof of your withdrawal request.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={`https://wa.me/${ADMIN_WHATSAPP}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full rounded-full gap-2 bg-green-600 hover:bg-green-700 text-white">
              Share via WhatsApp
            </Button>
          </a>
          <Button variant="outline" onClick={handleDownload} disabled={downloading} className="flex-1 rounded-full gap-2">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}