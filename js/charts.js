/* ============================================================
   Lean Gain — tiny dependency-free canvas chart renderer
   Draws a simple line chart (weight trend) or bar chart (water)
   onto a given <canvas> element. Reads CSS variables for theme
   colors so it adapts to light/dark mode automatically.
   ============================================================ */

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function setupCanvasForDPR(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(rect.width, 280);
  const height = Math.max(rect.height, 180);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

function drawEmptyState(canvas, message) {
  const { ctx, width, height } = setupCanvasForDPR(canvas);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = getCSSVar("--text-muted") || "#888";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, width / 2, height / 2);
}

function drawLineChart(canvas, points, opts = {}) {
  if (!points || points.length === 0) {
    drawEmptyState(canvas, opts.emptyMessage || "No data yet");
    return;
  }

  const { ctx, width, height } = setupCanvasForDPR(canvas);
  ctx.clearRect(0, 0, width, height);

  const pad = { top: 20, right: 16, bottom: 28, left: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const values = points.map(p => p.y);
  let minY = Math.min(...values);
  let maxY = Math.max(...values);
  if (minY === maxY) { minY -= 1; maxY += 1; }
  const yRange = maxY - minY;

  const gridColor = getCSSVar("--border") || "#ddd";
  const textColor = getCSSVar("--text-muted") || "#888";
  const lineColor = opts.color || getCSSVar("--accent") || "#4f7cff";

  // gridlines + y labels
  ctx.strokeStyle = gridColor;
  ctx.fillStyle = textColor;
  ctx.font = "11px sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const y = pad.top + (plotH / steps) * i;
    const val = maxY - (yRange / steps) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillText(val.toFixed(1), pad.left - 6, y);
  }

  // x-axis labels (first, middle, last)
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const labelIdxs = points.length === 1 ? [0] : [0, Math.floor((points.length - 1) / 2), points.length - 1];
  labelIdxs.forEach(idx => {
    const x = pad.left + (points.length === 1 ? plotW / 2 : (plotW / (points.length - 1)) * idx);
    ctx.fillText(points[idx].label || "", x, pad.top + plotH + 8);
  });

  // line path
  const coords = points.map((p, i) => {
    const x = pad.left + (points.length === 1 ? plotW / 2 : (plotW / (points.length - 1)) * i);
    const y = pad.top + plotH - ((p.y - minY) / yRange) * plotH;
    return { x, y };
  });

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  coords.forEach((c, i) => {
    if (i === 0) ctx.moveTo(c.x, c.y);
    else ctx.lineTo(c.x, c.y);
  });
  ctx.stroke();

  // points
  ctx.fillStyle = lineColor;
  coords.forEach(c => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBarChart(canvas, points, opts = {}) {
  if (!points || points.length === 0) {
    drawEmptyState(canvas, opts.emptyMessage || "No data yet");
    return;
  }

  const { ctx, width, height } = setupCanvasForDPR(canvas);
  ctx.clearRect(0, 0, width, height);

  const pad = { top: 20, right: 16, bottom: 28, left: 34 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const target = opts.target || Math.max(...points.map(p => p.y), 1);
  const maxY = Math.max(target, ...points.map(p => p.y)) * 1.1;

  const gridColor = getCSSVar("--border") || "#ddd";
  const textColor = getCSSVar("--text-muted") || "#888";
  const barColor = opts.color || getCSSVar("--accent") || "#4f7cff";
  const targetColor = getCSSVar("--warn") || "#e0a030";

  // target line
  if (opts.target) {
    const ty = pad.top + plotH - (opts.target / maxY) * plotH;
    ctx.strokeStyle = targetColor;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, ty);
    ctx.lineTo(pad.left + plotW, ty);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const barSlot = plotW / points.length;
  const barWidth = Math.min(barSlot * 0.6, 32);

  ctx.textAlign = "center";
  ctx.fillStyle = textColor;
  ctx.font = "10px sans-serif";

  points.forEach((p, i) => {
    const cx = pad.left + barSlot * i + barSlot / 2;
    const barH = (p.y / maxY) * plotH;
    const y = pad.top + plotH - barH;
    ctx.fillStyle = barColor;
    ctx.fillRect(cx - barWidth / 2, y, barWidth, barH);
    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";
    ctx.fillText(p.label || "", cx, pad.top + plotH + 8);
  });
}
