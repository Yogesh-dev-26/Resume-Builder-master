'use client';

import React, { useState } from 'react';
import { ParsedResume } from '@/types/resume';
import { downloadDocxResume, generateMarkdownResume } from '@/services/resumeRenderer';
import {
  Download,
  FileDown,
  Printer,
  Copy,
  Check,
  Edit3,
  RotateCcw,
  Sparkles,
  CheckCheck,
  X,
  ExternalLink,
  Save
} from 'lucide-react';

interface OptimizedResumePreviewProps {
  resume: ParsedResume;
  onUpdateResume?: (updated: ParsedResume) => void;
}

export const OptimizedResumePreview: React.FC<OptimizedResumePreviewProps> = ({
  resume,
  onUpdateResume
}) => {
  const [activeResume, setActiveResume] = useState<ParsedResume>(resume);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  // Sync when prop changes
  React.useEffect(() => {
    setActiveResume(resume);
  }, [resume]);

  // Handle in-place bullet editing
  const handleBulletChange = (expIdx: number, bulletIdx: number, newValue: string) => {
    const updated = JSON.parse(JSON.stringify(activeResume));
    updated.experience[expIdx].bullets[bulletIdx] = newValue;
    setActiveResume(updated);
    if (onUpdateResume) onUpdateResume(updated);
  };

  // Revert bullet to original
  const handleRevertBullet = (expIdx: number, bulletIdx: number) => {
    const orig = activeResume.experience[expIdx].originalBullets?.[bulletIdx];
    if (orig) {
      handleBulletChange(expIdx, bulletIdx, orig);
    }
  };

  // Handle in-place summary edit
  const handleSummaryChange = (newSummary: string) => {
    const updated = { ...activeResume, summary: newSummary };
    setActiveResume(updated);
    if (onUpdateResume) onUpdateResume(updated);
  };

  const handleDownloadDocx = async () => {
    try {
      setIsDownloadingDocx(true);
      await downloadDocxResume(activeResume);
    } catch (err) {
      console.error('Docx download error:', err);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownResume(activeResume);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-bold dark:bg-emerald-950/60 dark:text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            ATS-Standardized Layout
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              isEditing
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Finish Editing' : 'Edit Resume'}
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Text!' : 'Copy Text'}
          </button>

          <button
            onClick={handleDownloadDocx}
            disabled={isDownloadingDocx}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            {isDownloadingDocx ? 'Generating...' : 'Download DOCX'}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-white px-4 py-1.5 text-xs font-bold hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Download / Print PDF
          </button>
        </div>
      </div>

      {/* Professional Resume Sheet */}
      <div
        id="printable-resume"
        className="rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-md dark:border-slate-800 dark:bg-white dark:text-slate-900 font-sans leading-normal max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Name & Contact Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            {activeResume.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2 font-medium">
            {activeResume.contact.email && <span>{activeResume.contact.email}</span>}
            {activeResume.contact.phone && <span>• {activeResume.contact.phone}</span>}
            {activeResume.contact.location && <span>• {activeResume.contact.location}</span>}
            {activeResume.contact.linkedin && <span>• {activeResume.contact.linkedin}</span>}
            {activeResume.contact.github && <span>• {activeResume.contact.github}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        {activeResume.summary && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5">
              Professional Summary
            </h2>
            {isEditing ? (
              <textarea
                value={activeResume.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                rows={3}
                className="w-full text-xs p-2 rounded border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed text-justify">
                {activeResume.summary}
              </p>
            )}
          </div>
        )}

        {/* Technical Skills */}
        {activeResume.skills.all.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5">
              Technical Skills
            </h2>
            <div className="text-xs text-slate-700 space-y-1">
              {activeResume.skills.technical.length > 0 && (
                <div>
                  <strong className="font-semibold text-slate-900">Languages & Frameworks: </strong>
                  <span>{activeResume.skills.technical.join(', ')}</span>
                </div>
              )}
              {activeResume.skills.tools.length > 0 && (
                <div>
                  <strong className="font-semibold text-slate-900">Tools & Platforms: </strong>
                  <span>{activeResume.skills.tools.join(', ')}</span>
                </div>
              )}
              {activeResume.skills.soft.length > 0 && (
                <div>
                  <strong className="font-semibold text-slate-900">Professional Competencies: </strong>
                  <span>{activeResume.skills.soft.join(', ')}</span>
                </div>
              )}
              {activeResume.skills.technical.length === 0 && activeResume.skills.tools.length === 0 && (
                <div>{activeResume.skills.all.join(', ')}</div>
              )}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {activeResume.experience.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5">
              Work Experience
            </h2>

            <div className="space-y-4">
              {activeResume.experience.map((exp, expIdx) => (
                <div key={exp.id || expIdx}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{exp.role}</span>
                      <span className="text-slate-700"> | {exp.company}</span>
                      {exp.location && <span className="text-slate-500"> — {exp.location}</span>}
                    </div>
                    <div className="text-slate-600 font-medium text-[11px]">
                      {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                    </div>
                  </div>

                  <ul className="list-disc list-outside ml-4 mt-1.5 space-y-1.5 text-xs text-slate-700 leading-relaxed">
                    {exp.bullets.map((bullet, bulletIdx) => {
                      const isModified = exp.originalBullets?.[bulletIdx] && exp.originalBullets[bulletIdx] !== bullet;

                      return (
                        <li key={bulletIdx} className="group relative">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => handleBulletChange(expIdx, bulletIdx, e.target.value)}
                                className="w-full text-xs p-1 rounded border border-indigo-300 font-sans"
                              />
                              {isModified && (
                                <button
                                  onClick={() => handleRevertBullet(expIdx, bulletIdx)}
                                  title="Revert to original text"
                                  className="text-slate-400 hover:text-slate-700 shrink-0"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <span>{bullet}</span>
                              {isModified && (
                                <button
                                  onClick={() => handleRevertBullet(expIdx, bulletIdx)}
                                  className="opacity-0 group-hover:opacity-100 transition text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 shrink-0 print:hidden"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Revert
                                </button>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {activeResume.projects.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5">
              Projects
            </h2>

            <div className="space-y-3">
              {activeResume.projects.map((proj, pIdx) => (
                <div key={proj.id || pIdx}>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">{proj.name}</span>
                    {proj.techStack.length > 0 && (
                      <span className="text-slate-600 font-normal"> | {proj.techStack.join(', ')}</span>
                    )}
                  </div>

                  <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs text-slate-700 leading-relaxed">
                    {proj.bullets.map((bullet, bIdx) => (
                      <li key={bIdx}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {activeResume.education.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5">
              Education
            </h2>

            <div className="space-y-1.5 text-xs text-slate-700">
              {activeResume.education.map((edu, eIdx) => (
                <div key={edu.id || eIdx} className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <strong className="font-semibold text-slate-900">{edu.degree}</strong>
                    <span> — {edu.institution}</span>
                  </div>
                  {edu.endDate && <span className="text-slate-600 text-[11px]">{edu.endDate}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications (if present) */}
        {activeResume.certifications.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5">
              Certifications
            </h2>
            <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs text-slate-700">
              {activeResume.certifications.map((cert, cIdx) => (
                <li key={cIdx}>{cert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Achievements (if present) */}
        {activeResume.achievements.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2.5">
              Achievements & Honors
            </h2>
            <ul className="list-disc list-outside ml-4 mt-1 space-y-1 text-xs text-slate-700">
              {activeResume.achievements.map((ach, aIdx) => (
                <li key={aIdx}>{ach}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
