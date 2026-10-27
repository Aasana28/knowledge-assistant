import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brightwave Knowledge Assistant | Internal SOP & Knowledge Base',
  description:
    'Internal company knowledge assistant over approved SOPs, pricing rules, and strategic documents with strict role-based access boundaries and verified citations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-[#2F6F6B]/20 selection:text-[#2F6F6B]">
        {children}
      </body>
    </html>
  );
}

