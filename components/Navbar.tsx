'use client';

import React from 'react';
import {
  BookOpen,
  Shield,
  Sparkles,
  CheckSquare,
  FileText,
  GraduationCap,
  Briefcase,
  Calculator,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Role, ROLE_ACCESS_MAP } from '@/types';
import { INITIAL_DOCS } from '@/components/initial-docs';

interface NavbarProps {
  activeTab: 'assistant' | 'documents' | 'tests';
  setActiveTab: (tab: 'assistant' | 'documents' | 'tests') => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
}

interface RoleConfig {
  name: Role;
  accessText: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLES: RoleConfig[] = [
  {
    name: 'Intern',
    accessText: 'Public docs only',
    shortDesc: 'Public Tier',
    icon: GraduationCap,
  },
  {
    name: 'Account Manager',
    accessText: 'Public + Internal SOPs',
    shortDesc: 'Public + Internal',
    icon: Briefcase,
  },
  {
    name: 'Finance Lead',
    accessText: 'Public + Internal + Finance',
    shortDesc: '+ Pricing Rules',
    icon: Calculator,
  },
  {
    name: 'Managing Partner',
    accessText: 'All tiers (Executive)',
    shortDesc: 'Executive Clear',
    icon: ShieldCheck,
  },
];

export function Navbar({ activeTab, setActiveTab, currentRole, setCurrentRole }: NavbarProps) {
  const allowedLevels = ROLE_ACCESS_MAP[currentRole] || ['public'];
  const inScopeCount = INITIAL_DOCS.filter((d) => allowedLevels.includes(d.access)).length;
  const totalCount = INITIAL_DOCS.length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Brand & Title Block */}
          <div className="flex items-center space-x-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2F6F6B] text-white shadow-sm ring-1 ring-[#2F6F6B]/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Brightwave Knowledge Assistant
                </h1>
                <span className="hidden rounded-full bg-[#2F6F6B]/10 px-2 py-0.5 text-[11px] font-semibold text-[#2F6F6B] sm:inline-block">
                  Ahmedabad HQ
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                Enterprise SOPs, Retainer Pricing &amp; Operational Knowledge Base
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center self-start sm:self-auto rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30 ${
                activeTab === 'assistant'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#2F6F6B]" />
              <span>Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30 ${
                activeTab === 'documents'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-slate-600" />
              <span>Documents</span>
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30 ${
                activeTab === 'tests'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>Quality Checks</span>
            </button>
          </div>

          {/* Right: Role Switcher & In-Scope Document Counter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Segmented Control for Roles */}
            <div
              role="radiogroup"
              aria-label="Active Security Role"
              className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80"
            >
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isActive = currentRole === r.name;
                return (
                  <button
                    key={r.name}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setCurrentRole(r.name)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30 ${
                      isActive
                        ? 'bg-white font-semibold text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                    title={`${r.name}: ${r.accessText}`}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-[#2F6F6B]' : 'text-slate-400'}`} />
                    <span className="hidden sm:inline">{r.name}</span>
                    <span className="sm:hidden">{r.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Accessible Role Select (Preserved for Playwright test selector & mobile keyboard accessibility) */}
            <div className="relative">
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as Role)}
                className="appearance-none rounded-xl border border-slate-300 bg-white py-1.5 pl-2.5 pr-7 text-xs font-semibold text-slate-800 shadow-sm transition-all duration-150 hover:border-slate-400 focus:border-[#2F6F6B] focus:outline-none focus:ring-2 focus:ring-[#2F6F6B]/30"
                aria-label="Select Active Role"
              >
                {ROLES.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name} ({r.accessText})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400">
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Document Counter in Top Bar */}
            <div
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2F6F6B]/20 bg-[#2F6F6B]/5 px-2.5 py-1.5 text-xs font-semibold text-[#2F6F6B]"
              title={`${inScopeCount} out of ${totalCount} documents authorized for ${currentRole}`}
            >
              <FileText className="h-3.5 w-3.5 text-[#2F6F6B]" />
              <span>{inScopeCount} / {totalCount} Docs</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
