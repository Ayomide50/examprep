import React, { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("install_banner_dismissed") === "1"
  );

  useEffect(() => {
    if (isStandalone()) return;
    if (isIOS()) {
      setShowIOS(true);
      return;
    }
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("install_banner_dismissed", "1");
    setDismissed(true);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (dismissed || (!deferredPrompt && !showIOS)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-96 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
      <button onClick={dismiss} className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 pr-4">
          <p className="font-heading font-semibold text-sm">Install MyStudyApp</p>
          {deferredPrompt ? (
            <>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                Get the app on your phone for quick access anytime.
              </p>
              <Button size="sm" onClick={install}>
                <Download className="w-4 h-4" /> Install App
              </Button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              Tap the <Share className="w-3.5 h-3.5 inline -mt-0.5" /> Share button in Safari, then choose{" "}
              <span className="font-medium text-foreground">"Add to Home Screen"</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}