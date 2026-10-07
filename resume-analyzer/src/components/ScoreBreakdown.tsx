'use client';

import React, { useState } from 'react';
import { ATSScoreBreakdown, ATSScoreFactor } from '@/types/resume';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, HelpCircle, Lightbulb, ShieldCheck } from 'lucide-react';

interface ScoreBreakdownProps {
  factors: ATSScoreBreakdown;
  comparisonFactors?: ATSScoreBreakdown;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ factors, comparisonFactors }) => {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  const factorList: ATSScoreFactor[] = Object.values(factors);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'Needs Improvement':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ATS Quality Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Detailed evaluation across 8 algorithmic parsing parameters
          </p>
        </div>
        <span className="text-xs font-medium text-slate-400">
          8 Evaluation Factors
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
        {factorList.map((factor) => {
          const isExpanded = expandedFactor === factor.id;
          const compFactor = comparisonFactors ? (comparisonFactors as unknown as Record<string, ATSScoreFactor>)[factor.id] : null;
          const delta = compFactor ? factor.score - compFactor.score : 0;

          return (
            <div key={factor.id} className="py-3.5 transition-colors">
              {/* Row Header */}
              <div
                onClick={() => setExpandedFactor(isExpanded ? null : factor.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {factor.name}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(factor.status)}`}>
                      {factor.status}
                    </span>
                    {delta > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded dark:bg-emerald-950/60 dark:text-emerald-300">
                        +{delta}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 w-full max-w-md bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressBarColor(factor.score)}`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-10">
                      {factor.score}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 text-xs gap-1">
                  <span>{isExpanded ? 'Less info' : 'View details'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in duration-200">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 space-y-1.5 border border-slate-100 dark:border-slate-800">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                      Factor Explanation
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {factor.explanation}
                    </p>
                  </div>

                  <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 space-y-1.5 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      How To Improve
                    </div>
                    <p className="text-indigo-950/80 dark:text-indigo-200 leading-relaxed">
                      {factor.improvementTip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
