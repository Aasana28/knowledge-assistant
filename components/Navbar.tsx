'use client';

import React from 'react';
import { BookOpen, Shield, Users, CheckSquare, Sparkles } from 'lucide-react';
import { Role } from '@/types';

interface NavbarProps {
  activeTab: 'assistant' | 'documents' | 'tests';
  setActiveTab: (tab: 'assistant' | 'documents' | 'tests') => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
}

const ROLES: { name: Role; accessText: string; badgeColor: string }[] = [
  { name: 'Intern', accessText: 'Public docs only', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
  { name: 'Account Manager', accessText: 'Public + Internal SOPs', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Finance Lead', accessText: 'Public + Internal + Finance', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { name: 'Managing Partner', accessText: 'All tiers (Executive)', badgeColor: 'bg-purple-50 text-purple-800 border-purple-200' },
];

export function Navbar({ activeTab, setActiveTab, currentRole, setCurrentRole }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F6F6B] text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Brightwave Knowledge Assistant
              </h1>
              <span className="hidden rounded-full bg-[#2F6F6B]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2F6F6B] sm:inline-block">
                Ahmedabad HQ
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Approved SOPs, Pricing, Services & Internal Documents
            </p>
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'assistant'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#2F6F6B]" />
            Assistant
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'documents'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'tests'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
            Quality Checks
          </button>
        </div>

        {/* Right: Role Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Shield className="h-4 w-4 text-[#2F6F6B]" />
            <span className="hidden lg:inline">Active Role:</span>
          </div>

          <div className="relative">
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="appearance-none rounded-xl border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-400 focus:border-[#2F6F6B] focus:outline-none focus:ring-1 focus:ring-[#2F6F6B]"
              aria-label="Select Active Role"
            >
              {ROLES.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name} ({r.accessText})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

