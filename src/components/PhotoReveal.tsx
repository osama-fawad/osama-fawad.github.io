'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  /** Diameter of the face/photo region in CSS pixels. */
  photoSize?: number;
  alt?: string;
  /** Sampling grid step in internal pixels (after DPR). Smaller = denser. */
  gridStep?: number;
  /** Dot size in internal pixels. Keep < gridStep for a visible point-cloud gap. */
  dotSize?: number;
  imgStyle?: React.CSSProperties;
  /** Legacy prop — prefer `photoSize`. */
  diameter?: number;
}

/**
 * "Structured-Light Reconstruction" portrait.
 *
 * Two stereo cameras sweep laser rays at the subject from upper-left and
 * upper-right. A point only materialises once BOTH cameras' sweeps have
 * reached it (real stereo triangulation). The newly-born point is pure accent
 * green and fades into its RGB colour over ~900 ms.
 *
 * After the sweep the point cloud is held for ~2 s, then gradually dissolves
 * into the solid photograph over ~3 s. When the cursor is inside the photo,
 * the canvas lights up again at a subtle (slightly-sparse) opacity; leaving
 * the photo starts a ~4 s graceful densify back to the solid image.
 *
 * The ambient periodic re-scan wave pixelates a rolling horizontal strip
 * while leaving everything outside it solid — a live depth-refresh metaphor.
 *
 * The photo is clipped to a circular frame. Cameras and the caption float
 * outside the frame like a real stereo rig. A replay control sits below.
 *
 * Respects `prefers-reduced-motion` and falls back to the static photo.
 */
export default function PhotoReveal({
  src,
  photoSize,
  alt = 'Portrait',
  gridStep,
  dotSize,
  imgStyle,
  diameter,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [pointCount, setPointCount] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  const PHOTO = photoSize ?? diameter ?? 372;

  /* Outer container leaves room for: cameras + caption above the circle, and
     HUD telemetry below. */
  const TOP_GUTTER = 52;   // caption + cameras
  const BOTTOM_GUTTER = 34; // HUD strip
  const SIDE_GUTTER = 24;   // room for cameras to the left / right of the clip
  const OUTER_W = PHOTO + SIDE_GUTTER * 2;
  const OUTER_H = PHOTO + TOP_GUTTER + BOTTOM_GUTTER;

  const CLIP_X = SIDE_GUTTER;
  const CLIP_Y = TOP_GUTTER;

  /* Camera HTML positions (outer coords, CSS). */
  const CAM_W = 28;
  const CAM_A_OUTER = { x: SIDE_GUTTER - 10, y: 22 };
  const CAM_B_OUTER = { x: OUTER_W - SIDE_GUTTER + 10 - CAM_W, y: 22 };

  /* Scanner ring geometry (for the slight-glow ring in front of the photo). */
  const RING_SIZE = PHOTO + 36;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (prefersReduced) {
      setDisabled(true);
      return;
    }

    const isMobile = window.innerWidth < 640;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    /* Slightly-sparse point cloud:
       - DOT < GRID_STEP ensures visible black gaps between dots (not a
         low-resolution pixel mosaic).
       - With DPR=2 this renders as 1.5 CSS-px dots on a 3 CSS-px grid → a
         clear pointillist look while still very dense. */
    const GRID_STEP = gridStep ?? (isMobile ? 7 : 6);
    const DOT = dotSize ?? (isMobile ? 4 : 3);

    const INTERNAL = PHOTO * DPR;

    const canvas = canvasRef.current;
    const rayCanvas = rayCanvasRef.current;
    if (!canvas || !rayCanvas) return;
    canvas.width = INTERNAL;
    canvas.height = INTERNAL;
    canvas.style.width = `${PHOTO}px`;
    canvas.style.height = `${PHOTO}px`;

    const RAY_W_INT = OUTER_W * DPR;
    const RAY_H_INT = OUTER_H * DPR;
    rayCanvas.width = RAY_W_INT;
    rayCanvas.height = RAY_H_INT;
    rayCanvas.style.width = `${OUTER_W}px`;
    rayCanvas.style.height = `${OUTER_H}px`;

    const ctx = canvas.getContext('2d', { alpha: true });
    const rayCtx = rayCanvas.getContext('2d', { alpha: true });
    if (!ctx || !rayCtx) return;

    /* Laser origins in full-widget space (same coords as CameraBadge HTML). */
    const rayCamAx = (CAM_A_OUTER.x + CAM_W / 2) * DPR;
    const rayCamAy = (CAM_A_OUTER.y + 10) * DPR;
    const rayCamBx = (CAM_B_OUTER.x + CAM_W / 2) * DPR;
    const rayCamBy = (CAM_B_OUTER.y + 10) * DPR;
    const RAY_LEN = Math.hypot(RAY_W_INT, RAY_H_INT) * 1.35;

    /* Face circle in ray-canvas space — lasers stop at the far edge (exit). */
    const FACE_CX_RAY = (CLIP_X + PHOTO / 2) * DPR;
    const FACE_CY_RAY = (CLIP_Y + PHOTO / 2) * DPR;
    const FACE_R_RAY = (PHOTO / 2) * DPR;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    let raf = 0;
    let cancelled = false;
    const cleanupHandlers: Array<() => void> = [];

    img.onload = () => {
      if (cancelled) return;

      const off = document.createElement('canvas');
      off.width = INTERNAL;
      off.height = INTERNAL;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return;

      octx.filter = 'brightness(1.05) contrast(1.06) saturate(0.92)';
      octx.save();
      const fx = INTERNAL / 2;
      const fy = INTERNAL / 2;
      octx.translate(fx, fy);
      octx.scale(1.06, 1.06);
      octx.translate(-fx, -fy + INTERNAL * 0.07);

      const ratio = img.width / img.height;
      let dw = INTERNAL;
      let dh = INTERNAL;
      if (ratio > 1) dh = INTERNAL / ratio;
      else dw = INTERNAL * ratio;
      octx.drawImage(img, (INTERNAL - dw) / 2, (INTERNAL - dh) / 2, dw, dh);
      octx.restore();
      octx.filter = 'none';

      const pixels = octx.getImageData(0, 0, INTERNAL, INTERNAL).data;

      const cen = INTERNAL / 2;
      const faceRadius = INTERNAL / 2 - DPR * 2;

      /* Camera positions in *canvas internal* coords.
         HTML coords are in the outer container, which is SIDE_GUTTER pixels
         to the left of the canvas and TOP_GUTTER pixels above it. */
      const camAx = (CAM_A_OUTER.x + CAM_W / 2 - CLIP_X) * DPR;
      const camAy = (CAM_A_OUTER.y + 10 - CLIP_Y) * DPR; // lens ~ y=10 inside SVG
      const camBx = (CAM_B_OUTER.x + CAM_W / 2 - CLIP_X) * DPR;
      const camBy = (CAM_B_OUTER.y + 10 - CLIP_Y) * DPR;

      const cols = Math.floor(INTERNAL / GRID_STEP);
      const rows = Math.floor(INTERNAL / GRID_STEP);
      const maxN = cols * rows;

      const tx = new Float32Array(maxN);
      const ty = new Float32Array(maxN);
      const z = new Float32Array(maxN);
      const r = new Uint8ClampedArray(maxN);
      const g = new Uint8ClampedArray(maxN);
      const b = new Uint8ClampedArray(maxN);
      const phase = new Float32Array(maxN);
      const activated = new Uint8Array(maxN);
      const tAct = new Float32Array(maxN);
      const actThresh = new Float32Array(maxN);

      let minAngA = Infinity;
      let maxAngA = -Infinity;
      let minAngB = Infinity;
      let maxAngB = -Infinity;
      const angA = new Float32Array(maxN);
      const angB = new Float32Array(maxN);

      let n = 0;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const px = i * GRID_STEP + GRID_STEP / 2;
          const py = j * GRID_STEP + GRID_STEP / 2;

          const dxp = px - cen;
          const dyp = py - cen;
          if (dxp * dxp + dyp * dyp > faceRadius * faceRadius) continue;

          const idx = (Math.floor(py) * INTERNAL + Math.floor(px)) * 4;
          const pa = pixels[idx + 3];
          if (pa < 24) continue;

          const pr = pixels[idx];
          const pg = pixels[idx + 1];
          const pb = pixels[idx + 2];

          tx[n] = px;
          ty[n] = py;
          r[n] = pr;
          g[n] = pg;
          b[n] = pb;
          z[n] = (0.2126 * pr + 0.7152 * pg + 0.0722 * pb) / 255;
          phase[n] = Math.random() * Math.PI * 2;

          const aA = Math.atan2(py - camAy, px - camAx);
          const aB = Math.atan2(py - camBy, px - camBx);
          angA[n] = aA;
          angB[n] = aB;
          if (aA < minAngA) minAngA = aA;
          if (aA > maxAngA) maxAngA = aA;
          if (aB < minAngB) minAngB = aB;
          if (aB > maxAngB) maxAngB = aB;

          n++;
        }
      }

      const rangeA = maxAngA - minAngA || 1;
      const rangeB = maxAngB - minAngB || 1;
      for (let k = 0; k < n; k++) {
        const pA = (angA[k] - minAngA) / rangeA;
        const pB = 1 - (angB[k] - minAngB) / rangeB;
        /* Stereo triangulation — point only appears once BOTH rays have
           reached it. */
        actThresh[k] = Math.max(pA, pB);
      }

      setPointCount(n);

      /* ── Timing (all ~20 % shorter than before) ─────────────── */
      const SCAN_MS = 2240;
      const POST_SCAN_HOLD_MS = 650;
      const POST_SCAN_FADE_MS = 950;
      const HOVER_IN = 0.17;
      const HOVER_OUT = 0.0125;
      /* Full point-cloud mode on hover — the underlying <img> fades out in
         tandem, so the cursor interaction reads as a true point cloud on
         black, clearly distinct from the final solid photo. */
      const HOVER_MAX = 1.0;

      const frame = ctx.createImageData(INTERNAL, INTERNAL);
      const buf = frame.data;

      let mx = 0;
      let my = 0;
      let tmx = 0;
      let tmy = 0;
      let hovering = false;
      let hoverF = 0;
      let postScanF = 1;
      let scanCompleteFired = false;
      let scanCompleteAt = 0;

      const onMove = (e: MouseEvent) => {
        if (!hovering) return;
        const rect = canvas.getBoundingClientRect();
        tmx = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 2;
        tmy = ((e.clientY - rect.top - rect.height / 2) / rect.height) * 2;
      };
      const onEnter = () => {
        hovering = true;
      };
      const onLeave = () => {
        hovering = false;
        tmx = 0;
        tmy = 0;
      };
      canvas.addEventListener('mousemove', onMove, { passive: true });
      canvas.addEventListener('mouseenter', onEnter);
      canvas.addEventListener('mouseleave', onLeave);
      cleanupHandlers.push(() => {
        canvas.removeEventListener('mousemove', onMove);
        canvas.removeEventListener('mouseenter', onEnter);
        canvas.removeEventListener('mouseleave', onLeave);
      });

      const t0 = performance.now();
      let nextWaveAt = 7500 + Math.random() * 4000;
      let waveT0 = -1;

      const DOT_HALF = Math.floor(DOT / 2);

      const writePixel = (
        px: number,
        py: number,
        rr: number,
        gg: number,
        bb: number,
        aa: number
      ) => {
        for (let dy = -DOT_HALF; dy < DOT - DOT_HALF; dy++) {
          const yy = py + dy;
          if (yy < 0 || yy >= INTERNAL) continue;
          const row = yy * INTERNAL * 4;
          for (let dx = -DOT_HALF; dx < DOT - DOT_HALF; dx++) {
            const xx = px + dx;
            if (xx < 0 || xx >= INTERNAL) continue;
            const p = row + xx * 4;
            if (aa > buf[p + 3]) {
              buf[p] = rr;
              buf[p + 1] = gg;
              buf[p + 2] = bb;
              buf[p + 3] = aa;
            }
          }
        }
      };

      setReady(true);

      const GREEN_R = 0;
      const GREEN_G = 255;
      const GREEN_B = 153;

      const loop = (now: number) => {
        const t = now - t0;

        mx += (tmx - mx) * 0.06;
        my += (tmy - my) * 0.06;
        const hoverEase = hovering ? HOVER_IN : HOVER_OUT;
        const hoverTarget = hovering ? HOVER_MAX : 0;
        hoverF += (hoverTarget - hoverF) * hoverEase;

        buf.fill(0);

        const rawP = Math.min(Math.max(t / SCAN_MS, 0), 1);
        const scanP = rawP * rawP * (3 - 2 * rawP);
        const alphaA = minAngA + (maxAngA - minAngA) * scanP;
        const alphaB = maxAngB + (minAngB - maxAngB) * scanP;

        if (!scanCompleteFired && scanP >= 1) {
          scanCompleteFired = true;
          scanCompleteAt = t;
          setScanComplete(true);
        }

        if (scanCompleteFired) {
          const since = t - scanCompleteAt;
          if (since < POST_SCAN_HOLD_MS) postScanF = 1;
          else
            postScanF = Math.max(
              0,
              1 - (since - POST_SCAN_HOLD_MS) / POST_SCAN_FADE_MS
            );
        }

        /* Inversely fade the underlying <img> so that during the point-cloud
           phases (scan, hover) the background is BLACK — making the dots read
           as a true point cloud. As postScan/hover fade away the solid photo
           crossfades back in. */
        if (imgRef.current) {
          const canvasVis = Math.max(postScanF, hoverF);
          imgRef.current.style.opacity = String(Math.max(0, 1 - canvasVis));
        }

        // Ambient re-scan wave
        if (
          waveT0 < 0 &&
          t > SCAN_MS + POST_SCAN_HOLD_MS + POST_SCAN_FADE_MS + 1000 &&
          t > nextWaveAt
        )
          waveT0 = t;
        if (waveT0 > 0 && t - waveT0 > 2000) {
          waveT0 = -1;
          nextWaveAt = t + 9000 + Math.random() * 5000;
        }
        const waveP = waveT0 > 0 ? (t - waveT0) / 2000 : -1;
        const waveY = waveP >= 0 ? waveP * INTERNAL : -9999;
        const waveEnv = waveP >= 0 ? Math.sin(waveP * Math.PI) : 0;
        const waveR = INTERNAL * 0.11;

        const parStrength = INTERNAL * 0.02;

        for (let k = 0; k < n; k++) {
          if (!activated[k]) {
            if (scanP >= actThresh[k]) {
              activated[k] = 1;
              tAct[k] = t;
            } else {
              continue;
            }
          }

          const dtA = t - tAct[k];

          const dep = z[k];
          const parX = mx * parStrength * dep * hoverF;
          const parY = my * parStrength * dep * hoverF;

          const shimmer = Math.min(1, Math.max(0, (dtA - 700) / 800));
          const drift = 0.35 * shimmer;
          const dxd = Math.sin(t * 0.00055 + phase[k]) * drift;
          const dyd = Math.cos(t * 0.0005 + phase[k] * 1.3) * drift;

          const rx = (tx[k] + dxd + parX) | 0;
          const ry = (ty[k] + dyd + parY) | 0;

          let waveF = 0;
          if (waveP >= 0) {
            const d = Math.abs(ry - waveY);
            if (d < waveR) waveF = (1 - d / waveR) * waveEnv * 0.9;
          }

          const visible = Math.max(postScanF, hoverF, waveF);
          if (visible < 0.015) continue;

          const fadeIn = Math.min(1, dtA / 150);
          let alpha = visible * 255 * fadeIn;

          const gf = Math.min(1, dtA / 900);
          const gfE = 1 - Math.pow(1 - gf, 3);
          const gw = 1 - gfE;
          let pr = (r[k] * (1 - gw) + GREEN_R * gw) | 0;
          let pg = (g[k] * (1 - gw) + GREEN_G * gw) | 0;
          let pb = (b[k] * (1 - gw) + GREEN_B * gw) | 0;

          const flash = Math.max(0, 1 - dtA / 120);
          if (flash > 0) alpha = Math.min(255, alpha + 60 * flash);

          writePixel(rx, ry, pr, pg, pb, alpha);
        }

        ctx.putImageData(frame, 0, 0);

        /* Full-widget laser sweep — unclipped so beams run from each camera
           across the entire layout (not cut off by the circular photo mask). */
        rayCtx.clearRect(0, 0, RAY_W_INT, RAY_H_INT);
        if (scanP < 1) {
          const rayFade = scanP < 0.9 ? 1 : 1 - (scanP - 0.9) / 0.1;
          const clip = { cx: FACE_CX_RAY, cy: FACE_CY_RAY, r: FACE_R_RAY };
          drawRay(rayCtx, rayCamAx, rayCamAy, alphaA, RAY_LEN, DPR, rayFade, clip);
          drawRay(rayCtx, rayCamBx, rayCamBy, alphaB, RAY_LEN, DPR, rayFade, clip);
        }

        if (waveP >= 0) {
          const a = waveEnv * 0.25;
          const grad = ctx.createLinearGradient(0, waveY - 24 * DPR, 0, waveY + 24 * DPR);
          grad.addColorStop(0, 'rgba(0,255,153,0)');
          grad.addColorStop(0.5, `rgba(0,255,153,${a})`);
          grad.addColorStop(1, 'rgba(0,255,153,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, waveY - 24 * DPR, INTERNAL, 48 * DPR);
        }

        raf = requestAnimationFrame(loop);
      };

      raf = requestAnimationFrame(loop);
    };

    img.onerror = () => setDisabled(true);
    img.src = src;

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      cleanupHandlers.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, PHOTO, gridStep, dotSize]);

  if (disabled) {
    return (
      <div
        className="relative"
        style={{ width: PHOTO, height: PHOTO, borderRadius: '50%', overflow: 'hidden' }}
      >
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-contain"
          style={imgStyle}
        />
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{ width: OUTER_W, height: OUTER_H }}
      aria-label={alt}
      role="img"
    >
      {/* Laser sweep only — full outer size, below the circular clip so beams
          extend from the camera icons through the whole widget */}
      <canvas
        ref={rayCanvasRef}
        aria-hidden
        className="absolute left-0 top-0 pointer-events-none"
        style={{ width: OUTER_W, height: OUTER_H, zIndex: 1 }}
      />

      {/* Clipped circular photo area — solid <img> under the animated canvas */}
      <div
        className="absolute"
        style={{
          left: CLIP_X,
          top: CLIP_Y,
          width: PHOTO,
          height: PHOTO,
          borderRadius: '50%',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{
            objectFit: 'contain',
            ...imgStyle,
            // Opacity is driven by the render loop (see useEffect). Starts at
            // 0 so the scan begins on a pure black canvas — the photo fades
            // in only as the point cloud dissolves.
            opacity: 0,
          }}
        />
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

      {/* Scanner ring — in FRONT of the photo, with a slight glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: CLIP_X - (RING_SIZE - PHOTO) / 2,
          top: CLIP_Y - (RING_SIZE - PHOTO) / 2,
          width: RING_SIZE,
          height: RING_SIZE,
          zIndex: 3,
        }}
      >
        <ScannerRingInline size={RING_SIZE} faceDiameter={PHOTO} />
      </div>

      {/* Cameras + caption (fades out ~1 s after scan completes) */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          opacity: scanComplete ? 0 : 1,
          transition: 'opacity 0.7s ease',
          transitionDelay: scanComplete ? '1000ms' : '0ms',
        }}
      >
        <CameraBadge
          left={CAM_A_OUTER.x}
          top={CAM_A_OUTER.y}
          label="CAM 1"
          align="left"
        />
        <CameraBadge
          left={CAM_B_OUTER.x}
          top={CAM_B_OUTER.y}
          label="CAM 2"
          align="right"
        />

        <div
          className="absolute font-mono text-[10px] tracking-[0.22em] uppercase select-none"
          style={{
            left: '50%',
            top: 4,
            transform: 'translateX(-50%)',
            color: 'rgba(0,255,153,0.82)',
            textShadow: '0 0 8px rgba(0,255,153,0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          Stereo Cameras · 3D Reconstruction
        </div>
      </div>

      {/* Corner L-brackets — viewfinder framing the whole sensor unit */}
      <svg
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        width={OUTER_W}
        height={OUTER_H}
        style={{
          zIndex: 4,
          filter: 'drop-shadow(0 0 4px rgba(0,255,153,0.35))',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
      >
        {(() => {
          const L = 16;
          const pad = 1;
          const s = 'rgba(0,255,153,0.6)';
          const sw = 1.2;
          return (
            <g fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round">
              {/* Top-left */}
              <path d={`M ${pad} ${pad + L} L ${pad} ${pad} L ${pad + L} ${pad}`} />
              {/* Top-right */}
              <path
                d={`M ${OUTER_W - pad - L} ${pad} L ${OUTER_W - pad} ${pad} L ${OUTER_W - pad} ${pad + L}`}
              />
              {/* Bottom-left */}
              <path
                d={`M ${pad} ${OUTER_H - pad - L} L ${pad} ${OUTER_H - pad} L ${pad + L} ${OUTER_H - pad}`}
              />
              {/* Bottom-right */}
              <path
                d={`M ${OUTER_W - pad - L} ${OUTER_H - pad} L ${OUTER_W - pad} ${OUTER_H - pad} L ${OUTER_W - pad} ${OUTER_H - pad - L}`}
              />
            </g>
          );
        })()}
      </svg>

      {/* HUD telemetry — below the photo */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          zIndex: 4,
          left: 0,
          right: 0,
          top: CLIP_Y + PHOTO + 10,
          display: 'flex',
          justifyContent: 'space-between',
          padding: `0 ${SIDE_GUTTER + 4}px`,
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
      >
        <span
          className="font-mono text-[9px] tracking-[0.14em] uppercase select-none"
          style={{ color: 'rgba(0,255,153,0.6)', textShadow: '0 0 6px rgba(0,255,153,0.25)' }}
        >
          {scanComplete ? (
            <>POINT_CLOUD · N={pointCount.toLocaleString()}</>
          ) : (
            <>
              SCANNING
              <span style={{ animation: 'blink 1.2s step-end infinite', animationDelay: '0s' }}>.</span>
              <span style={{ animation: 'blink 1.2s step-end infinite', animationDelay: '0.3s' }}>.</span>
              <span style={{ animation: 'blink 1.2s step-end infinite', animationDelay: '0.6s' }}>.</span>
            </>
          )}
        </span>
        <span
          className="font-mono text-[9px] tracking-[0.14em] uppercase select-none"
          style={{ color: 'rgba(0,255,153,0.6)', textShadow: '0 0 6px rgba(0,255,153,0.25)' }}
        >
          {scanComplete ? 'DEPTH · RGB-D' : 'STRUCTURED_LIGHT'}
        </span>
      </div>
    </div>
  );
}

/* ── Inline scanner ring (ring in front, slight glow kept) ─────── */

function ScannerRingInline({ size, faceDiameter }: { size: number; faceDiameter: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const rFace = faceDiameter / 2;
  const rDash = rFace + 7;
  const rTickInner = rFace + 13;
  const rTickOuter = rFace + 19;
  const cardinals = [0, 90, 180, 270];

  return (
    <>
      {/* Soft warm halo — slight glow restored */}
      <div
        className="absolute"
        style={{
          left: (size - faceDiameter) / 2,
          top: (size - faceDiameter) / 2,
          width: faceDiameter,
          height: faceDiameter,
          borderRadius: '50%',
          boxShadow:
            '0 0 0 1px rgba(0,255,153,0.35), 0 0 18px 3px rgba(0,255,153,0.18), 0 0 48px 16px rgba(0,255,153,0.08)',
          animation: 'glowPulse 4s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        {/* Slowly rotating dashed outer track */}
        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: 'spin 32s linear infinite',
          }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={rDash}
            fill="none"
            stroke="rgba(0,255,153,0.25)"
            strokeWidth={0.9}
            strokeDasharray="2.5 8"
          />
        </g>

        {cardinals.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * rTickInner;
          const y1 = cy + Math.sin(rad) * rTickInner;
          const x2 = cx + Math.cos(rad) * rTickOuter;
          const y2 = cy + Math.sin(rad) * rTickOuter;
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(0,255,153,0.42)"
              strokeWidth={1}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </>
  );
}

/* ── Camera icon + label ──────────────────────────────────────── */

function CameraBadge({
  left,
  top,
  label,
  align,
}: {
  left: number;
  top: number;
  label: string;
  align: 'left' | 'right';
}) {
  return (
    <div className="absolute" style={{ left, top, width: 28, height: 20 }}>
      <svg
        width={28}
        height={20}
        viewBox="0 0 28 20"
        style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,153,0.35))' }}
      >
        <rect
          x={9}
          y={0.5}
          width={7}
          height={3}
          rx={0.6}
          fill="rgba(10,20,16,0.95)"
          stroke="rgba(0,255,153,0.85)"
          strokeWidth={0.9}
        />
        <rect
          x={1}
          y={4.5}
          width={26}
          height={14}
          rx={1.8}
          fill="rgba(10,20,16,0.92)"
          stroke="rgba(0,255,153,0.85)"
          strokeWidth={0.9}
        />
        <circle cx={14} cy={11.5} r={4.4} fill="none" stroke="rgba(0,255,153,0.75)" strokeWidth={0.9} />
        <circle cx={14} cy={11.5} r={2.6} fill="none" stroke="rgba(0,255,153,0.5)" strokeWidth={0.7} />
        <circle cx={14} cy={11.5} r={1.1} fill="rgba(180,255,220,1)" />
        <circle cx={23.5} cy={7.5} r={0.9} fill="rgba(255,90,90,1)">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.1s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div
        className="absolute font-mono text-[8px] tracking-[0.2em] uppercase select-none"
        style={{
          top: 22,
          [align]: 0,
          color: 'rgba(0,255,153,0.8)',
          textShadow: '0 0 4px rgba(0,255,153,0.35)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ── Canvas ray helper ───────────────────────────────────────── */

/** Distance along ray O + t·D (D unit) from O to where the ray exits the disk |P-C|≤r (far intersection, t>0). */
function rayDiskExitDistance(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  r: number
): number | null {
  const vx = ox - cx;
  const vy = oy - cy;
  const B = 2 * (vx * dx + vy * dy);
  const C = vx * vx + vy * vy - r * r;
  const disc = B * B - 4 * C;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  const t1 = (-B - s) / 2;
  const t2 = (-B + s) / 2;
  const ts = [t1, t2].filter((t) => t > 1e-4);
  if (ts.length === 0) return null;
  return Math.max(...ts);
}

function drawRay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  DPR: number,
  fade: number,
  clipCircle?: { cx: number; cy: number; r: number }
) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  let len = length;
  if (clipCircle) {
    const tExit = rayDiskExitDistance(x, y, c, s, clipCircle.cx, clipCircle.cy, clipCircle.r);
    if (tExit === null || tExit <= 0) return;
    len = Math.min(length, tExit);
  }
  const ex = x + c * len;
  const ey = y + s * len;

  ctx.save();
  const wide = ctx.createLinearGradient(x, y, ex, ey);
  wide.addColorStop(0, 'rgba(0,255,153,0)');
  wide.addColorStop(0.25, `rgba(0,255,153,${0.12 * fade})`);
  wide.addColorStop(1, 'rgba(0,255,153,0)');
  ctx.strokeStyle = wide;
  ctx.lineWidth = 10 * DPR;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  const core = ctx.createLinearGradient(x, y, ex, ey);
  core.addColorStop(0, `rgba(0,255,153,${0.9 * fade})`);
  core.addColorStop(0.6, `rgba(180,255,220,${0.95 * fade})`);
  core.addColorStop(1, 'rgba(0,255,153,0)');
  ctx.strokeStyle = core;
  ctx.lineWidth = 1.2 * DPR;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.restore();
}
