'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Play,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  HelpCircle,
  FileText,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { QUALITY_TEST_CASES, TestCase } from '@/data/test-cases';
import { AskResponse } from '@/types';

interface TestResultState {
  status: 'idle' | 'running' | 'passed' | 'failed';
  resultText?: string;
  reason?: string;
  timeMs?: number;
  raw?: AskResponse;
}

export function QualityChecksTab() {
  const [results, setResults] = useState<Record<string, TestResultState>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  const categories = [
    'ALL',
    'Access Enforcement',
    'Strategic Plan Matrix',
    'Boundary & Injection',
    'Category Coverage',
    'Citation Integrity',
  ];

  const runSingleTest = async (testCase: TestCase) => {
    setResults((prev) => ({
      ...prev,
      [testCase.id]: { status: 'running' },
    }));

    const start = performance.now();
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: testCase.question,
          role: testCase.role,
        }),
      });

      const elapsed = Math.round(performance.now() - start);

      if (!res.ok) {
        setResults((prev) => ({
          ...prev,
          [testCase.id]: {
            status: 'failed',
            resultText: `HTTP Error ${res.status}`,
            reason: 'Server failed to process test request',
            timeMs: elapsed,
          },
        }));
        return;
      }

      const data: AskResponse = await res.json();
      const verification = testCase.verify(data);

      setResults((prev) => ({
        ...prev,
        [testCase.id]: {
          status: verification.passed ? 'passed' : 'failed',
          resultText: data.answer.slice(0, 160) + (data.answer.length > 160 ? '...' : ''),
          reason: verification.reason,
          timeMs: elapsed,
          raw: data,
        },
      }));
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setResults((prev) => ({
        ...prev,
        [testCase.id]: {
          status: 'failed',
          resultText: 'Network / Client Failure',
          reason: err.message,
          timeMs: elapsed,
        },
      }));
    }
  };

  const runAllTests = async () => {
    if (isRunningAll) return;
    setIsRunningAll(true);

    for (const testCase of QUALITY_TEST_CASES) {
      await runSingleTest(testCase);
      // Pacing delay to stay well within free-tier API rate limits
      await new Promise((r) => setTimeout(r, 650));
    }

    setIsRunningAll(false);
  };

  const totalCount = QUALITY_TEST_CASES.length;
  const passedCount = Object.values(results).filter((r) => r.status === 'passed').length;
  const failedCount = Object.values(results).filter((r) => r.status === 'failed').length;
  const completedCount = passedCount + failedCount;
  const successRate = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0;

  const filteredTests = QUALITY_TEST_CASES.filter((tc) =>
    selectedCategory === 'ALL' ? true : tc.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header and Live Control Panel */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-150">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckSquare className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Automated Quality &amp; Security Verification Matrix
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Executes live requests against <code>/api/ask</code> validating access boundaries, prompt injection
              neutralization, similarity threshold gating, and citation substrings.
            </p>
          </div>

          <button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2F6F6B] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#265b58] disabled:opacity-60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30"
          >
            {isRunningAll ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Running All Tests ({completedCount}/{totalCount})...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Run All {totalCount} Live Tests</span>
              </>
            )}
          </button>
        </div>

        {/* Summary Strip (Total / Passed / Failed / Rate) */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5 border-t border-slate-100 pt-4">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/60 shadow-sm">
            <span className="text-[11px] font-medium text-slate-500 block">Total Test Suite</span>
            <span className="mt-0.5 block text-xl font-bold text-slate-900 tracking-tight">{totalCount} Tests</span>
          </div>

          <div className="rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200/60 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-800 block">Passed</span>
            <span className="mt-0.5 block text-xl font-bold text-emerald-700 tracking-tight">{passedCount}</span>
          </div>

          <div className="rounded-xl bg-red-50/70 p-3.5 border border-red-200/60 shadow-sm">
            <span className="text-[11px] font-semibold text-red-800 block">Failed</span>
            <span className="mt-0.5 block text-xl font-bold text-red-700 tracking-tight">{failedCount}</span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/60 shadow-sm">
            <span className="text-[11px] font-medium text-slate-500 block">Pending</span>
            <span className="mt-0.5 block text-xl font-bold text-slate-600 tracking-tight">{totalCount - completedCount}</span>
          </div>

          <div className="rounded-xl bg-[#2F6F6B]/10 p-3.5 border border-[#2F6F6B]/20 shadow-sm">
            <span className="text-[11px] font-semibold text-[#2F6F6B] block">Pass Rate</span>
            <span className="mt-0.5 block text-xl font-bold text-[#2F6F6B] tracking-tight">{successRate}%</span>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30 ${
              selectedCategory === cat
                ? 'bg-[#2F6F6B] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test Cases Table / List */}
      <div className="space-y-3.5">
        {filteredTests.map((tc) => {
          const res = results[tc.id];
          const isExpanded = expandedTraceId === tc.id;

          return (
            <div
              key={tc.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-150 hover:border-slate-300"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  {/* Status Indicator */}
                  <div className="mt-0.5 shrink-0">
                    {!res || res.status === 'idle' ? (
                      <Clock className="h-5 w-5 text-slate-300" />
                    ) : res.status === 'running' ? (
                      <RotateCw className="h-5 w-5 animate-spin text-[#2F6F6B]" />
                    ) : res.status === 'passed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{tc.id}</span>
                      <h4 className="text-sm font-bold text-slate-900">{tc.title}</h4>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200/60">
                        Role: {tc.role}
                      </span>
                      <span className="rounded-lg bg-[#2F6F6B]/10 px-2 py-0.5 text-[10px] font-bold text-[#2F6F6B]">
                        {tc.category}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-700 italic">
                      &ldquo;{tc.question}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Right: Timing and Run Test Button */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {res && res.timeMs !== undefined && (
                    <span className="font-mono text-[11px] text-slate-400 font-medium">{res.timeMs}ms</span>
                  )}

                  <button
                    onClick={() => runSingleTest(tc)}
                    disabled={isRunningAll || res?.status === 'running'}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#2F6F6B] hover:text-[#2F6F6B] hover:bg-[#2F6F6B]/5 transition-all duration-150 disabled:opacity-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30"
                  >
                    <span>Run Test</span>
                  </button>
                </div>
              </div>

              {/* Expected Policy Behavior vs Actual Verification */}
              <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs sm:grid-cols-2">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Expected Policy Behavior
                  </span>
                  <p className="mt-1 text-slate-700 leading-relaxed">{tc.expectedBehavior}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Actual Result &amp; Verification
                  </span>
                  {res ? (
                    <div>
                      <p
                        className={`mt-1 font-semibold ${
                          res.status === 'passed'
                            ? 'text-emerald-700'
                            : res.status === 'failed'
                            ? 'text-red-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {res.reason || res.status}
                      </p>
                      {res.resultText && (
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          Response: {res.resultText}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-slate-400 italic">Test pending execution</p>
                  )}
                </div>
              </div>

              {/* Inspect Pipeline Trace Toggle */}
              {res?.raw && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setExpandedTraceId(isExpanded ? null : tc.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#2F6F6B] hover:underline focus:outline-none"
                  >
                    <span>{isExpanded ? 'Hide Trace Details' : 'Inspect Pipeline Trace'}</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}

              {/* Expanded Inline Trace */}
              {isExpanded && res?.raw && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-2.5 shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-800">Execution Pipeline Trace</span>
                    <span className="font-mono text-slate-500 text-[11px] font-medium">{res.raw.trace.timings.totalMs}ms total</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                    <div>
                      <span className="text-slate-400">Best Score:</span>{' '}
                      <span className="font-mono font-bold text-slate-800">
                        {res.raw.trace.bestScore.toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Threshold:</span>{' '}
                      <span className="font-mono font-bold text-slate-800">{res.raw.trace.threshold.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Model:</span>{' '}
                      <span className="font-mono font-bold text-slate-800">{res.raw.trace.modelUsed}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Valid Citations:</span>{' '}
                      <span className="font-mono text-emerald-700 font-bold">
                        {res.raw.trace.validationResult.validCitationCount}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
