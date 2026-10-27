'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { AssistantTab } from '@/components/AssistantTab';
import { DocumentsTab } from '@/components/DocumentsTab';
import { QualityChecksTab } from '@/components/QualityChecksTab';
import { Footer } from '@/components/Footer';
import { Role } from '@/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'documents' | 'tests'>('assistant');
  const [currentRole, setCurrentRole] = useState<Role>('Intern');

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation Bar with Role Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {activeTab === 'assistant' && (
          <AssistantTab currentRole={currentRole} setCurrentRole={setCurrentRole} />
        )}
        {activeTab === 'documents' && <DocumentsTab currentRole={currentRole} />}
        {activeTab === 'tests' && <QualityChecksTab />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

