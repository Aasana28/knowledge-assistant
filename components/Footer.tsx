import React from 'react';
import { ShieldCheck, HardDriveDownload, Sparkles, Building2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/90 bg-white py-8 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Building2 className="h-4 w-4 text-[#2F6F6B]" />
              <span>Brightwave Knowledge Assistant &bull; Brightwave Digital (Ahmedabad, Gujarat)</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Demo with synthetic data. Nothing is stored. State resides solely in React runtime memory.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2F6F6B]" />
              Role switcher simulates RBAC access enforcement logic (production uses SSO / SAML).
            </span>
            <span>Gemini Embeddings (768d L2-normalized) &bull; Groq LLM &bull; Vercel Serverless</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
