'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Timer,
  Shield,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import { PipelineTrace } from '@/types';

interface TraceSectionProps {
  trace: PipelineTrace;
}

export function TraceSection({ trace }: TraceSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition-all duration-150 shadow-sm">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30"
        aria-expanded={isOpen}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2F6F6B]/10 text-[#2F6F6B]">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-900">How this answer was produced</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-normal text-slate-600">
            {trace.timings.totalMs}ms total
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
              trace.passedThreshold
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-amber-50 text-amber-700 border-amber-200/80'
            }`}
          >
            {trace.passedThreshold ? 'Threshold Passed' : 'Gated Below Threshold'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span>{isOpen ? 'Hide technical trace' : 'Show technical trace'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-slate-100 p-5 space-y-6 text-xs bg-slate-50/40">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
              <span className="text-slate-500 block text-[11px] font-medium">Evaluated Role</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">{trace.role}</span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {trace.allowedDocCount} of {trace.totalDocCount} docs in scope
              </span>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
              <span className="text-slate-500 block text-[11px] font-medium">Best Similarity Score</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-bold text-slate-900">{trace.bestScore.toFixed(4)}</span>
                <span className="text-[11px] text-slate-500">vs {trace.threshold.toFixed(2)} gate</span>
              </div>
              <span
                className={`text-[11px] font-semibold mt-0.5 block ${
                  trace.passedThreshold ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {trace.passedThreshold ? 'Passed gate' : 'Stopped before LLM'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
              <span className="text-slate-500 block text-[11px] font-medium">Generation Model</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block truncate" title={trace.modelUsed}>
                {trace.modelUsed.replace('openai/', '')}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Server route (Groq SDK)</span>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
              <span className="text-slate-500 block text-[11px] font-medium">Citation Substrings</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">
                {trace.validationResult.validCitationCount} verified
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {trace.validationResult.droppedCitations.length} dropped by code
              </span>
            </div>
          </div>

          {/* Timeline Pipeline Sequence */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Timer className="h-4 w-4 text-[#2F6F6B]" />
                End-to-End Pipeline Timeline &amp; Latency Breakdown
              </span>
              <span className="text-slate-500 font-mono text-[11px] font-medium">Total: {trace.timings.totalMs} ms</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
              {/* Step 1 */}
              <div className="relative rounded-xl bg-slate-50/80 p-3 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[#2F6F6B] font-semibold text-[11px]">
                  <Filter className="h-3 w-3" />
                  <span>1. Role Access Filter</span>
                </div>
                <p className="mt-1 font-mono font-bold text-slate-900 text-sm">{trace.timings.embedMs} ms</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">Gemini 768d L2 &amp; Role Mask</span>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-xl bg-slate-50/80 p-3 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[#2F6F6B] font-semibold text-[11px]">
                  <Layers className="h-3 w-3" />
                  <span>2. Vector Retrieval</span>
                </div>
                <p className="mt-1 font-mono font-bold text-slate-900 text-sm">{trace.timings.retrieveMs} ms</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">Cosine ranking on allowed chunks</span>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-xl bg-slate-50/80 p-3 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[#2F6F6B] font-semibold text-[11px]">
                  <Sparkles className="h-3 w-3" />
                  <span>3. LLM Generation</span>
                </div>
                <p className="mt-1 font-mono font-bold text-slate-900 text-sm">{trace.timings.generateMs} ms</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">Strict Groq JSON schema</span>
              </div>

              {/* Step 4 */}
              <div className="relative rounded-xl bg-slate-50/80 p-3 border border-slate-200/70">
                <div className="flex items-center gap-1.5 text-[#2F6F6B] font-semibold text-[11px]">
                  <CheckCheck className="h-3 w-3" />
                  <span>4. Code Validation</span>
                </div>
                <p className="mt-1 font-mono font-bold text-slate-900 text-sm">{trace.timings.validateMs} ms</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">Substring &amp; ID integrity</span>
              </div>
            </div>
          </div>

          {/* Retrieved Chunks with Similarity Bars and Threshold Marker */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Layers className="h-4 w-4 text-[#2F6F6B]" />
                Top Candidates Ranked by Cosine Similarity (Threshold: {trace.threshold.toFixed(2)})
              </span>
              <span className="text-slate-500 text-[11px] font-medium">Top 4 candidates evaluated</span>
            </div>

            {trace.retrievedChunks.length === 0 ? (
              <p className="text-slate-500 italic py-2">No accessible chunks met candidate requirements.</p>
            ) : (
              <div className="space-y-3">
                {trace.retrievedChunks.map((c, i) => {
                  const percent = Math.min(100, Math.max(0, Math.round(c.score * 100)));
                  const meetsThreshold = c.score >= trace.threshold;

                  return (
                    <div key={c.chunkId} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-600 text-xs">#{i + 1}</span>
                          <span className="font-semibold text-slate-900 truncate max-w-[240px] sm:max-w-md">
                            {c.title}
                          </span>
                          <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-mono text-slate-700">
                            {c.chunkId}
                          </span>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                            {c.access}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{c.score.toFixed(4)}</span>
                          {meetsThreshold ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                      </div>

                      {/* Similarity Bar with Threshold Marker */}
                      <div className="relative mt-2.5 h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            meetsThreshold ? 'bg-[#2F6F6B]' : 'bg-amber-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                        <span>0.00</span>
                        <span className="text-[#2F6F6B] font-semibold">
                          Threshold Cutoff: {trace.threshold.toFixed(2)}
                        </span>
                        <span>1.00</span>
                      </div>

                      <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 italic bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        &ldquo;{c.textSnippet}&rdquo;
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Validation Code Results */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-2.5 text-xs">
              <Shield className="h-4 w-4 text-[#2F6F6B]" />
              Code-Level Citation Verification Results
            </span>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Initial LLM Citations Produced:</span>
                <span className="font-mono font-semibold text-slate-900">{trace.validationResult.originalCitationCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Verbatim Verified Substrings:</span>
                <span className="font-mono text-emerald-700 font-bold">
                  {trace.validationResult.validCitationCount}
                </span>
              </div>
              {trace.validationResult.downgraded && (
                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-800 border border-amber-200 flex items-start gap-2 mt-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Answer was downgraded to &ldquo;Not found&rdquo; because zero valid citations matched true substrings in
                    the retrieved context.
                  </span>
                </div>
              )}
              {trace.validationResult.droppedCitations.length > 0 && (
                <div className="mt-2.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">Dropped Citations Log:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {trace.validationResult.droppedCitations.map((reason, idx) => (
                      <li key={idx} className="font-mono text-[10px]">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
