'use client';

import React from 'react';
import { JobMatchResult } from '@/types/resume';
import { Target, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Sparkles, Briefcase } from 'lucide-react';

interface JobMatchAnalysisProps {
  jobMatch: JobMatchResult | null;
  onAddJobDescription?: () => void;
}

export const JobMatchAnalysis: React.FC<JobMatchAnalysisProps> = ({ jobMatch, onAddJobDescription }) => {
  if (!jobMatch) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <Target className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No Job Description Provided
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Paste the target Job Description to compare candidate keywords, calculate match score, and uncover specific experience gaps.
        </p>
        {onAddJobDescription && (
          <button
            onClick={onAddJobDescription}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Paste Job Description
          </button>
        )}
      </div>
    );
  }

  const { matchScore, jobTitle, matchingSkills, missingSkills, matchingKeywords, missingKeywords, experienceGaps } = jobMatch;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Target className="w-4 h-4" />
            Target Role Alignment
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {jobTitle || 'Target Requisition Match'}
          </h3>
        </div>

        {/* Match Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Match Score
            </span>
            <span className={`text-2xl font-black ${matchScore >= 80 ? 'text-emerald-600' : matchScore >= 65 ? 'text-blue-600' : 'text-amber-600'}`}>
              {matchScore}<span className="text-sm font-semibold text-slate-400">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Skills & Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Matching Skills */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Matching Skills ({matchingSkills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matchingSkills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No direct matching skills detected.</span>
            ) : (
              matchingSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-emerald-100/80 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-medium dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800"
                >
                  ✓ {s}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Missing / Weak Skills */}
        <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-3">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Missing / Weak Skills ({missingSkills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.length === 0 ? (
              <span className="text-xs text-emerald-600 font-medium">All required skills are present in resume!</span>
            ) : (
              missingSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-rose-100/80 text-rose-800 border border-rose-200 px-2.5 py-1 text-xs font-medium dark:bg-rose-900/50 dark:text-rose-200 dark:border-rose-800"
                >
                  + {s}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Matching Keywords */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-3">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Matching Role Keywords ({matchingKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matchingKeywords.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No matching keywords found.</span>
            ) : (
              matchingKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-blue-100/80 text-blue-800 border border-blue-200 px-2.5 py-1 text-xs font-medium dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800"
                >
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Missing Important Keywords */}
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Missing Important Keywords ({missingKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.length === 0 ? (
              <span className="text-xs text-emerald-600 font-medium">Full keyword coverage achieved!</span>
            ) : (
              missingKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-amber-100/80 text-amber-800 border border-amber-200 px-2.5 py-1 text-xs font-medium dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-800"
                >
                  {kw}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Experience Gaps & Honest AI Notice */}
      {experienceGaps.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Identified Experience Gaps & Recommendations
          </h4>

          <div className="space-y-2.5">
            {experienceGaps.map((gap, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
              >
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {gap.requirement}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {gap.gapExplanation}
                </p>
                <div className="mt-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                  <span className="font-semibold block mb-0.5">Ethical Recommendation:</span>
                  {gap.advice}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2.5 dark:bg-amber-950/30 dark:border-amber-800/60 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Strict Integrity Guarantee:</strong> We will never fabricate or add skills that you do not possess. If you have verifiable experience with the missing skills above, we encourage you to incorporate them into your work experience bullets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
