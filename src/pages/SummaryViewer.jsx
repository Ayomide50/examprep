import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Lock, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentProfile } from "@/hooks/useStudentProfile";

const PDF_JS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDF_WORKER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const existing = document.getElementById("pdfjs-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.pdfjsLib));
      existing.addEventListener("error", () => reject(new Error("Failed to load PDF viewer")));
      return;
    }
    const script = document.createElement("script");
    script.id = "pdfjs-script";
    script.src = PDF_JS_CDN;
    script.onload = async () => {
      try {
        const lib = window.pdfjsLib;
        // Use a same-origin blob worker to avoid cross-origin worker restrictions on iOS Safari.
        const resp = await fetch(PDF_WORKER_CDN);
        const text = await resp.text();
        const blob = new Blob([text], { type: "application/javascript" });
        lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
        resolve(lib);
      } catch (e) {
        reject(new Error("Failed to load PDF worker"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF viewer"));
    document.head.appendChild(script);
  });
}

export default function SummaryViewer() {
  const { summaryId } = useParams();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useStudentProfile();
  const containerRef = useRef(null);
  const [state, setState] = useState({
    status: "loading",
    url: null,
    title: null,
    code: null,
    progress: "",
  });

  useEffect(() => {
    const load = async () => {
      if (profileLoading) return;
      if (!profile || !profile.is_activated) {
        setState({ status: "locked", url: null, title: null, code: "not_activated", progress: "" });
        return;
      }
      try {
        const res = await base44.functions.invoke("getSummaryFileUrl", { summary_id: summaryId });
        const signedUrl = res.data.signed_url;
        setState({ status: "rendering", url: signedUrl, title: res.data.title || "Summary", code: null, progress: "Loading viewer…" });
        await renderPdf(signedUrl);
        setState((s) => ({ ...s, status: "ready" }));
      } catch (err) {
        const code = err?.response?.data?.code;
        if (code === "not_activated" || code === "not_authorized") {
          setState({ status: "locked", url: null, title: null, code, progress: "" });
        } else {
          setState((s) => ({ ...s, status: "render_error", code: "render_error" }));
        }
      }
    };

    const renderPdf = async (url) => {
      try {
        const lib = await loadPdfJs();
        const pdf = await lib.getDocument({ url }).promise;
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssWidth = container.clientWidth;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = (cssWidth / baseViewport.width) * dpr;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.style.margin = "0 auto 12px";
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;
          container.appendChild(canvas);
          setState((s) => ({ ...s, progress: `Rendering page ${i} of ${pdf.numPages}` }));
        }
      } catch (e) {
        throw e;
      }
    };

    load();
  }, [summaryId, profile, profileLoading]);

  const isLoading = state.status === "loading" || state.status === "rendering" || profileLoading;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="rounded-full gap-2" onClick={() => navigate("/summaries")}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          {state.progress && <p className="text-sm text-muted-foreground">{state.progress}</p>}
        </div>
      </div>
    );
  }

  if (state.status === "locked" || state.status === "render_error") {
    const isAuthBlock = state.code === "not_activated" || state.code === "not_authorized";
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isAuthBlock ? "bg-amber-100 dark:bg-amber-950/40" : "bg-destructive/10"
          }`}
        >
          {isAuthBlock ? <Lock className="w-7 h-7 text-amber-600" /> : <AlertCircle className="w-7 h-7 text-destructive" />}
        </div>
        <h1 className="font-display text-xl font-bold">
          {isAuthBlock ? "Account Activation Required" : "Couldn't Load Summary"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {state.code === "not_authorized"
            ? "You are not authorized to view this summary."
            : state.code === "not_activated"
            ? "Your account must be activated before you can access course summaries. Please contact your department representative or administrator for assistance."
            : "This summary could not be displayed. Please try again later."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {state.status === "render_error" && state.url && (
            <Button asChild className="rounded-full gap-2">
              <a href={state.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" /> Open Summary
              </a>
            </Button>
          )}
          <Button asChild variant={state.status === "render_error" ? "outline" : "default"} className="rounded-full gap-2">
            <Link to="/summaries">
              <ArrowLeft className="w-4 h-4" /> Back to Summaries
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="rounded-full gap-2 shrink-0" onClick={() => navigate("/summaries")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h1 className="font-heading font-semibold truncate flex-1">{state.title}</h1>
      </div>
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div ref={containerRef} className="w-full max-h-[80vh] overflow-y-auto p-3 sm:p-4" />
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Summaries are for reading only within MYStudy.
      </p>
    </div>
  );
}