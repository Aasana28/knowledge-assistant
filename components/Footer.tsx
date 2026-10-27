import React from 'react';
import { ShieldCheck, HardDriveDownload, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">
              Brightwave Knowledge Assistant &bull; Brightwave Digital (Ahmedabad, Gujarat)
            </p>
            <p className="text-slate-500">
              Demo with synthetic data. Nothing is stored. State resides solely in React runtime memory.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
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

