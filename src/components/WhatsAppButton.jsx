import React from "react";
import { MessageCircle } from "lucide-react";
import { ADMIN_WHATSAPP } from "@/lib/constants";

export default function WhatsAppButton() {
  const link = `https://wa.me/${ADMIN_WHATSAPP}`;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 group"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium hidden group-hover:inline">Chat with us</span>
    </a>
  );
}