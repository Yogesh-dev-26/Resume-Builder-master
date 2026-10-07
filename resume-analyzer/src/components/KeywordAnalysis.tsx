'use client';

import React from 'react';
import { ParsedResume } from '@/types/resume';
import { KeyRound, Layers, Wrench, Users, CheckCircle2 } from 'lucide-react';

interface KeywordAnalysisProps {
  resume: ParsedResume;
}

export const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ resume }) => {
  const { skills } = resume;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-500" />
            Resume Keyword Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {skills.all.length} total keywords detected and mapped across core domains
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Languages & Frameworks */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Languages & Tech ({skills.technical.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.technical.length === 0 ? (
              <span className="text-xs text-slate-400 italic">None detected</span>
            ) : (
              skills.technical.map((tech, i) => (
                <span
                  key={i}
                  className="rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 text-xs font-medium dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
                >
                  {tech}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Tools & Infrastructure */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Tools & Platforms ({skills.tools.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.tools.length === 0 ? (
              <span className="text-xs text-slate-400 italic">None detected</span>
            ) : (
              skills.tools.map((tool, i) => (
                <span
                  key={i}
                  className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 text-xs font-medium dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                >
                  {tool}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Professional & Soft Competencies */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-purple-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Competencies & Soft Skills ({skills.soft.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.soft.length === 0 ? (
              <span className="text-xs text-slate-400 italic">None detected</span>
            ) : (
              skills.soft.map((soft, i) => (
                <span
                  key={i}
                  className="rounded-md bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 text-xs font-medium dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                >
                  {soft}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          Keywords are analyzed in real-time. In the optimized resume, all detected technical skills are formatted into clean standardized bullet tags recognized by modern ATS scanners.
        </span>
      </div>
    </div>
  );
};
