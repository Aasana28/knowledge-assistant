'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  FileText,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Quote,
  Layers,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Calculator,
} from 'lucide-react';
import { Role, AskResponse, Citation, ROLE_ACCESS_MAP, DocMetadata } from '@/types';
import { INITIAL_DOCS } from '@/components/initial-docs';
import { TraceSection } from './TraceSection';
import { SourceDrawer } from './SourceDrawer';

interface AssistantTabProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
}

const EXAMPLE_QUESTIONS = [
  {
    label: 'Silver Retainer Pricing',
    roleHint: 'All roles',
    question: 'What are the inclusions and monthly fee for the Silver Growth Retainer?',
  },
  {
    label: 'Max Discount Policy',
    roleHint: 'Finance only',
    question: 'What is the maximum discount percentage permitted on client retainers?',
  },
  {
    label: '2027 Strategic Targets',
    roleHint: 'Management only',
    question: 'What is the 2027 revenue target and planned acquisitions for Brightwave?',
  },
  {
    label: 'Annual Leave Quota',
    roleHint: 'Internal SOP',
    question: 'How many paid leave days do full-time employees get per year?',
  },
  {
    label: 'Office WiFi Password',
    roleHint: 'Out of scope',
    question: 'What is the guest office WiFi password at the Ahmedabad HQ?',
  },
];

export function AssistantTab({ currentRole, setCurrentRole }: AssistantTabProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allDocs, setAllDocs] = useState<DocMetadata[]>(INITIAL_DOCS);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  // Sync document catalog from API (fallback to INITIAL_DOCS if offline)
  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          setAllDocs(data.documents);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const allowedLevels = ROLE_ACCESS_MAP[currentRole] || ['public'];
  const inScopeDocs = allDocs.filter((d) => allowedLevels.includes(d.access));
  const restrictedDocs = allDocs.filter((d) => !allowedLevels.includes(d.access));

  const handleAsk = async (qText?: string) => {
    const q = (qText || question).trim();
    if (!q || loading) return;

    if (qText) {
      setQuestion(qText);
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    // Multi-step progressive status updates
    setLoadingStep('1/4: Pre-filtering docs by role & embedding query...');
    const stepTimer1 = setTimeout(() => {
      setLoadingStep('2/4: Performing cosine similarity ranking against allowed chunks...');
    }, 700);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('3/4: Gating similarity threshold & querying Groq LLM...');
    }, 1500);

    const stepTimer3 = setTimeout(() => {
      setLoadingStep('4/4: Performing code-level citation substring verification...');
    }, 2800);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, role: currentRole }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server responded with status ${res.status}`);
      }

      const data: AskResponse = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while communicating with the assistant.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const getStatusBadge = () => {
    if (!response) return null;

    if (response.found) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Answered from Approved Docs
        </span>
      );
    }

    if (response.restrictedMatch) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <Lock className="h-3.5 w-3.5 text-amber-600" />
          Restricted Topic
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
        Not Found in Approved Scope
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left Sidebar: Active Security Context & In-Scope Documents */}
      <aside className="lg:col-span-4 space-y-5">
        {/* Security Context Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Security Context
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F6F6B]">
              <ShieldCheck className="h-4 w-4" />
              Pre-Retrieval Filter
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{currentRole}</span>
              {allDocs.length > 0 ? (
                <span className="rounded-full bg-[#2F6F6B]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2F6F6B]">
                  {inScopeDocs.length} / {allDocs.length} Docs
                </span>
              ) : (
                <span className="inline-block h-4 w-16 animate-pulse rounded bg-slate-200" />
              )}
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Permitted tiers: {allowedLevels.map((l) => l.toUpperCase()).join(' • ')}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {['public', 'internal', 'finance', 'management'].map((lvl) => {
                const isGranted = allowedLevels.includes(lvl as any);
                return (
                  <span
                    key={lvl}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border transition-colors ${
                      isGranted
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                    }`}
                  >
                    {isGranted ? <Unlock className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                    {lvl}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50/80 p-3 text-[11px] text-slate-600 border border-slate-100 leading-relaxed">
            <p>
              <strong className="text-slate-800">Security Guarantee:</strong> Restricted documents are segregated before vector similarity search.
              Unauthorized text never reaches the LLM context.
            </p>
          </div>
        </div>

        {/* Documents In Scope List */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Documents in Scope ({inScopeDocs.length})
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              Approved
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {inScopeDocs.length > 0 ? (
              inScopeDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-start gap-2.5 rounded-xl border border-slate-100 p-2.5 hover:border-[#2F6F6B]/40 hover:bg-slate-50/80 transition-all duration-150 text-xs"
                >
                  <FileText className="h-4 w-4 shrink-0 text-[#2F6F6B] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate group-hover:text-[#2F6F6B]">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 font-medium">{doc.category}</span>
                      <span>•</span>
                      <span className="capitalize">{doc.access}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            )}

            {restrictedDocs.length > 0 && (
              <div className="pt-2.5 mt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{restrictedDocs.length} restricted docs hidden for {currentRole}</span>
                <Lock className="h-3.5 w-3.5 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Panel: Question Input & Answer */}
      <main className="lg:col-span-8 space-y-5">
        {/* Question Form Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-150">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="space-y-3"
          >
            <div className="relative">
              <label htmlFor="question-input" className="sr-only">
                Ask a question
              </label>
              <textarea
                id="question-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                rows={3}
                placeholder="Ask about Brightwave Digital SOPs, pricing packages, discount rules, marketing services, or projects..."
                className="w-full resize-none rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2F6F6B] focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30 transition-all duration-150"
                disabled={loading}
              />
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Press <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[10px] text-slate-600">Enter ↵</kbd> to ask
                </span>
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2F6F6B] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#265b58] disabled:opacity-50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Ask Knowledge Base</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Example Chips */}
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 block mb-2">Try an example question:</span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAsk(ex.question)}
                  disabled={loading}
                  className="group flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-700 hover:border-[#2F6F6B]/50 hover:bg-white hover:text-[#2F6F6B] transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30"
                >
                  <span className="font-medium">{ex.label}</span>
                  <span className="rounded bg-slate-200/60 px-1.5 py-0.2 text-[10px] text-slate-600 group-hover:bg-[#2F6F6B]/10 group-hover:text-[#2F6F6B] transition-colors">
                    {ex.roleHint}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading Step Card */}
        {loading && (
          <div className="rounded-2xl border border-[#2F6F6B]/20 bg-white p-6 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#2F6F6B]" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Consulting Approved Knowledge Base</h4>
                <p className="text-xs text-slate-500 mt-0.5">{loadingStep || 'Querying pipeline...'}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-[#2F6F6B] animate-pulse" style={{ width: '85%' }} />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-800 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Request Error</h4>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Answer Card */}
        {response && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
            {/* Answer Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Grounded Answer
              </span>
              {getStatusBadge()}
            </div>

            {/* Answer Body */}
            <div className="text-sm leading-relaxed text-slate-800 space-y-3">
              <p className="whitespace-pre-wrap">{response.answer}</p>
            </div>

            {/* Restricted Topic Hint */}
            {response.restrictedMatch && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex items-start gap-3 text-xs text-amber-900 shadow-sm">
                <Lock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-amber-950">Higher Access Requirement Detected</h5>
                  <p className="mt-0.5">
                    {response.restrictedHint ||
                      'This question may be covered in an approved company document that requires higher security clearance.'}
                  </p>
                  <p className="mt-1 text-[11px] text-amber-800">
                    Switch your active role in the top bar to simulate an authorized user (e.g. Finance Lead or Managing
                    Partner).
                  </p>
                </div>
              </div>
            )}

            {/* Citations Section */}
            {response.citations && response.citations.length > 0 && (
              <div className="pt-3.5 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Quote className="h-3.5 w-3.5 text-[#2F6F6B]" />
                    Verified Citations ({response.citations.length})
                  </span>
                  <span className="text-[11px] text-slate-400">Click a chip to inspect source text</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {response.citations.map((cit, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCitation(cit)}
                      className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-800 hover:border-[#2F6F6B] hover:bg-[#2F6F6B]/5 transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#2F6F6B]" />
                      <span className="font-medium">{cit.docTitle || cit.chunkId}</span>
                      <span className="rounded bg-slate-200/80 px-1.5 py-0.2 text-[10px] text-slate-600 font-mono">
                        {cit.chunkId}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible Technical Trace */}
            <div className="pt-2">
              <TraceSection trace={response.trace} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!response && !loading && !error && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6F6B]/10 text-[#2F6F6B]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-3.5 text-sm font-semibold text-slate-800">
              Welcome to Brightwave Knowledge Assistant
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 leading-relaxed">
              Ask questions about company retainers, technical SEO standards, social media SOPs, incident escalations,
              or HR leave quotas. Try switching roles above to observe access enforcement in real time.
            </p>
          </div>
        )}
      </main>

      {/* Sliding Source Drawer */}
      <SourceDrawer citation={selectedCitation} onClose={() => setSelectedCitation(null)} />
    </div>
  );
}
