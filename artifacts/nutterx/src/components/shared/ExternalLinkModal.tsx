import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, Loader2, AlertCircle } from "lucide-react";

interface Props {
  url: string;
  onClose: () => void;
}

export function ExternalLinkModal({ url, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [iframeReady, setIframeReady] = useState(false);

  // Show spinner for at least 1.2s for a smooth transition feel
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Try to detect if iframe blocked (best effort)
  const handleIframeLoad = () => setIframeReady(true);

  const openHere = () => {
    window.location.href = url;
  };

  // Shorten long URLs for display
  const displayUrl = url.length > 60 ? url.slice(0, 57) + "…" : url;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.76)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          style={{ height: "78vh", background: "#111827" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: "#075E54" }}>
            <ExternalLink className="w-4 h-4 text-white shrink-0" />
            <p className="text-white text-xs flex-1 truncate font-mono">{displayUrl}</p>
            <button
              onClick={openHere}
              className="text-white/80 hover:text-white text-xs underline shrink-0 transition-colors"
              title="Open in this tab"
            >
              Open here
            </button>
            <button
              onClick={onClose}
              className="ml-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                key="spinner"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 mt-12"
                style={{ background: "#111827", pointerEvents: "none" }}
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-white/10" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#25D366] animate-spin" />
                </div>
                <p className="text-sm text-white/60">Loading…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Iframe area */}
          <div className="flex-1 relative overflow-hidden bg-white">
            <iframe
              src={url}
              title="Link preview"
              className="absolute inset-0 w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={handleIframeLoad}
            />

            {/* Fallback if iframe is blocked — shown after loading if iframe didn't render content */}
            {!loading && !iframeReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-950 text-white">
                <AlertCircle className="w-10 h-10 text-amber-400" />
                <div className="text-center px-6">
                  <p className="font-semibold mb-1">Can't preview this link</p>
                  <p className="text-sm text-white/60 mb-4">This page doesn't allow embedding.</p>
                  <button
                    onClick={openHere}
                    className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold transition-colors"
                  >
                    Open in this tab
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
