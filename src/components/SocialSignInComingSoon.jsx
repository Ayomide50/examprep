import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function SocialSignInComingSoon({ icon = Sparkles, title = "Social sign-in is coming soon" }) {
  return (
    <AuthLayout
      icon={icon}
      title={title}
      subtitle="We're putting the finishing touches on account creation."
    >
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Email sign-up is temporarily disabled. You'll soon be able to sign in
          with Google and other social accounts. Check back shortly!
        </p>
        <Link
          to="/landing"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </AuthLayout>
  );
}