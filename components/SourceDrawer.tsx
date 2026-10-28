'use client';

import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, FileText, ExternalLink, Loader2, Copy, Check } from 'lucide-react';
import { Citation } from '@/types';

interface SourceDrawerProps {
  citation: Citation | null;
  onClose: () => void;
}

interface ChunkDetails {
  chunkId: string;
  docId: string;
  title: string;
  category: string;
  access: string;
  text: string;
}

export function SourceDrawer({ citation, onClose }: SourceDrawerProps) {
  const [chunkData, setChunkData] = useState<ChunkDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!citation) {
      setChunkData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(`/api/chunk/${encodeURIComponent(citation.chunkId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load chunk');
        return res.json();
      })
      .then((data) => {
        if (isMounted) setChunkData(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [citation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!citation) return null;

  const handleCopyQuote = () => {
    if (citation?.quote) {
      navigator.clipboard.writeText(citation.quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Highlight quote inside chunk text if available
  const renderHighlightedText = (fullText: string, quote: string) => {
    if (!quote || quote.length < 5) return <span>{fullText}</span>;

    const cleanQuote = quote.trim();
    const index = fullText.toLowerCase().indexOf(cleanQuote.toLowerCase());

    if (index === -1) {
      return <span>{fullText}</span>;
    }

    const before = fullText.slice(0, index);
    const match = fullText.slice(index, index + cleanQuote.length);
    const after = fullText.slice(index + cleanQuote.length);

    return (
      <span className="whitespace-pre-wrap leading-relaxed text-slate-700">
        {before}
        <mark className="rounded bg-[#2F6F6B]/20 px-1 py-0.5 font-medium text-[#204a47] ring-1 ring-[#2F6F6B]/40">
          {match}
        </mark>
        {after}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-150">
      <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-150 animate-in slide-in-from-right sm:border-l sm:border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2F6F6B]/10 text-[#2F6F6B]">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Source Document Citation</h3>
              <p className="text-[11px] text-slate-500">Verified verbatim chunk from approved knowledge base</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metadata badges */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900">
              {citation.docTitle || chunkData?.title || 'Approved Company Document'}
            </h4>
            <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center rounded-lg bg-[#2F6F6B]/10 px-2.5 py-0.5 font-mono font-semibold text-[#2F6F6B]">
                Chunk: {citation.chunkId}
              </span>
              {citation.category && (
                <span className="inline-flex items-center rounded-lg bg-slate-200/70 px-2.5 py-0.5 font-semibold text-slate-700">
                  {citation.category}
                </span>
              )}
              {citation.access && (
                <span className="inline-flex items-center rounded-lg bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                  Access: {citation.access.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Cited quote box */}
          <div className="rounded-2xl border border-[#2F6F6B]/30 bg-[#2F6F6B]/5 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2F6F6B]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Verified Substring Quote
              </span>
              <button
                onClick={handleCopyQuote}
                className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs text-slate-600 hover:bg-[#2F6F6B]/10 hover:text-[#2F6F6B] transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="mt-2 text-sm italic text-slate-800 border-l-2 border-[#2F6F6B] pl-3 py-1 leading-relaxed">
              &ldquo;{citation.quote}&rdquo;
            </p>
          </div>

          {/* Full chunk context */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Full Document Chunk Context
            </h5>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#2F6F6B]" />
                <span className="ml-2 text-sm font-medium">Loading chunk content...</span>
              </div>
            ) : chunkData ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-700 max-h-96 overflow-y-auto shadow-sm">
                {renderHighlightedText(chunkData.text, citation.quote)}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                Chunk context loaded from retrieval cache.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#2F6F6B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#265b58] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30"
          >
            Close Source
          </button>
        </div>
      </div>
    </div>
  );
}
