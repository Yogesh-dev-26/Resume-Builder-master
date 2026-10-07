'use client';

import React from 'react';
import { ComparisonData } from '@/types/resume';
import { TrendingUp, ArrowRight, CheckCircle2, Zap, Sparkles } from 'lucide-react';

interface ResumeComparisonProps {
  comparison: ComparisonData;
}

export const ResumeComparison: React.FC<ResumeComparisonProps> = ({ comparison }) => {
  const { beforeScore, afterScore, deltaScore, categoryDeltas, improvements } = comparison;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            Empirical Comparison
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Before vs. After Optimization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculated by running the identical 8-factor ATS scoring algorithm on both resume versions
          </p>
        </div>
      </div>

      {/* Main Score Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Before Score */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40 text-center flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Original Resume
            </span>
            <div className="text-4xl font-extrabold text-slate-700 dark:text-slate-300 my-2">
              {beforeScore.overallScore}
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </div>
          </div>
          <span className="inline-block mx-auto text-xs font-medium text-slate-500 bg-slate-200/60 dark:bg-slate-700/60 px-2.5 py-1 rounded-full">
            Status: {beforeScore.status}
          </span>
        </div>

        {/* Arrow & Delta */}
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-500/10 to-teal-500/10 p-5 dark:border-emerald-800/60 dark:bg-emerald-950/20 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            +{deltaScore} points
          </div>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-1 uppercase tracking-wider">
            Overall Score Boost
          </span>
        </div>

        {/* After Score */}
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30 text-center flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Optimized Resume
            </div>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-300 my-2">
              {afterScore.overallScore}
              <span className="text-sm font-semibold text-emerald-600/60">/100</span>
            </div>
          </div>
          <span className="inline-block mx-auto text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700">
            Status: {afterScore.status}
          </span>
        </div>
      </div>

      {/* Category-by-Category Progress Bar Deltas */}
      <div className="mt-8">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-500" />
          Category Performance Gains
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryDeltas.map((cat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200/70 bg-slate-50/40 p-3.5 dark:border-slate-800 dark:bg-slate-800/30 text-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {cat.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">
                    {cat.before} → <span className="font-bold text-slate-700 dark:text-slate-100">{cat.after}</span>
                  </span>
                  {cat.delta > 0 && (
                    <span className="font-bold text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded text-[11px] dark:bg-emerald-900/60 dark:text-emerald-300">
                      +{cat.delta}
                    </span>
                  )}
                </div>
              </div>

              {/* Dual Visual Bar: Before vs After */}
              <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{ width: `${cat.before}%` }}
                  />
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${cat.after}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Improvements Unpacked */}
      <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          What Caused The Improvement
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {improvements.map((imp, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  {imp.title}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full dark:bg-emerald-900/60 dark:text-emerald-300">
                  {imp.impact} Impact
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                {imp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
