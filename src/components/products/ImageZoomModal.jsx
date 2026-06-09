import React, { useEffect, useState, useRef } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { handleProductImageError } from "@/lib/utils";

export default function ImageZoomModal({ images, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const imgRef = useRef(null);

  // Touch pinch zoom state
  const lastDist = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index]);

  const resetZoom = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  const goNext = () => { setIndex((i) => (i + 1) % images.length); resetZoom(); };
  const goPrev = () => { setIndex((i) => (i - 1 + images.length) % images.length); resetZoom(); };

  // Mouse drag (panned when zoomed)
  const onMouseDown = (e) => {
    if (scale <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragStart.current) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const onMouseUp = () => { setDragging(false); dragStart.current = null; };

  // Touch pinch to zoom
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  };
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && lastDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / lastDist.current;
      setScale((s) => Math.min(5, Math.max(1, s * ratio)));
      lastDist.current = dist;
      e.preventDefault();
    }
  };
  const onTouchEnd = () => { lastDist.current = null; };

  const zoomIn = () => setScale((s) => Math.min(5, s + 0.5));
  const zoomOut = () => { setScale((s) => { const ns = Math.max(1, s - 0.5); if (ns === 1) setOffset({ x: 0, y: 0 }); return ns; }); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-black/95"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <span className="text-white/60 text-sm font-mono">{index + 1} / {images.length}</span>
          <div className="flex items-center gap-2">
            <button onClick={zoomOut} disabled={scale <= 1}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-white/60 text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} disabled={scale >= 5}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors ml-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image area */}
        <div
          className="flex-1 relative overflow-hidden flex items-center justify-center"
          style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={(e) => { if (scale === 1 && !dragging) zoomIn(); }}
        >
          <img
            key={index}
            ref={imgRef}
            src={images[index]}
            alt=""
            draggable={false}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-150"
            style={{
              transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            }}
            onError={handleProductImageError}
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 border border-white/20 transition-all">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 border border-white/20 transition-all">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto justify-center border-t border-white/10 flex-shrink-0">
            {images.map((img, i) => (
              <button key={i} onClick={() => { setIndex(i); resetZoom(); }}
                className={`w-14 h-14 rounded-md border-2 overflow-hidden flex-shrink-0 transition-all ${i === index ? "border-white" : "border-white/20 opacity-50 hover:opacity-80"}`}>
                <img src={img} alt="" className="w-full h-full object-contain bg-black" onError={handleProductImageError} />
              </button>
            ))}
          </div>
        )}

        {/* Hint */}
        {scale === 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono pointer-events-none">
            Click or pinch to zoom
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}