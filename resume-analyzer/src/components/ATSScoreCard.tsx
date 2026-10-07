'use client';

import React from 'react';
import { ATSScoreResult } from '@/types/resume';
import { Award, CheckCircle2, AlertTriangle, TrendingUp, Sparkles, FileText, Target } from 'lucide-react';

interface ATSScoreCardProps {
  scoreResult: ATSScoreResult;
  title?: string;
  subtitle?: string;
  comparisonScore?: ATSScoreResult;
  isOptimized?: boolean;
}

export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({
  scoreResult,
  title = 'ATS Readiness Score',
  subtitle = 'Comprehensive algorithmic ATS compatibility rating',
  comparisonScore,
  isOptimized = false
}) => {
  const { overallScore, status, metrics } = scoreResult;

  // Status colors & gradients
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Excellent':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          stroke: '#10b981',
          gradient: 'from-emerald-500 to-teal-500',
          text: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'Good':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
          stroke: '#3b82f6',
          gradient: 'from-blue-500 to-indigo-500',
          text: 'text-blue-600 dark:text-blue-400'
        };
      case 'Needs Improvement':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          stroke: '#f59e0b',
          gradient: 'from-amber-500 to-orange-500',
          text: 'text-amber-600 dark:text-amber-400'
        };
      default:
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          stroke: '#f43f5e',
          gradient: 'from-rose-500 to-pink-500',
          text: 'text-rose-600 dark:text-rose-400'
        };
    }
  };

  const statusConfig = getStatusColor(status);

  // SVG Circular Meter Calculation
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const delta = comparisonScore ? overallScore - comparisonScore.overallScore : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
      {/* Top Banner if Optimized */}
      {isOptimized && (
        <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 py-1 px-4 text-center text-xs font-semibold uppercase tracking-wider text-white shadow-sm flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Optimized Verification Run
        </div>
      )}

      <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 ${isOptimized ? 'pt-4' : ''}`}>
        {/* Left: Score Details */}
        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.bg}`}>
              {status === 'Excellent' ? <Award className="w-3.5 h-3.5" /> : status === 'Good' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {status}
            </span>
            {delta > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700">
                <TrendingUp className="w-3 h-3" />
                +{delta} pts
              </span>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              {metrics.wordCount} Words
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              {metrics.quantifiedBulletCount}/{metrics.bulletCount} Quantified Bullets
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              {metrics.actionVerbCount} Action Verbs
            </span>
          </div>
        </div>

        {/* Right: Circular Progress Meter */}
        <div className="relative flex items-center justify-center">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={statusConfig.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {overallScore}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
