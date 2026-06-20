"use client";

import type { HoverPayload } from "./GlobeCanvas";

/* ─────────────────────────────────────────────
   Per-city dossier
   capabilities · regulatory compliance · latest event
   No fake statistics — no fabricated counts or invented metrics.
───────────────────────────────────────────── */

export interface CityDossierData {
  readonly capabilities: string;
  readonly compliance: string;
  readonly activity: string;
}

export const CITY_META: Record<string, CityDossierData> = {
  "Tokyo":        { capabilities: "Premium skincare · luxury packaging",       compliance: "MHLW notified",         activity: "Formula approved" },
  "Shanghai":     { capabilities: "Mass volume · e-commerce SKUs",             compliance: "NMPA registered",       activity: "Sample shipped" },
  "Hong Kong":    { capabilities: "Re-export · free-port logistics",           compliance: "No notification req.",  activity: "Quote sent" },
  "Singapore":    { capabilities: "ASEAN hub · halal-certified lines",         compliance: "HSA listed",            activity: "Factory matched" },
  "Bangkok":      { capabilities: "Sheet masks · sachets · sun care",          compliance: "TFDA notified",         activity: "RFQ received" },
  "Jakarta":      { capabilities: "Halal-certified · MENA-style",              compliance: "BPOM registered",       activity: "Sample requested" },
  "Manila":       { capabilities: "Whitening · sun care",                      compliance: "FDA Philippines",       activity: "Order confirmed" },
  "Mumbai":       { capabilities: "Ayurveda blends · skincare",                compliance: "CDSCO ready",           activity: "Sample shipped" },
  "Dubai":        { capabilities: "Luxury · gift packs · niche fragrances",    compliance: "ESMA approved",         activity: "Order shipped" },
  "Riyadh":       { capabilities: "Halal-only · perfume oils",                 compliance: "SFDA listed",           activity: "Quote sent" },
  "Doha":         { capabilities: "Niche luxury · concept SKUs",               compliance: "GSO compliant",         activity: "Factory matched" },
  "London":       { capabilities: "Indie brand support · clean beauty",        compliance: "CPNP · UK SCPN",        activity: "Sample shipped" },
  "Paris":        { capabilities: "Concept-store ready · premium positioning", compliance: "EU 1223/2009",          activity: "RFQ received" },
  "Frankfurt":    { capabilities: "Bonded warehouse · EU logistics",           compliance: "EU 1223 + CLP",         activity: "Batch in transit" },
  "New York":     { capabilities: "MoCRA-ready · indie scaling",               compliance: "FDA registered",        activity: "Formula approved" },
  "Los Angeles":  { capabilities: "Clean beauty · wellness blends",            compliance: "FDA + CA Prop 65",      activity: "Order placed" },
  "Toronto":      { capabilities: "Bilingual EN/FR labeling",                  compliance: "Health Canada",         activity: "Sample shipped" },
  "São Paulo":    { capabilities: "LATAM-localized SKUs",                      compliance: "ANVISA registered",     activity: "RFQ received" },
  "Buenos Aires": { capabilities: "Spanish-market formulas",                   compliance: "ANMAT compliant",       activity: "Quote sent" },
  "Cairo":        { capabilities: "Arabic packaging · MENA-ready",             compliance: "EDA registered",        activity: "Factory matched" },
  "Lagos":        { capabilities: "High-volume manufacturing",                 compliance: "NAFDAC notified",       activity: "Sample requested" },
  "Nairobi":      { capabilities: "Climate-adapted formulas",                  compliance: "PPB compliant",         activity: "RFQ received" },
  "Johannesburg": { capabilities: "Premium retail · category builders",        compliance: "SAHPRA / NRCS",         activity: "Quote sent" },
  "Sydney":       { capabilities: "Clean beauty · sun care",                   compliance: "TGA + AICIS",           activity: "Batch in transit" },
};

/* ─── City hover dossier — rich data popup ─── */
export function CityHoverCard({ payload }: { payload: HoverPayload }) {
  const meta = CITY_META[payload.city.name];
  return (
    <div
      className="absolute z-30 pointer-events-none rounded-xl border border-[#8B5E3C]/35 bg-[#08070b]/96 backdrop-blur-sm px-4 py-3.5 shadow-[0_0_28px_rgba(139,94,60,0.3)]"
      style={{
        left: payload.screenX,
        top: payload.screenY - 18,
        transform: "translate(-50%, -100%)",
        minWidth: 250,
        maxWidth: 290,
      }}
    >
      {/* City header */}
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <p className="font-display text-[16.5px] text-[#F5F0E8] font-medium leading-none">
          {payload.city.name}
        </p>
        <p className="text-[9px] text-[#8B5E3C] uppercase tracking-[0.22em] font-semibold whitespace-nowrap">
          {payload.city.country}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-[#8B5E3C]/35 via-[#8B5E3C]/15 to-transparent mb-2.5" />

      {/* Dossier rows */}
      {meta && (
        <div className="space-y-2">
          <div>
            <p className="text-[8.5px] uppercase tracking-[0.2em] text-[#F5F0E8]/35 font-semibold mb-0.5">
              Capabilities
            </p>
            <p className="text-[11px] text-[#F5F0E8]/85 leading-snug">{meta.capabilities}</p>
          </div>
          <div>
            <p className="text-[8.5px] uppercase tracking-[0.2em] text-[#F5F0E8]/35 font-semibold mb-0.5">
              Compliance
            </p>
            <p className="text-[11px] text-[#F5F0E8]/85 leading-snug">{meta.compliance}</p>
          </div>
          <div>
            <p className="text-[8.5px] uppercase tracking-[0.2em] text-[#F5F0E8]/35 font-semibold mb-0.5">
              Latest activity
            </p>
            <p className="text-[11px] text-[#E9A052] font-mono leading-snug flex items-center gap-1.5">
              <span className="relative inline-flex items-center justify-center">
                <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-[#E9A052] opacity-70 animate-ping" />
                <span className="relative inline-flex h-1 w-1 rounded-full bg-[#E9A052]" />
              </span>
              {meta.activity}
            </p>
          </div>
        </div>
      )}

      {/* Pointer */}
      <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#08070b]/96 border-r border-b border-[#8B5E3C]/35" />
    </div>
  );
}
