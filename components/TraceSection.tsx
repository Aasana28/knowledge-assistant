'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Timer, Shield, Layers, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { PipelineTrace } from '@/types';

interface TraceSectionProps {
  trace: PipelineTrace;
}

export function TraceSection({ trace }: TraceSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-sm">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50/80 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-[#2F6F6B]" />
          <span>How this answer was produced</span>
          <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-normal text-slate-600">
            {trace.timings.totalMs}ms total
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              trace.passedThreshold
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {trace.passedThreshold ? 'Threshold Passed' : 'Gated Below Threshold'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{isOpen ? 'Hide technical trace' : 'Show technical trace'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-slate-100 p-5 space-y-6 text-xs bg-slate-50/40">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <span className="text-slate-500 block">Evaluated Role</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{trace.role}</span>
              <span className="text-[11px] text-slate-500">
                {trace.allowedDocCount} of {trace.totalDocCount} docs in scope
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <span className="text-slate-500 block">Best Similarity Score</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-semibold text-slate-900">{trace.bestScore.toFixed(4)}</span>
                <span className="text-[11px] text-slate-500">vs {trace.threshold.toFixed(2)} gate</span>
              </div>
              <span
                className={`text-[11px] font-medium ${
                  trace.passedThreshold ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {trace.passedThreshold ? 'Passed gate' : 'Stopped before LLM'}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <span className="text-slate-500 block">Generation Model</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block truncate" title={trace.modelUsed}>
                {trace.modelUsed.replace('openai/', '')}
              </span>
              <span className="text-[11px] text-slate-500">Server-side route</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <span className="text-slate-500 block">Citation Substrings</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                {trace.validationResult.validCitationCount} verified
              </span>
              <span className="text-[11px] text-slate-500">
                {trace.validationResult.droppedCitations.length} dropped by code
              </span>
            </div>
          </div>

          {/* Per-Stage Timings Breakdown */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-[#2F6F6B]" />
                Per-Stage Latency Pipeline
              </span>
              <span className="text-slate-500 font-mono text-[11px]">Total: {trace.timings.totalMs} ms</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded bg-slate-50 p-2 border border-slate-100">
                <span className="text-slate-500 text-[11px]">1. Query Embedding</span>
                <p className="font-mono font-medium text-slate-900">{trace.timings.embedMs} ms</p>
                <span className="text-[10px] text-slate-400">Gemini 768d L2</span>
              </div>
              <div className="rounded bg-slate-50 p-2 border border-slate-100">
                <span className="text-slate-500 text-[11px]">2. Cosine Retrieval</span>
                <p className="font-mono font-medium text-slate-900">{trace.timings.retrieveMs} ms</p>
                <span className="text-[10px] text-slate-400">Allowed chunks filter</span>
              </div>
              <div className="rounded bg-slate-50 p-2 border border-slate-100">
                <span className="text-slate-500 text-[11px]">3. LLM Generation</span>
                <p className="font-mono font-medium text-slate-900">{trace.timings.generateMs} ms</p>
                <span className="text-[10px] text-slate-400">Groq JSON mode</span>
              </div>
              <div className="rounded bg-slate-50 p-2 border border-slate-100">
                <span className="text-slate-500 text-[11px]">4. Code Validation</span>
                <p className="font-mono font-medium text-slate-900">{trace.timings.validateMs} ms</p>
                <span className="text-[10px] text-slate-400">Substring & ID verification</span>
              </div>
            </div>
          </div>

          {/* Retrieved Chunks with Similarity Bars and Threshold Marker */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#2F6F6B]" />
                Top Candidates Ranked by Cosine Similarity (Threshold: {trace.threshold.toFixed(2)})
              </span>
              <span className="text-slate-500 text-[11px]">Top 4 evaluated</span>
            </div>

            {trace.retrievedChunks.length === 0 ? (
              <p className="text-slate-500 italic">No accessible chunks met candidate requirements.</p>
            ) : (
              <div className="space-y-3">
                {trace.retrievedChunks.map((c, i) => {
                  const percent = Math.min(100, Math.max(0, Math.round(c.score * 100)));
                  const thresholdPercent = Math.round(trace.threshold * 100);
                  const meetsThreshold = c.score >= trace.threshold;

                  return (
                    <div key={c.chunkId} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-700">#{i + 1}</span>
                          <span className="font-medium text-slate-900 truncate max-w-[240px] sm:max-w-md">
                            {c.title}
                          </span>
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                            {c.chunkId}
                          </span>
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                            {c.access}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-900">{c.score.toFixed(4)}</span>
                          {meetsThreshold ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                      </div>

                      {/* Similarity Bar with Threshold Marker */}
                      <div className="relative mt-2 h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            meetsThreshold ? 'bg-[#2F6F6B]' : 'bg-amber-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                        <span>0.00</span>
                        <span className="text-[#2F6F6B] font-medium">Gate: {trace.threshold.toFixed(2)}</span>
                        <span>1.00</span>
                      </div>

                      <p className="mt-2 text-[11px] text-slate-600 line-clamp-2 italic bg-white p-2 rounded border border-slate-100">
                        &ldquo;{c.textSnippet}&rdquo;
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Validation Code Results */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
              <Shield className="h-3.5 w-3.5 text-[#2F6F6B]" />
              Code-Level Citation Verification Results
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Initial LLM Citations:</span>
                <span className="font-mono text-slate-900">{trace.validationResult.originalCitationCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Verbatim Verified Substrings:</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  {trace.validationResult.validCitationCount}
                </span>
              </div>
              {trace.validationResult.downgraded && (
                <div className="rounded bg-amber-50 p-2 text-amber-800 border border-amber-200 flex items-start gap-1.5 mt-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Answer was downgraded to &ldquo;Not found&rdquo; because zero valid citations matched true substrings in
                    the retrieved context.
                  </span>
                </div>
              )}
              {trace.validationResult.droppedCitations.length > 0 && (
                <div className="mt-2 rounded bg-slate-50 p-2 border border-slate-100">
                  <span className="font-medium text-slate-700 block mb-1">Dropped Citations Log:</span>
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

