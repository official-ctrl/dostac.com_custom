"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* ─────────────────────────────────────────────
   GlobeCanvas — Sourcing Intelligence Edition
   - Razor-thin multi-color arcs (gold/amber/cyan/violet/blue/white)
   - City labels appear ONLY on arc arrival with sparkle animation
   - Enhanced 3D: specular highlight + limb darkening + cloud haze
   - Mouse tilt (±5°) + city hover detection
   - 24 cities across all continents with country metadata
───────────────────────────────────────────── */

export type CityRegion =
  | "east_asia" | "se_asia" | "south_asia" | "middle_east"
  | "europe"    | "americas_n" | "americas_s" | "africa" | "oceania";

export interface GlobeCity {
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
  readonly country?: string;
  readonly region?: CityRegion;
}

export interface HoverPayload {
  readonly city: GlobeCity;
  readonly screenX: number;
  readonly screenY: number;
}

export interface GlobeCanvasProps {
  readonly size?: number;
  readonly origin?: GlobeCity;
  readonly targets?: ReadonlyArray<GlobeCity>;
  readonly rotationSpeed?: number;
  readonly arcInterval?: number;
  readonly initialRotation?: number;
  readonly enableMouseTilt?: boolean;
  readonly onCityHover?: (payload: HoverPayload | null) => void;
  readonly className?: string;
  readonly children?: ReactNode;
}

const SEOUL: GlobeCity = {
  name: "Seoul",
  lat: 37.5665,
  lng: 126.978,
  country: "South Korea",
  region: "east_asia",
};

/* 24 cities across all continents — verified lat/lng */
const DEFAULT_TARGETS: ReadonlyArray<GlobeCity> = [
  /* East Asia */
  { name: "Tokyo",        lat: 35.6762, lng: 139.6503, country: "Japan",          region: "east_asia" },
  { name: "Shanghai",     lat: 31.2304, lng: 121.4737, country: "China",          region: "east_asia" },
  { name: "Hong Kong",    lat: 22.3193, lng: 114.1694, country: "Hong Kong SAR",  region: "east_asia" },
  /* SE Asia */
  { name: "Singapore",    lat:  1.3521, lng: 103.8198, country: "Singapore",      region: "se_asia" },
  { name: "Bangkok",      lat: 13.7563, lng: 100.5018, country: "Thailand",       region: "se_asia" },
  { name: "Jakarta",      lat: -6.2088, lng: 106.8456, country: "Indonesia",      region: "se_asia" },
  { name: "Manila",       lat: 14.5995, lng: 120.9842, country: "Philippines",    region: "se_asia" },
  /* South Asia */
  { name: "Mumbai",       lat: 19.0760, lng:  72.8777, country: "India",          region: "south_asia" },
  /* Middle East */
  { name: "Dubai",        lat: 25.2048, lng:  55.2708, country: "UAE",            region: "middle_east" },
  { name: "Riyadh",       lat: 24.7136, lng:  46.6753, country: "Saudi Arabia",   region: "middle_east" },
  { name: "Doha",         lat: 25.2854, lng:  51.5310, country: "Qatar",          region: "middle_east" },
  /* Europe */
  { name: "London",       lat: 51.5074, lng:  -0.1278, country: "United Kingdom", region: "europe" },
  { name: "Paris",        lat: 48.8566, lng:   2.3522, country: "France",         region: "europe" },
  { name: "Frankfurt",    lat: 50.1109, lng:   8.6821, country: "Germany",        region: "europe" },
  /* North America */
  { name: "New York",     lat: 40.7128, lng: -74.0060, country: "United States",  region: "americas_n" },
  { name: "Los Angeles",  lat: 34.0522, lng:-118.2437, country: "United States",  region: "americas_n" },
  { name: "Toronto",      lat: 43.6532, lng: -79.3832, country: "Canada",         region: "americas_n" },
  /* South America */
  { name: "São Paulo",    lat:-23.5505, lng: -46.6333, country: "Brazil",         region: "americas_s" },
  { name: "Buenos Aires", lat:-34.6037, lng: -58.3816, country: "Argentina",      region: "americas_s" },
  /* Africa */
  { name: "Cairo",        lat: 30.0444, lng:  31.2357, country: "Egypt",          region: "africa" },
  { name: "Lagos",        lat:  6.5244, lng:   3.3792, country: "Nigeria",        region: "africa" },
  { name: "Nairobi",      lat: -1.2921, lng:  36.8219, country: "Kenya",          region: "africa" },
  { name: "Johannesburg", lat:-26.2041, lng:  28.0473, country: "South Africa",   region: "africa" },
  /* Oceania */
  { name: "Sydney",       lat:-33.8688, lng: 151.2093, country: "Australia",      region: "oceania" },
];

/* Premium arc color palette — randomly assigned per route */
const ARC_PALETTE: ReadonlyArray<{ line: readonly [number, number, number]; glow: readonly [number, number, number] }> = [
  { line: [255, 220, 140], glow: [232, 180,  80] }, // gold
  { line: [255, 195, 110], glow: [232, 150,  60] }, // amber
  { line: [140, 220, 240], glow: [ 80, 180, 220] }, // cyan
  { line: [200, 170, 240], glow: [150, 110, 220] }, // violet
  { line: [150, 180, 255], glow: [ 90, 130, 230] }, // electric blue
  { line: [240, 245, 255], glow: [200, 220, 240] }, // soft white
];

/* Realistic intelligence events — shown on arc landing */
const ARC_EVENT_TYPES: ReadonlyArray<string> = [
  "NEW RFQ",
  "FACTORY MATCHED",
  "FORMULA APPROVED",
  "SAMPLE SHIPPED",
  "ORDER CONFIRMED",
  "SUPPLIER VERIFIED",
  "QUOTE SENT",
  "BATCH IN TRANSIT",
];

/* Continent polygons in (lng, lat) */
type Vertex = readonly [number, number];
type Polygon = ReadonlyArray<Vertex>;

const CONTINENTS: ReadonlyArray<Polygon> = [
  [[-168,55],[-160,60],[-141,65],[-130,68],[-115,70],[-100,72],[-85,73],[-70,72],[-60,60],[-58,50],[-65,45],[-75,42],[-80,32],[-83,28],[-95,26],[-105,28],[-115,32],[-122,38],[-125,48],[-132,52],[-145,55],[-160,55]],
  [[-50,60],[-25,62],[-15,72],[-22,80],[-45,82],[-60,80],[-58,72],[-55,64]],
  [[-100,18],[-92,15],[-83,9],[-77,8],[-78,15],[-90,17],[-100,18]],
  [[-80,12],[-70,12],[-55,5],[-45,0],[-35,-7],[-37,-22],[-50,-32],[-63,-42],[-72,-52],[-75,-50],[-72,-38],[-77,-20],[-82,-3],[-80,5]],
  [[-10,36],[5,36],[15,38],[20,40],[28,38],[35,40],[42,42],[50,44],[60,50],[60,58],[42,62],[28,65],[15,65],[5,60],[-5,55],[-10,48]],
  [[5,60],[10,64],[18,68],[28,70],[30,67],[22,62],[15,58],[10,58]],
  [[-10,50],[-2,50],[2,52],[1,58],[-5,58],[-10,55]],
  [[-17,15],[-15,28],[-10,33],[0,33],[12,32],[25,32],[33,31],[42,12],[51,12],[50,2],[47,-5],[40,-12],[35,-22],[28,-32],[20,-35],[15,-30],[10,-15],[8,-5],[0,5],[-10,8],[-17,15]],
  [[30,40],[45,40],[55,42],[60,48],[70,42],[80,42],[90,46],[100,42],[110,40],[120,42],[130,48],[140,55],[155,60],[165,65],[170,70],[170,78],[60,80],[35,75],[30,68],[28,55]],
  [[35,15],[45,12],[55,15],[58,22],[55,28],[42,30],[35,28],[35,15]],
  [[68,22],[72,10],[78,7],[82,7],[88,22],[80,26],[72,25]],
  [[95,22],[103,22],[108,15],[109,10],[105,8],[100,12],[95,18]],
  [[95,5],[105,5],[120,0],[135,-3],[140,-7],[130,-9],[115,-10],[105,-9],[98,-5],[95,5]],
  [[130,33],[134,34],[140,36],[142,42],[145,45],[141,44],[136,36],[131,34]],
  [[125,33],[127,34],[129,35],[130,38],[128,41],[125,39],[124,37]],
  [[114,-22],[125,-15],[135,-12],[143,-12],[150,-22],[152,-30],[147,-37],[140,-38],[125,-35],[115,-30],[114,-22]],
  [[170,-37],[176,-38],[178,-42],[173,-46],[167,-45],[170,-37]],
  [[44,-12],[50,-15],[50,-25],[44,-25],[44,-12]],
];

const SEG_PER_EDGE = 6;
const SUBDIVIDED: ReadonlyArray<ReadonlyArray<Vertex>> = CONTINENTS.map((poly) => {
  const out: Vertex[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]; const b = poly[(i + 1) % poly.length];
    if (!a || !b) continue;
    for (let s = 0; s < SEG_PER_EDGE; s++) {
      const t = s / SEG_PER_EDGE;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
});

interface Arc {
  to: GlobeCity;
  t0: number;
  dur: number;
  landed: boolean;
  paletteIdx: number;
  event: string;
}

interface Ripple {
  city: GlobeCity;
  t0: number;
  paletteIdx: number;
}

interface LabelState {
  city: GlobeCity;
  event: string;
  t0: number;
  paletteIdx: number;
}

const LABEL_DUR = 2800;       /* total visible window */
const HIGHLIGHT_DUR = 2400;   /* per-city dot boost window */

export function GlobeCanvas({
  size = 520,
  origin = SEOUL,
  targets = DEFAULT_TARGETS,
  rotationSpeed = 0.04,
  arcInterval = 720,
  initialRotation = -100,
  enableMouseTilt = true,
  onCityHover,
  className,
  children,
}: GlobeCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverCbRef = useRef(onCityHover);
  hoverCbRef.current = onCityHover;

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const W = size;
    const H = size;
    const cx = W / 2;
    const cy = H / 2;
    const R = size * 0.4;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(DPR, DPR);

    const targetsWithPhase = targets.map((c, i) => ({ ...c, phase: i * 0.4 }));

    /* State */
    let rotation = initialRotation;
    let currentTilt = 0;
    let targetTilt = 0;
    let rafId = 0;
    let running = true;
    let spawnTimer = 0;
    const arcs: Arc[] = [];
    const ripples: Ripple[] = [];
    const labels: LabelState[] = [];
    const cityHighlight = new Map<GlobeCity, { end: number; paletteIdx: number }>();

    /* Mouse state */
    const mouse: { x: number; y: number; inside: boolean } = { x: cx, y: cy, inside: false };
    let lastHoveredCity: GlobeCity | null = null;

    /* Verified projection: east = +x = right */
    const project = (lat: number, lng: number, rot: number) => {
      const phi = ((90 - lat) * Math.PI) / 180;
      const theta = ((lng + rot) * Math.PI) / 180;
      const sinPhi = Math.sin(phi);
      return {
        x: R * sinPhi * Math.sin(theta),
        y: -R * Math.cos(phi),
        z: R * sinPhi * Math.cos(theta),
      };
    };

    const spawnArc = () => {
      if (arcs.length > 6) return;
      const target = targets[Math.floor(Math.random() * targets.length)];
      if (!target) return;
      const event = ARC_EVENT_TYPES[Math.floor(Math.random() * ARC_EVENT_TYPES.length)] ?? "VERIFIED";
      arcs.push({
        to: target,
        t0: performance.now(),
        dur: 2900 + Math.random() * 700,
        landed: false,
        paletteIdx: Math.floor(Math.random() * ARC_PALETTE.length),
        event,
      });
    };

    /* Continent polygon with horizon clipping */
    const drawContinent = (poly: ReadonlyArray<Vertex>, effRot: number) => {
      const Z_T = -6;
      const sub: Array<Array<{ x: number; y: number }>> = [];
      let cur: Array<{ x: number; y: number }> = [];
      for (const v of poly) {
        const p = project(v[1], v[0], effRot);
        if (p.z < Z_T) {
          if (cur.length > 1) sub.push(cur);
          cur = [];
        } else {
          cur.push({ x: cx + p.x, y: cy + p.y });
        }
      }
      if (cur.length > 1) sub.push(cur);

      const totalFront = sub.reduce((s, a) => s + a.length, 0);
      const isFull = totalFront === poly.length && sub.length === 1;

      if (isFull) {
        const path = sub[0];
        if (!path || path.length < 3) return;
        ctx.beginPath();
        const f = path[0]; if (!f) return;
        ctx.moveTo(f.x, f.y);
        for (let i = 1; i < path.length; i++) {
          const p = path[i]; if (p) ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(232, 138, 70, 0.18)";
      ctx.lineWidth = 0.5;
      for (const path of sub) {
        if (path.length < 2) continue;
        ctx.beginPath();
        const f = path[0]; if (!f) continue;
        ctx.moveTo(f.x, f.y);
        for (let i = 1; i < path.length; i++) {
          const p = path[i]; if (p) ctx.lineTo(p.x, p.y);
        }
        if (isFull) ctx.closePath();
        ctx.stroke();
      }
    };

    /* Thin razor arc with dual-layer glow */
    const drawArc = (arc: Arc, now: number, effRot: number): boolean => {
      const age = (now - arc.t0) / arc.dur;
      if (age >= 1.4) return false;
      const palette = ARC_PALETTE[arc.paletteIdx] ?? ARC_PALETTE[0]!;
      const pa = project(origin.lat, origin.lng, effRot);
      const pb = project(arc.to.lat, arc.to.lng, effRot);
      const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2, mz = (pa.z + pb.z) / 2;
      const midLen = Math.sqrt(mx*mx + my*my + mz*mz) || 1;
      const chord = Math.sqrt((pa.x-pb.x)**2 + (pa.y-pb.y)**2 + (pa.z-pb.z)**2);
      const lift = Math.min(180, chord * 0.5 + 35);
      const k = (R + lift) / midLen;
      const cp = { x: mx * k, y: my * k, z: mz * k };

      const headT = Math.min(1, age * 0.95);
      const tailT = Math.max(0, age * 0.95 - 0.55);
      const fadeOut = age > 1 ? Math.max(0, 1 - (age - 1) / 0.4) : 1;

      const samples = 44;
      const pts: Array<{ x: number; y: number; z: number; u: number }> = [];
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const ix = (1-u)*(1-u)*pa.x + 2*(1-u)*u*cp.x + u*u*pb.x;
        const iy = (1-u)*(1-u)*pa.y + 2*(1-u)*u*cp.y + u*u*pb.y;
        const iz = (1-u)*(1-u)*pa.z + 2*(1-u)*u*cp.z + u*u*pb.z;
        pts.push({ x: cx + ix, y: cy + iy, z: iz, u });
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      /* Pass 1: soft atmospheric glow (thinner) */
      ctx.strokeStyle = `rgba(${palette.glow[0]}, ${palette.glow[1]}, ${palette.glow[2]}, ${0.28 * fadeOut})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      let drawing = false;
      for (const p of pts) {
        if (p.u > headT || p.u < tailT || p.z < -35) { drawing = false; continue; }
        if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
        else { ctx.lineTo(p.x, p.y); }
      }
      ctx.stroke();

      /* Pass 2: razor-thin inner line */
      ctx.strokeStyle = `rgba(${palette.line[0]}, ${palette.line[1]}, ${palette.line[2]}, ${0.88 * fadeOut})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      drawing = false;
      for (const p of pts) {
        if (p.u > headT || p.u < tailT || p.z < -35) { drawing = false; continue; }
        if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
        else { ctx.lineTo(p.x, p.y); }
      }
      ctx.stroke();

      /* Head node REMOVED — no front-of-line flame.
         The arc is now a pure intelligence trail. */

      /* Landing event — trigger ripple + sparkle label with event type */
      if (!arc.landed && age >= 0.95) {
        arc.landed = true;
        ripples.push({ city: arc.to, t0: now, paletteIdx: arc.paletteIdx });
        labels.push({ city: arc.to, event: arc.event, t0: now, paletteIdx: arc.paletteIdx });
        cityHighlight.set(arc.to, { end: now + HIGHLIGHT_DUR, paletteIdx: arc.paletteIdx });
      }
      return true;
    };

    /* Elegant telemetry ping — staggered concentric rings (no game-like explosion) */
    const drawRipple = (r: Ripple, now: number, effRot: number): boolean => {
      const age = (now - r.t0) / 2400;
      if (age >= 1) return false;
      const p = project(r.city.lat, r.city.lng, effRot);
      if (p.z < -20) return true;
      const palette = ARC_PALETTE[r.paletteIdx] ?? ARC_PALETTE[0]!;
      const sx = cx + p.x, sy = cy + p.y;

      /* 2 staggered rings — like sonar ping, not fireworks */
      for (let i = 0; i < 2; i++) {
        const ringAge = age - i * 0.22;
        if (ringAge <= 0 || ringAge >= 1) continue;
        const ease = 1 - (1 - ringAge) ** 2;
        const alpha = (1 - ringAge) * 0.42;
        const radius = 4 + ease * 18;
        ctx.strokeStyle = `rgba(${palette.line[0]}, ${palette.line[1]}, ${palette.line[2]}, ${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2); ctx.stroke();
      }
      return true;
    };

    /* On-arrival label — elegant fade-in + gentle rise (NO explosion particles) */
    const drawLabel = (lbl: LabelState, now: number, effRot: number): boolean => {
      const age = (now - lbl.t0) / LABEL_DUR;
      if (age >= 1) return false;
      const p = project(lbl.city.lat, lbl.city.lng, effRot);
      if (p.z < -5) return true;
      const palette = ARC_PALETTE[lbl.paletteIdx] ?? ARC_PALETTE[0]!;
      const sx = cx + p.x, sy = cy + p.y;

      /* 3-phase: smooth fade-in → hold → fade-out (no bounce) */
      let alpha = 0;
      let rise = 0; /* vertical rise during fade-in for subtle motion */
      if (age < 0.18) {
        const t = age / 0.18;
        const eased = 1 - (1 - t) ** 3; /* ease-out cubic */
        alpha = eased;
        rise = (1 - eased) * 6; /* starts 6px below, rises to position */
      } else if (age < 0.72) {
        alpha = 1;
        rise = 0;
      } else {
        alpha = (1 - age) / 0.28;
        rise = 0;
      }

      const cityName = lbl.city.name.toUpperCase();
      const eventText = lbl.event;

      ctx.save();
      ctx.translate(sx, sy - 16 + rise);

      /* Soft halo — wide and subtle, no harsh ring */
      const haloGrad = ctx.createRadialGradient(0, -2, 0, 0, -2, 44);
      haloGrad.addColorStop(0, `rgba(${palette.glow[0]}, ${palette.glow[1]}, ${palette.glow[2]}, ${alpha * 0.35})`);
      haloGrad.addColorStop(0.6, `rgba(${palette.glow[0]}, ${palette.glow[1]}, ${palette.glow[2]}, ${alpha * 0.08})`);
      haloGrad.addColorStop(1, `rgba(${palette.glow[0]}, ${palette.glow[1]}, ${palette.glow[2]}, 0)`);
      ctx.fillStyle = haloGrad;
      ctx.beginPath(); ctx.arc(0, -2, 44, 0, Math.PI * 2); ctx.fill();

      /* Line 1: CITY NAME — clean sans, bold cream */
      ctx.font = "600 11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = `rgba(255, 250, 240, ${alpha})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(cityName, 0, 0);

      /* Line 2: event text — subtle palette mono, no ✦ */
      ctx.font = "500 8px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = `rgba(${palette.line[0]}, ${palette.line[1]}, ${palette.line[2]}, ${alpha * 0.78})`;
      ctx.fillText(eventText, 0, 10);

      ctx.restore();
      return true;
    };

    /* LIGHT direction (must match the lighting block in frame()) */
    const LIGHT_X = 0.62;
    const LIGHT_Y = -0.55;
    const LIGHT_Z = 0.56;

    const drawCity = (c: typeof targetsWithPhase[number], now: number, effRot: number) => {
      const p = project(c.lat, c.lng, effRot);
      if (p.z < -8) return;
      const depth = Math.max(0, Math.min(1, (p.z + 20) / 80));
      const sx = cx + p.x, sy = cy + p.y;
      const pulse = 0.7 + 0.3 * Math.sin(now / 780 + c.phase);

      /* Compute illumination: city surface normal · LIGHT
         litness ≈ 1 → fully sunlit (day side)
         litness ≈ -1 → fully dark (night side, city lights pop) */
      const nx = p.x / R, ny = p.y / R, nz = p.z / R;
      const litness = nx * LIGHT_X + ny * LIGHT_Y + nz * LIGHT_Z;
      /* nightFactor 0 (day) → 1 (deep night) */
      const nightFactor = Math.max(0, Math.min(1, (-litness + 0.2) / 1.2));
      /* Night-vision boost: cities glow up to 1.7× on dark side */
      const nightBoost = 0.55 + nightFactor * 1.15;

      const highlight = cityHighlight.get(c);
      const boost = highlight ? Math.max(0, Math.min(1, (highlight.end - now) / HIGHLIGHT_DUR)) : 0;
      const boostEase = boost * boost;
      const palette = highlight
        ? (ARC_PALETTE[highlight.paletteIdx] ?? ARC_PALETTE[0]!)
        : ARC_PALETTE[0]!;
      const haloScale = (10 + boostEase * 16) * nightBoost;

      const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, haloScale * pulse);
      halo.addColorStop(0, `rgba(${palette.line[0]}, ${palette.line[1]}, ${palette.line[2]}, ${(0.5 + boostEase * 0.4) * depth * pulse * nightBoost})`);
      halo.addColorStop(0.45, `rgba(${palette.glow[0]}, ${palette.glow[1]}, ${palette.glow[2]}, ${(0.22 + boostEase * 0.2) * depth * pulse * nightBoost})`);
      halo.addColorStop(1, `rgba(${palette.glow[0]}, ${palette.glow[1]}, ${palette.glow[2]}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(sx, sy, haloScale * pulse, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = `rgba(${palette.line[0]}, ${palette.line[1]}, ${palette.line[2]}, ${(0.4 + boostEase * 0.4) * depth * Math.min(1, nightBoost)})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.arc(sx, sy, 3.5 + boostEase * 2, 0, Math.PI * 2); ctx.stroke();

      /* Core dot — slightly brighter on night side */
      ctx.fillStyle = `rgba(255, 248, 230, ${(0.85 + boostEase * 0.1) * depth * Math.min(1.1, nightBoost * 0.95)})`;
      ctx.beginPath(); ctx.arc(sx, sy, 1.8 + boostEase * 0.7, 0, Math.PI * 2); ctx.fill();
    };

    const drawOriginHub = (now: number, effRot: number) => {
      const p = project(origin.lat, origin.lng, effRot);
      if (p.z < -15) return;
      const sx = cx + p.x, sy = cy + p.y;
      const depth = Math.max(0.55, Math.min(1, (p.z + 30) / 100));
      const pulse = 0.78 + 0.22 * Math.sin(now / 500);

      const outer = ctx.createRadialGradient(sx, sy, 0, sx, sy, 40 * pulse);
      outer.addColorStop(0, `rgba(255, 225, 165, ${0.7 * pulse * depth})`);
      outer.addColorStop(0.4, `rgba(232, 138, 70, ${0.35 * pulse * depth})`);
      outer.addColorStop(1, "rgba(232, 138, 70, 0)");
      ctx.fillStyle = outer;
      ctx.beginPath(); ctx.arc(sx, sy, 40 * pulse, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = `rgba(255, 200, 120, ${0.5 * depth})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.arc(sx, sy, 17, 0, Math.PI * 2); ctx.stroke();

      ctx.strokeStyle = `rgba(255, 224, 158, ${0.9 * depth})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(sx, sy, 8.5, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); ctx.arc(sx, sy, 3.4, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = `rgba(255, 224, 158, ${depth})`;
      ctx.font = "600 9.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("SEOUL", sx, sy - 24);

      ctx.fillStyle = `rgba(255, 224, 158, ${0.5 * depth})`;
      ctx.font = "500 7.5px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText("ORIGIN HUB", sx, sy - 34);
    };

    /* Hover detection — find nearest visible city to mouse */
    const updateHover = (effRot: number) => {
      if (!mouse.inside || !hoverCbRef.current) {
        if (lastHoveredCity) {
          lastHoveredCity = null;
          hoverCbRef.current?.(null);
        }
        return;
      }
      let nearest: GlobeCity | null = null;
      let nearestDist = 22;
      let nearestSx = 0, nearestSy = 0;
      for (const c of targetsWithPhase) {
        const p = project(c.lat, c.lng, effRot);
        if (p.z < 0) continue;
        const sx = cx + p.x, sy = cy + p.y;
        const dist = Math.hypot(mouse.x - sx, mouse.y - sy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = c;
          nearestSx = sx;
          nearestSy = sy;
        }
      }
      if (nearest !== lastHoveredCity) {
        lastHoveredCity = nearest;
        if (nearest) {
          hoverCbRef.current?.({ city: nearest, screenX: nearestSx, screenY: nearestSy });
        } else {
          hoverCbRef.current?.(null);
        }
      }
    };

    const frame = (now: number) => {
      if (!running) { rafId = 0; return; }

      /* Ease tilt toward target */
      currentTilt += (targetTilt - currentTilt) * 0.08;
      const effRot = rotation + currentTilt;
      rotation += rotationSpeed;

      ctx.clearRect(0, 0, W, H);

      /* ─── DIRECTIONAL LIGHTING ───────────────────────────────────
         Mystery 70% + Tech 20% + Luxury 10%
         Light source: upper-right + slightly forward
         Effect: clear day/night terminator, night side dramatic
      ───────────────────────────────────────────────────────────── */
      const LIGHT_X = 0.62;    // light from right (normalized)
      const LIGHT_Y = -0.55;   // from upper
      const LIGHT_Z = 0.56;    // slightly toward viewer
      /* |LIGHT| ≈ 1.0 (already normalized) */

      /* DIRECTIONAL OUTER GLOW — only on lit side, fades into space */
      const glowCx = cx + LIGHT_X * R * 0.95;
      const glowCy = cy + LIGHT_Y * R * 0.95;
      const atmoOut = ctx.createRadialGradient(glowCx, glowCy, R * 0.25, glowCx, glowCy, R * 1.8);
      atmoOut.addColorStop(0, "rgba(255, 195, 130, 0.32)");
      atmoOut.addColorStop(0.45, "rgba(255, 170, 100, 0.10)");
      atmoOut.addColorStop(0.85, "rgba(232, 138, 70, 0.02)");
      atmoOut.addColorStop(1, "rgba(232, 138, 70, 0)");
      ctx.fillStyle = atmoOut;
      ctx.beginPath(); ctx.arc(cx, cy, R + 80, 0, Math.PI * 2); ctx.fill();

      /* Sphere body — deeper dark for mystery */
      const sphere = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      sphere.addColorStop(0, "#0e0907");
      sphere.addColorStop(0.85, "#070403");
      sphere.addColorStop(1, "#030201");
      ctx.fillStyle = sphere;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      /* Clip subsequent layers to sphere */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      /* SOLAR ILLUMINATION — directional sun-side warm wash */
      const sunCx = cx + LIGHT_X * R * 0.35;
      const sunCy = cy + LIGHT_Y * R * 0.35;
      const sun = ctx.createRadialGradient(sunCx, sunCy, 0, sunCx, sunCy, R * 0.95);
      sun.addColorStop(0, "rgba(255, 200, 145, 0.22)");
      sun.addColorStop(0.35, "rgba(255, 175, 110, 0.10)");
      sun.addColorStop(0.7, "rgba(232, 138, 70, 0.03)");
      sun.addColorStop(1, "rgba(232, 138, 70, 0)");
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, W, H);

      /* NIGHT TERMINATOR — dramatic darkening on the unlit side */
      const nightCx = cx - LIGHT_X * R * 0.45;
      const nightCy = cy - LIGHT_Y * R * 0.45;
      const night = ctx.createRadialGradient(nightCx, nightCy, 0, nightCx, nightCy, R * 1.05);
      night.addColorStop(0, "rgba(0, 0, 0, 0.50)");
      night.addColorStop(0.4, "rgba(0, 0, 0, 0.32)");
      night.addColorStop(0.8, "rgba(0, 0, 0, 0.08)");
      night.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = night;
      ctx.fillRect(0, 0, W, H);

      /* Continents */
      for (const poly of SUBDIVIDED) drawContinent(poly, effRot);

      /* Subtle inner terminator hint — faint warm crescent at day edge */
      const termAngle = Math.atan2(LIGHT_Y, LIGHT_X);
      const inner = ctx.createRadialGradient(
        cx + LIGHT_X * R * 0.6, cy + LIGHT_Y * R * 0.6, R * 0.4,
        cx + LIGHT_X * R * 0.6, cy + LIGHT_Y * R * 0.6, R * 1.2
      );
      inner.addColorStop(0, "rgba(255, 180, 110, 0)");
      inner.addColorStop(0.7, "rgba(255, 180, 110, 0.05)");
      inner.addColorStop(1, "rgba(255, 180, 110, 0)");
      ctx.fillStyle = inner;
      ctx.fillRect(0, 0, W, H);

      ctx.restore();

      /* DIRECTIONAL RIM — conic gradient, bright on light side, dim opposite */
      const rim = ctx.createConicGradient(termAngle - Math.PI, cx, cy);
      rim.addColorStop(0,    "rgba(232, 138, 70, 0.04)");  /* anti-light direction (dim) */
      rim.addColorStop(0.35, "rgba(232, 138, 70, 0.18)");
      rim.addColorStop(0.5,  "rgba(255, 180, 110, 0.55)"); /* light direction (bright) */
      rim.addColorStop(0.65, "rgba(232, 138, 70, 0.18)");
      rim.addColorStop(1,    "rgba(232, 138, 70, 0.04)");
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      /* Stash LIGHT for city brightness modulation */
      const __light = { x: LIGHT_X, y: LIGHT_Y, z: LIGHT_Z };
      void __light;

      /* Cities */
      for (const c of targetsWithPhase) drawCity(c, now, effRot);

      /* Origin hub */
      drawOriginHub(now, effRot);

      /* Arcs */
      for (let i = arcs.length - 1; i >= 0; i--) {
        const a = arcs[i]; if (!a) continue;
        if (!drawArc(a, now, effRot)) arcs.splice(i, 1);
      }

      /* Ripples */
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]; if (!r) continue;
        if (!drawRipple(r, now, effRot)) ripples.splice(i, 1);
      }

      /* Sparkle labels */
      for (let i = labels.length - 1; i >= 0; i--) {
        const l = labels[i]; if (!l) continue;
        if (!drawLabel(l, now, effRot)) labels.splice(i, 1);
      }

      /* Cleanup expired highlights */
      for (const [city, h] of cityHighlight) {
        if (h.end < now) cityHighlight.delete(city);
      }

      /* Hover check */
      updateHover(effRot);

      if (now - spawnTimer > arcInterval) {
        spawnTimer = now;
        spawnArc();
      }

      rafId = requestAnimationFrame(frame);
    };

    /* Detect touch device (mouse tilt disabled on touch) */
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const tiltActive = enableMouseTilt && !isTouchDevice;

    /* Mouse handlers (desktop) */
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.inside = true;
      if (tiltActive) {
        const nx = (mouse.x - cx) / cx;
        targetTilt = nx * 5;
      }
    };
    const handleMouseLeave = () => {
      mouse.inside = false;
      targetTilt = 0;
    };

    /* Touch handlers — tap to show city info, no tilt */
    let lastTouchTime = 0;
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
      mouse.inside = true;
      lastTouchTime = performance.now();
      /* Don't preventDefault — allow scrolling */
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = touch.clientX - rect.left;
      mouse.y = touch.clientY - rect.top;
      mouse.inside = true;
    };
    const handleTouchEnd = () => {
      /* Hide hover after 2.5s on touch devices */
      window.setTimeout(() => {
        if (performance.now() - lastTouchTime >= 2400) {
          mouse.inside = false;
        }
      }, 2500);
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: true });

    /* Pause when offscreen */
    const io = new IntersectionObserver((entries) => {
      const e = entries[0]; if (!e) return;
      const was = running;
      running = e.isIntersecting;
      if (running && !was && !rafId && !prefersReduced) {
        rafId = requestAnimationFrame(frame);
      }
    }, { threshold: 0 });
    io.observe(stage);

    if (prefersReduced) {
      running = true;
      rafId = requestAnimationFrame((t) => { frame(t); running = false; });
    } else {
      rafId = requestAnimationFrame(frame);
      spawnArc();
    }

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      cityHighlight.clear();
    };
  }, [size, origin, targets, rotationSpeed, arcInterval, initialRotation, enableMouseTilt]);

  return (
    <div
      ref={stageRef}
      className={className}
      style={{ position: "relative", width: size, height: size }}
      role="img"
      aria-label={`Live sourcing intelligence globe — ${targets.length} cities connected to ${origin.name}`}
    >
      <canvas ref={canvasRef} className="block cursor-crosshair" />
      {children}
    </div>
  );
}
