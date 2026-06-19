import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { floodFill, hexToRgba } from "../lib/floodFill";

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 750;
const MAX_HISTORY = 20;
const SHAPE_TOOLS = ["line", "rect", "circle"];

const Canvas = forwardRef(function Canvas({ tool, color, brushSize, opacity, onHistoryChange }, ref) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef(null);
  const snapshotRef = useRef(null);

  // Latest tool/color/brush settings, kept in refs so pointer handlers
  // (registered once) always see current values.
  const settingsRef = useRef({ tool, color, brushSize, opacity });
  useEffect(() => {
    settingsRef.current = { tool, color, brushSize, opacity };
  }, [tool, color, brushSize, opacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;
    pushHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function notifyHistory() {
    onHistoryChange?.({
      canUndo: historyIndexRef.current > 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
    });
  }

  function pushHistory() {
    const ctx = ctxRef.current;
    const snapshot = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    let stack = historyRef.current.slice(0, historyIndexRef.current + 1);
    stack.push(snapshot);
    if (stack.length > MAX_HISTORY) stack = stack.slice(stack.length - MAX_HISTORY);
    historyRef.current = stack;
    historyIndexRef.current = stack.length - 1;
    notifyHistory();
  }

  function restore(index) {
    const ctx = ctxRef.current;
    const snapshot = historyRef.current[index];
    if (!snapshot) return;
    ctx.putImageData(snapshot, 0, 0);
    historyIndexRef.current = index;
    notifyHistory();
  }

  function configureContext() {
    const ctx = ctxRef.current;
    const { tool, color, brushSize, opacity } = settingsRef.current;
    ctx.lineWidth = brushSize;
    if (tool === "eraser") {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function drawShapePreview(start, end) {
    const ctx = ctxRef.current;
    const { tool } = settingsRef.current;
    ctx.beginPath();
    if (tool === "line") {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (tool === "rect") {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (tool === "circle") {
      const radius = Math.hypot(end.x - start.x, end.y - start.y);
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function handlePointerDown(e) {
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    const ctx = ctxRef.current;
    const { tool, color, brushSize } = settingsRef.current;
    isDrawingRef.current = true;
    startPointRef.current = pos;

    if (tool === "brush" || tool === "eraser") {
      configureContext();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === "fill") {
      const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      floodFill(imageData, Math.floor(pos.x), Math.floor(pos.y), hexToRgba(color));
      ctx.putImageData(imageData, 0, 0);
      isDrawingRef.current = false;
      pushHistory();
    } else if (SHAPE_TOOLS.includes(tool)) {
      snapshotRef.current = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  function handlePointerMove(e) {
    if (!isDrawingRef.current) return;
    const pos = getPos(e);
    const ctx = ctxRef.current;
    const { tool } = settingsRef.current;

    if (tool === "brush" || tool === "eraser") {
      configureContext();
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (SHAPE_TOOLS.includes(tool) && snapshotRef.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      configureContext();
      drawShapePreview(startPointRef.current, pos);
    }
  }

  function handlePointerUp() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const ctx = ctxRef.current;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    snapshotRef.current = null;
    pushHistory();
  }

  useImperativeHandle(ref, () => ({
    undo() {
      if (historyIndexRef.current > 0) restore(historyIndexRef.current - 1);
    },
    redo() {
      if (historyIndexRef.current < historyRef.current.length - 1) restore(historyIndexRef.current + 1);
    },
    clear() {
      const ctx = ctxRef.current;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      pushHistory();
    },
    loadImage(dataUrl) {
      const img = new Image();
      img.onload = () => {
        const ctx = ctxRef.current;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        pushHistory();
      };
      img.src = dataUrl;
    },
    download(filename = "my-artwork.png") {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    },
    getDataUrl() {
      return canvasRef.current.toDataURL("image/png");
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="block h-auto max-w-full touch-none rounded-2xl border border-white/10 bg-white shadow-card"
      style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`, cursor: "crosshair" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
});

export default Canvas;
