'use client';

import React, { useState } from 'react';
import { ResumeIssue } from '@/types/resume';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Filter, Sparkles, ArrowRight } from 'lucide-react';

interface IssueListProps {
  issues: ResumeIssue[];
  onOptimizeClick?: () => void;
}

export const IssueList: React.FC<IssueListProps> = ({ issues, onOptimizeClick }) => {
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Important' | 'Minor'>('All');

  const criticalCount = issues.filter(i => i.severity === 'Critical').length;
  const importantCount = issues.filter(i => i.severity === 'Important').length;
  const minorCount = issues.filter(i => i.severity === 'Minor').length;

  const filteredIssues = issues.filter(i => {
    if (filter === 'All') return true;
    return i.severity === filter;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
          pill: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
          border: 'border-l-rose-500'
        };
      case 'Important':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          pill: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
          border: 'border-l-amber-500'
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
          pill: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900',
          border: 'border-l-sky-500'
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            Detected Issues & Friction Points
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {issues.length} specific issues affecting recruiter review and automated screening
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All ({issues.length})
          </button>
          <button
            onClick={() => setFilter('Critical')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === 'Critical'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setFilter('Important')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === 'Important'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          >
            Important ({importantCount})
          </button>
          <button
            onClick={() => setFilter('Minor')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filter === 'Minor'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300'
            }`}
          >
            Minor ({minorCount})
          </button>
        </div>
      </div>

      {/* Issues Cards */}
      <div className="mt-4 space-y-3.5">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No {filter !== 'All' ? filter : ''} issues detected in this category.
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const styling = getSeverityBadge(issue.severity);

            return (
              <div
                key={issue.id}
                className={`rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 border-l-4 ${styling.border} dark:border-slate-800 dark:bg-slate-800/40 transition-all hover:bg-white dark:hover:bg-slate-800/80`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {styling.icon}
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {issue.problem}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {issue.sectionTarget && (
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 dark:text-slate-300 px-2 py-0.5 rounded">
                        {issue.sectionTarget}
                      </span>
                    )}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${styling.pill}`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="rounded-lg bg-white dark:bg-slate-900/60 p-3 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-rose-600 dark:text-rose-400 block mb-1">
                      Why It Matters:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {issue.whyItMatters}
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 p-3 border border-emerald-100 dark:border-emerald-900/50">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Recommended Fix:
                    </span>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      {issue.recommendedFix}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {onOptimizeClick && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Our AI optimizer can automatically resolve these issues with 1 click.
          </p>
          <button
            onClick={onOptimizeClick}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all hover:shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Fix All Issues Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
