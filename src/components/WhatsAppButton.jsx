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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden group-hover:inline text-sm font-medium">Chat with us</span>
    </a>
  );
}