'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Lock,
  Unlock,
  Search,
  Filter,
  Eye,
  FileText,
  Shield,
  Layers,
  X,
  Calendar,
  User,
  CheckCircle,
} from 'lucide-react';
import { Role, ROLE_ACCESS_MAP, DocMetadata, DocCategory } from '@/types';

interface DocumentsTabProps {
  currentRole: Role;
}

export function DocumentsTab({ currentRole }: DocumentsTabProps) {
  const [docs, setDocs] = useState<DocMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inspectDoc, setInspectDoc] = useState<DocMetadata | null>(null);

  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        if (data.documents) {
          setDocs(data.documents);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const allowedLevels = ROLE_ACCESS_MAP[currentRole] || ['public'];

  const filteredDocs = docs.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'ALL' || doc.category.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const accessibleCount = docs.filter((d) => allowedLevels.includes(d.access)).length;
  const restrictedCount = docs.length - accessibleCount;

  return (
    <div className="space-y-6">
      {/* Header and Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs text-slate-500 block">Total Approved Repository</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{docs.length}</span>
            <span className="text-xs text-slate-500">documents</span>
          </div>
          <span className="text-[11px] text-[#2F6F6B] font-medium">100% Synthetic Ahmedabad data</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs text-slate-500 block">Accessible to {currentRole}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700">{accessibleCount}</span>
            <span className="text-xs text-slate-500">docs in scope</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Eligible for AI retrieval</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs text-slate-500 block">Restricted from {currentRole}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-700">{restrictedCount}</span>
            <span className="text-xs text-slate-500">locked</span>
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Zero data leakage</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs text-slate-500 block">Current Permissions</span>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {allowedLevels.map((lvl) => (
              <span
                key={lvl}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200"
              >
                {lvl.toUpperCase()}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Role: {currentRole}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by title, owner, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#2F6F6B] focus:outline-none focus:ring-1 focus:ring-[#2F6F6B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#2F6F6B] focus:outline-none focus:ring-1 focus:ring-[#2F6F6B]"
          >
            <option value="ALL">All Categories</option>
            <option value="SOP">SOP (Standard Operating Procedures)</option>
            <option value="SERVICE">Service Descriptions</option>
            <option value="PRICING">Pricing & Billing</option>
            <option value="FAQ">FAQs</option>
            <option value="PROJECT">Projects</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Document Title</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Access Boundary</th>
                <th className="px-4 py-3.5">Owner</th>
                <th className="px-4 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDocs.map((doc) => {
                const isAccessible = allowedLevels.includes(doc.access);

                return (
                  <tr
                    key={doc.id}
                    className={`transition-colors ${
                      isAccessible ? 'hover:bg-slate-50/80' : 'bg-slate-50/40 opacity-75'
                    }`}
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <FileText
                          className={`h-4 w-4 shrink-0 ${isAccessible ? 'text-[#2F6F6B]' : 'text-slate-400'}`}
                        />
                        <div>
                          <span className="font-semibold block">{doc.title}</span>
                          <span className="font-mono text-[10px] text-slate-400">{doc.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {doc.category}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                          doc.access === 'public'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : doc.access === 'internal'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : doc.access === 'finance'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {doc.access.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-slate-600">{doc.owner}</td>

                    <td className="px-4 py-4 font-mono text-slate-500">{doc.updated}</td>

                    <td className="px-5 py-4 text-right">
                      {isAccessible ? (
                        <button
                          type="button"
                          onClick={() => setInspectDoc(doc)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-[#2F6F6B] hover:text-[#2F6F6B] transition-all shadow-sm"
                        >
                          <Eye className="h-3 w-3" />
                          View Details
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-400 border border-slate-200">
                          <Lock className="h-3 w-3" />
                          Locked for {currentRole}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Inspection Drawer */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2F6F6B]" />
                <h3 className="font-semibold text-slate-900">Document Overview</h3>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">{inspectDoc.title}</h4>
                <p className="mt-1 font-mono text-slate-400">ID: {inspectDoc.id}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-slate-800">{inspectDoc.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Clearance:</span>
                  <span className="font-semibold uppercase text-[#2F6F6B]">{inspectDoc.access}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Owner:</span>
                  <span className="font-medium text-slate-800">{inspectDoc.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Revised:</span>
                  <span className="font-mono text-slate-800">{inspectDoc.updated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approval Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <CheckCircle className="h-3 w-3" />
                    Approved SOP
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-emerald-900">
                <p className="font-semibold">Access Authorized for {currentRole}</p>
                <p className="mt-1 text-[11px] text-emerald-800">
                  Because your active role is {currentRole}, this document’s chunks are indexed and reachable in vector
                  similarity search when asking questions in the Assistant tab.
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 text-right">
              <button
                onClick={() => setInspectDoc(null)}
                className="rounded-lg bg-[#2F6F6B] px-4 py-2 text-xs font-medium text-white hover:bg-[#265b58]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

