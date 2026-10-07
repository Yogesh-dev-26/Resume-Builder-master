'use client';

import React from 'react';
import { ResumeEvaluator } from '@/components/ResumeEvaluator';
import { FileText, ExternalLink } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Minimal Top Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900">
                Resume Evaluator
              </span>
              <span className="text-[11px] text-slate-500 block -mt-0.5">
                ATS Quality & Optimization
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <a
              href="/index.html"
              className="hover:text-blue-600 transition flex items-center gap-1"
            >
              Resume Templates
            </a>
            <a
              href="/Form.html"
              className="hover:text-blue-600 transition flex items-center gap-1"
            >
              Classic Builder <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <ResumeEvaluator />
      </main>

      {/* Minimal Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-4xl mx-auto px-4">
          <p>
            Resume Evaluator & Optimizer • Algorithmic ATS scoring with 100% truthful improvement.
          </p>
        </div>
      </footer>
    </div>
  );
}
