import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Loader2 } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// Canvas-based PDF renderer. Works reliably on iOS Safari (where <iframe> PDFs
// often render blank/incomplete) and on Android. Renders to <canvas> so there
// is no native download toolbar — keeping the summary view-only.
export default function PdfViewer({ url, title }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | ready | fallback

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";
        const containerWidth = container.clientWidth || 800;
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const scale = Math.max(0.5, Math.min(containerWidth / base.width, 2.5));
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.className = "block w-full h-auto bg-white shadow-sm rounded-md mb-3";
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          await page.render({ canvasContext: ctx, viewport }).promise;
          container.appendChild(canvas);
        }
        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        // Fallback (e.g. CORS) to an embedded viewer — at least keeps Android working.
        setStatus("fallback");
      }
    };
    render();
    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [url]);

  if (status === "fallback") {
    return (
      <iframe
        src={`${url}#toolbar=0&navpanes=0&view=FitH`}
        title={title || "Summary"}
        className="w-full h-[75vh] sm:h-[80vh] border-0 bg-white"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="relative">
      {status === "loading" && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <div
        ref={containerRef}
        className="flex flex-col items-center bg-muted/30 rounded-lg p-3 min-h-[60vh]"
      />
    </div>
  );
}