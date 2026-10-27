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
      await new Promise((r) => setTimeout(r, 400));
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Automated Live Quality & Security Checks
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Executes live requests against <code>/api/ask</code> validating access barriers, prompt injection
              immunity, threshold gating, and citation substrings.
            </p>
          </div>

          <button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2F6F6B] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#265b58] disabled:opacity-60 transition-all"
          >
            {isRunningAll ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                Running All Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Run All {totalCount} Live Tests
              </>
            )}
          </button>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5 border-t border-slate-100 pt-4">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[11px] text-slate-500">Total Test Suite</span>
            <span className="mt-0.5 block text-lg font-bold text-slate-900">{totalCount} Tests</span>
          </div>

          <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-100">
            <span className="text-[11px] text-emerald-800">Passed</span>
            <span className="mt-0.5 block text-lg font-bold text-emerald-700">{passedCount}</span>
          </div>

          <div className="rounded-xl bg-red-50/70 p-3 border border-red-100">
            <span className="text-[11px] text-red-800">Failed</span>
            <span className="mt-0.5 block text-lg font-bold text-red-700">{failedCount}</span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[11px] text-slate-500">Pending</span>
            <span className="mt-0.5 block text-lg font-bold text-slate-700">{totalCount - completedCount}</span>
          </div>

          <div className="rounded-xl bg-[#2F6F6B]/10 p-3 border border-[#2F6F6B]/20">
            <span className="text-[11px] text-[#2F6F6B] font-medium">Success Rate</span>
            <span className="mt-0.5 block text-lg font-bold text-[#2F6F6B]">{successRate}%</span>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-[#2F6F6B] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test Cases List */}
      <div className="space-y-3">
        {filteredTests.map((tc) => {
          const res = results[tc.id];
          const isExpanded = expandedTraceId === tc.id;

          return (
            <div
              key={tc.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
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
                      <span className="font-mono text-xs font-semibold text-slate-500">{tc.id}</span>
                      <h4 className="text-sm font-bold text-slate-900">{tc.title}</h4>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        Role: {tc.role}
                      </span>
                      <span className="rounded bg-[#2F6F6B]/10 px-2 py-0.5 text-[10px] font-medium text-[#2F6F6B]">
                        {tc.category}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs text-slate-700 italic">
                      &ldquo;{tc.question}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Right: Actions and Status Badge */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {res && res.timeMs !== undefined && (
                    <span className="font-mono text-[11px] text-slate-400">{res.timeMs}ms</span>
                  )}

                  <button
                    onClick={() => runSingleTest(tc)}
                    disabled={isRunningAll || res?.status === 'running'}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-[#2F6F6B] hover:text-[#2F6F6B] transition-all disabled:opacity-50"
                  >
                    Run Test
                  </button>
                </div>
              </div>

              {/* Expected vs Actual Details */}
              <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs sm:grid-cols-2">
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Expected Policy Behavior
                  </span>
                  <p className="mt-1 text-slate-700">{tc.expectedBehavior}</p>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Actual Result & Verification
                  </span>
                  {res ? (
                    <div>
                      <p
                        className={`mt-1 font-medium ${
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
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                          Response: {res.resultText}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-slate-400 italic">Test pending execution</p>
                  )}
                </div>
              </div>

              {/* View Trace Button if raw data available */}
              {res?.raw && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setExpandedTraceId(isExpanded ? null : tc.id)}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#2F6F6B] hover:underline"
                  >
                    {isExpanded ? 'Hide Trace Details' : 'Inspect Pipeline Trace'}
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}

              {/* Expanded Inline Trace */}
              {isExpanded && res?.raw && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">Execution Pipeline Trace</span>
                    <span className="font-mono text-slate-500 text-[11px]">{res.raw.trace.timings.totalMs}ms total</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                    <div>
                      <span className="text-slate-400">Best Score:</span>{' '}
                      <span className="font-mono font-semibold text-slate-800">
                        {res.raw.trace.bestScore.toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Threshold:</span>{' '}
                      <span className="font-mono text-slate-800">{res.raw.trace.threshold.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Model:</span>{' '}
                      <span className="font-mono text-slate-800">{res.raw.trace.modelUsed}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Valid Citations:</span>{' '}
                      <span className="font-mono text-emerald-700 font-semibold">
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

