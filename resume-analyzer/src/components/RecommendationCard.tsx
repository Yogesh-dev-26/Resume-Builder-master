'use client';

import React from 'react';
import { ResumeVersionOption } from '@/types/resume';
import { Award, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface RecommendationCardProps {
  recommendedVersion: ResumeVersionOption;
  recommendationReason: string;
  onSelectVersion: (id: ResumeVersionOption['id']) => void;
  selectedVersionId: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendedVersion,
  recommendationReason,
  onSelectVersion,
  selectedVersionId
}) => {
  const isSelected = selectedVersionId === recommendedVersion.id;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/80 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 p-6 shadow-md dark:border-indigo-500/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20">
      {/* Top Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 text-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Recommended Version: {recommendedVersion.name.split('—')[1]?.trim() || recommendedVersion.name}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-100/90 dark:bg-emerald-950/80 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
          <ShieldCheck className="w-4 h-4" />
          Zero Fabrication Verified
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {recommendedVersion.name}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {recommendationReason}
        </p>
      </div>

      {/* Mini Score Pill Matrix */}
      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="rounded-xl bg-white dark:bg-slate-800 p-3 text-center border border-slate-200/80 dark:border-slate-700">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            ATS Score
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {recommendedVersion.atsScore}/100
          </span>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 p-3 text-center border border-slate-200/80 dark:border-slate-700">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Job Match
          </span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400">
            {recommendedVersion.jobMatchScore}/100
          </span>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 p-3 text-center border border-slate-200/80 dark:border-slate-700">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Readability
          </span>
          <span className="text-xl font-black text-purple-600 dark:text-purple-400">
            {recommendedVersion.readabilityScore}/100
          </span>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          All original accomplishments preserved & sharpened
        </div>
        <button
          onClick={() => onSelectVersion(recommendedVersion.id)}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm ${
            isSelected
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isSelected ? 'Currently Viewing This Version' : 'Switch To Recommended Version'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
