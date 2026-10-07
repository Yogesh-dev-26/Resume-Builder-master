'use client';

import React from 'react';
import { ResumeVersionOption } from '@/types/resume';
import { CheckCircle2, Star, Sparkles, Layers, Eye } from 'lucide-react';

interface ResumeOptimizerProps {
  versions: ResumeVersionOption[];
  selectedVersionId: string;
  recommendedId: string;
  onSelectVersion: (id: ResumeVersionOption['id']) => void;
}

export const ResumeOptimizer: React.FC<ResumeOptimizerProps> = ({
  versions,
  selectedVersionId,
  recommendedId,
  onSelectVersion
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
            Optimization Strategies
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Compare Resume Variations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select the optimization blueprint tailored to your application channel
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-semibold">Strategy & Blueprint</th>
              <th className="py-3 px-4 font-semibold text-center">ATS Score</th>
              <th className="py-3 px-4 font-semibold text-center">Job Match</th>
              <th className="py-3 px-4 font-semibold text-center">Readability</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {versions.map((ver) => {
              const isSelected = selectedVersionId === ver.id;
              const isRecommended = recommendedId === ver.id;

              return (
                <tr
                  key={ver.id}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {ver.name}
                      </span>
                      {isRecommended && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-bold dark:bg-indigo-900/60 dark:text-indigo-300">
                          <Star className="w-3 h-3 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-1">
                      {ver.tagline}
                    </p>
                  </td>

                  {/* ATS Score */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 font-bold text-xs dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                      {ver.atsScore}/100
                    </span>
                  </td>

                  {/* Job Match */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 font-bold text-xs dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
                      {ver.jobMatchScore}/100
                    </span>
                  </td>

                  {/* Readability */}
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block rounded-md bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 font-bold text-xs dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800">
                      {ver.readabilityScore}/100
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => onSelectVersion(ver.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isSelected ? 'Viewing' : 'Select'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
