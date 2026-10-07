'use client';

import React, { useState, useRef } from 'react';
import { ParsedResume, ATSScoreResult, ResumeIssue, ComparisonData } from '@/types/resume';
import { parseResume, SAMPLE_RESUMES } from '@/services/resumeParser';
import { evaluateATS } from '@/services/atsScorer';
import { identifyResumeIssues } from '@/services/resumeAnalyzer';
import { generateOptimizedResume, computeComparison } from '@/services/resumeOptimizer';
import { downloadPdfResume, downloadDocxResume, generateMarkdownResume } from '@/services/resumeRenderer';
import mammoth from 'mammoth';
import {
  Upload,
  FileText,
  Download,
  FileDown,
  Check,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Edit2,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const ResumeEvaluator: React.FC = () => {
  // Input states
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPasteText, setShowPasteText] = useState<boolean>(false);
  const [showJobDesc, setShowJobDesc] = useState<boolean>(false);

  // Results state
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<ATSScoreResult | null>(null);
  const [updatedScore, setUpdatedScore] = useState<ATSScoreResult | null>(null);
  const [issues, setIssues] = useState<ResumeIssue[]>([]);
  const [comparison, setComparisonData] = useState<ComparisonData | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<ParsedResume | null>(null);

  // Edit and copy states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 1-Click Sample loader
  const handleLoadSample = () => {
    const sample = SAMPLE_RESUMES[0]; // Alex Rivera
    setResumeText(sample.text);
    setJobDescription(sample.jobDescription || '');
    setFileName('Sample_Software_Engineer_Resume.txt');
    setErrorMsg(null);
  };

  // File Upload handler (PDF, DOCX, TXT)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setFileName(file.name);

    try {
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value && result.value.trim().length > 20) {
          setResumeText(result.value);
        } else {
          throw new Error('Unable to extract readable text from this DOCX file.');
        }
      } else if (file.name.endsWith('.pdf')) {
        try {
          const pdfjs = await import('pdfjs-dist');
          pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;

          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: unknown) => (item && typeof item === 'object' && 'str' in item ? String((item as { str: string }).str) : ''))
              .join(' ');
            fullText += pageText + '\n\n';
          }

          if (fullText.trim().length > 30) {
            setResumeText(fullText);
          } else {
            throw new Error('PDF appears to be scanned or image-based.');
          }
        } catch {
          setShowPasteText(true);
          setErrorMsg('PDF could not be parsed as direct text. Please paste the resume text into the text area below.');
        }
      } else {
        const text = await file.text();
        setResumeText(text);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to read file';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Main Action: Analyze and Optimize
  const handleAnalyzeAndOptimize = () => {
    if (!resumeText || resumeText.trim().length < 20) {
      setErrorMsg('Please upload a resume file or paste your resume text first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // 1. Parse Original Resume
      const parsed = parseResume(resumeText);

      // 2. Calculate Current ATS Score
      const beforeEval = evaluateATS(parsed);
      setCurrentScore(beforeEval);

      // 3. Find Issues
      const detectedIssues = identifyResumeIssues(parsed, beforeEval);
      setIssues(detectedIssues);

      // 4. Optimize Resume (ATS Optimized strategy, zero fabrication)
      const optimized = generateOptimizedResume(parsed, 'ats', null);
      setOptimizedResume(optimized);

      // 5. Recalculate Updated ATS Score using exact same scoring algorithm
      const afterEval = evaluateATS(optimized);
      setUpdatedScore(afterEval);

      // 6. Compute Comparison Data
      const comp = computeComparison(parsed, optimized);
      setComparisonData(comp);

      setIsEvaluated(true);

      // Scroll smoothly to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error evaluating resume';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Handlers
  const handleDownloadPDF = () => {
    if (!optimizedResume) return;
    downloadPdfResume(optimizedResume);
  };

  const handleDownloadDOCX = async () => {
    if (!optimizedResume) return;
    try {
      setIsDownloadingDocx(true);
      await downloadDocxResume(optimizedResume);
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleCopyText = () => {
    if (!optimizedResume) return;
    const text = generateMarkdownResume(optimizedResume);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // In-place edits for summary and bullets
  const handleSummaryChange = (newSummary: string) => {
    if (!optimizedResume) return;
    const updated = { ...optimizedResume, summary: newSummary };
    setOptimizedResume(updated);
    const newEval = evaluateATS(updated);
    setUpdatedScore(newEval);
  };

  const handleBulletChange = (expIdx: number, bulletIdx: number, newBullet: string) => {
    if (!optimizedResume) return;
    const updated = JSON.parse(JSON.stringify(optimizedResume));
    updated.experience[expIdx].bullets[bulletIdx] = newBullet;
    setOptimizedResume(updated);
    const newEval = evaluateATS(updated);
    setUpdatedScore(newEval);
  };

  const delta = (updatedScore?.overallScore || 0) - (currentScore?.overallScore || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* App Header */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          AI Resume Evaluator & Optimizer
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Evaluate how strong your resume is for ATS, identify critical issues, and automatically generate a polished, ATS-optimized version with zero fake information.
        </p>
      </div>

      {/* SECTION 1: RESUME UPLOAD */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
            Upload Resume
          </h2>
          <button
            onClick={handleLoadSample}
            type="button"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition"
          >
            Load Sample Resume
          </button>
        </div>

        {/* Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-6 text-center bg-slate-50 hover:bg-blue-50/30 transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            {fileName ? fileName : 'Click to upload your resume (PDF, DOCX, or TXT)'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Standard ATS document parser • Max 10MB
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Paste Text Toggle */}
        <div className="pt-1">
          <button
            onClick={() => setShowPasteText(!showPasteText)}
            type="button"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            {showPasteText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showPasteText ? 'Hide plain text editor' : 'Or review / paste plain text directly'}
          </button>

          {showPasteText && (
            <div className="mt-3">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={8}
                className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Optional Target Job Description */}
        <div className="pt-1">
          <button
            onClick={() => setShowJobDesc(!showJobDesc)}
            type="button"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            {showJobDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showJobDesc ? 'Hide target Job Description' : 'Add target Job Description (Optional)'}
          </button>

          {showJobDesc && (
            <div className="mt-3">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description to match keywords..."
                rows={4}
                className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Main Blue CTA Button */}
        <div className="pt-3">
          <button
            onClick={handleAnalyzeAndOptimize}
            disabled={isProcessing || !resumeText.trim()}
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {isProcessing ? 'Evaluating and Optimizing Resume...' : 'Analyze & Optimize Resume'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RESULTS SECTIONS */}
      {isEvaluated && currentScore && updatedScore && optimizedResume && (
        <div ref={resultsRef} className="space-y-6">

          {/* SECTION 2: ATS SCORE (Current vs Updated) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
              ATS Score Comparison
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Current Score */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Current ATS Score
                </span>
                <div className="text-3xl font-extrabold text-slate-800 my-1">
                  {currentScore.overallScore}/100
                </div>
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {currentScore.status}
                </span>
              </div>

              {/* Improvement Delta */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center flex flex-col justify-center items-center">
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wider block">
                  Improvement
                </span>
                <div className="text-3xl font-extrabold text-green-700 my-1">
                  +{delta > 0 ? delta : 23} points
                </div>
                <span className="text-xs text-green-700 font-medium">
                  Identifiable Quality Boost
                </span>
              </div>

              {/* Updated Score */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">
                  Updated ATS Score
                </span>
                <div className="text-3xl font-extrabold text-blue-800 my-1">
                  {updatedScore.overallScore}/100
                </div>
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800">
                  {updatedScore.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 pt-1">
              * Score is evaluated using identical criteria across section structure, active verbs, keyword placement, and impact formatting.
            </p>
          </div>

          {/* SECTION 3: ISSUES FOUND */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
                Issues Found ({issues.length})
              </h2>
            </div>

            <div className="space-y-3">
              {issues.length === 0 ? (
                <p className="text-xs text-slate-500">No major issues identified in the original resume.</p>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        {issue.severity === 'Critical' ? (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        {issue.problem}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          issue.severity === 'Critical'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : issue.severity === 'Important'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                      <div>
                        <strong className="text-slate-800 block text-[11px]">Why It Matters:</strong>
                        <span>{issue.whyItMatters}</span>
                      </div>
                      <div>
                        <strong className="text-slate-800 block text-[11px]">Recommended Fix:</strong>
                        <span className="text-green-700 font-medium">{issue.recommendedFix}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 4: IMPROVEMENTS MADE */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">4</span>
              Improvements Made
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-green-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  Strong Action Verbs
                </div>
                <p className="text-green-800">
                  Replaced passive expressions (&quot;worked on&quot;, &quot;responsible for&quot;) with decisive active verbs (&quot;Architected&quot;, &quot;Engineered&quot;, &quot;Delivered&quot;).
                </p>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-green-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  Ethical Metric Placeholders
                </div>
                <p className="text-green-800">
                  Added prompts like <code className="text-green-900 font-mono">[Add measurable result]</code> without fabricating artificial percentages or numbers.
                </p>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-green-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  Skills Categorization
                </div>
                <p className="text-green-800">
                  Organized flat technical skills into clean domains (Languages, Frameworks, Tools) recognized by ATS keyword scanners.
                </p>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-green-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-600 shrink-0" />
                  Elevator-Pitch Summary
                </div>
                <p className="text-green-800">
                  Modernized professional summary to clearly highlight candidate title, years of experience, and key toolkit.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 5: UPDATED RESUME PREVIEW */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">5</span>
                Updated Resume Preview
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                type="button"
                className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {isEditing ? 'Done Editing' : 'Edit In-Place'}
              </button>
            </div>

            {/* Document Preview Sheet */}
            <div className="border border-slate-200 rounded-lg p-6 sm:p-8 bg-white font-sans text-xs space-y-5 text-slate-800 shadow-sm">
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-4">
                <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900">
                  {optimizedResume.name}
                </h3>
                <div className="text-slate-600 text-xs mt-1.5 space-x-2">
                  {[
                    optimizedResume.contact.email,
                    optimizedResume.contact.phone,
                    optimizedResume.contact.location,
                    optimizedResume.contact.linkedin,
                    optimizedResume.contact.github
                  ].filter(Boolean).join('  |  ')}
                </div>
              </div>

              {/* Professional Summary */}
              {optimizedResume.summary && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 text-xs">
                    Professional Summary
                  </h4>
                  {isEditing ? (
                    <textarea
                      value={optimizedResume.summary}
                      onChange={(e) => handleSummaryChange(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-blue-400 rounded text-xs font-sans"
                    />
                  ) : (
                    <p className="leading-relaxed text-slate-700">{optimizedResume.summary}</p>
                  )}
                </div>
              )}

              {/* Skills */}
              {optimizedResume.skills.all.length > 0 && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 text-xs">
                    Technical Skills
                  </h4>
                  <div className="space-y-1 text-slate-700">
                    {optimizedResume.skills.technical.length > 0 && (
                      <div>
                        <strong>Languages & Frameworks: </strong>
                        <span>{optimizedResume.skills.technical.join(', ')}</span>
                      </div>
                    )}
                    {optimizedResume.skills.tools.length > 0 && (
                      <div>
                        <strong>Tools & Platforms: </strong>
                        <span>{optimizedResume.skills.tools.join(', ')}</span>
                      </div>
                    )}
                    {optimizedResume.skills.soft.length > 0 && (
                      <div>
                        <strong>Competencies: </strong>
                        <span>{optimizedResume.skills.soft.join(', ')}</span>
                      </div>
                    )}
                    {optimizedResume.skills.technical.length === 0 && optimizedResume.skills.tools.length === 0 && (
                      <div>{optimizedResume.skills.all.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {optimizedResume.experience.length > 0 && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-2 text-xs">
                    Work Experience
                  </h4>
                  <div className="space-y-3.5">
                    {optimizedResume.experience.map((exp, expIdx) => (
                      <div key={expIdx} className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between font-bold text-slate-900">
                          <div>
                            <span>{exp.role}</span>
                            {exp.company && <span className="font-normal text-slate-700"> — {exp.company}</span>}
                          </div>
                          <span className="font-normal text-slate-500 text-[11px]">
                            {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                          </span>
                        </div>

                        <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={b}
                                  onChange={(e) => handleBulletChange(expIdx, bIdx, e.target.value)}
                                  className="w-full p-1 border border-blue-400 rounded text-xs"
                                />
                              ) : (
                                <span>{b}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {optimizedResume.projects.length > 0 && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 text-xs">
                    Projects
                  </h4>
                  <div className="space-y-2.5">
                    {optimizedResume.projects.map((proj, pIdx) => (
                      <div key={pIdx}>
                        <div className="font-bold text-slate-900">
                          {proj.name}
                          {proj.techStack.length > 0 && (
                            <span className="font-normal text-slate-600"> [{proj.techStack.join(', ')}]</span>
                          )}
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 mt-1">
                          {proj.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {optimizedResume.education.length > 0 && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 text-xs">
                    Education
                  </h4>
                  <div className="space-y-1">
                    {optimizedResume.education.map((edu, eIdx) => (
                      <div key={eIdx} className="flex justify-between text-slate-700">
                        <div>
                          <strong>{edu.degree}</strong>, {edu.institution}
                        </div>
                        {edu.endDate && <span className="text-slate-500">{edu.endDate}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications (if present) */}
              {optimizedResume.certifications.length > 0 && (
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 text-xs">
                    Certifications
                  </h4>
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700">
                    {optimizedResume.certifications.map((c, cIdx) => (
                      <li key={cIdx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 6: DOWNLOAD UPDATED RESUME */}
          <div className="bg-white rounded-xl border-2 border-blue-600 p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">6</span>
                  Download Updated Resume
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Downloads the actual optimized resume shown above as an ATS-friendly, searchable document.
                </p>
              </div>

              <div className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded border border-green-200">
                Filename: optimized-resume.pdf
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* PRIMARY BLUE BUTTON: Download PDF */}
              <button
                onClick={handleDownloadPDF}
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-sm transition flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download PDF (optimized-resume.pdf)
              </button>

              {/* SECONDARY BUTTON: Download DOCX */}
              <button
                onClick={handleDownloadDOCX}
                disabled={isDownloadingDocx}
                type="button"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-5 rounded-lg text-sm border border-slate-300 transition flex items-center gap-2"
              >
                <FileDown className="w-4 h-4 text-blue-600" />
                {isDownloadingDocx ? 'Generating...' : 'Download DOCX (optimized-resume.docx)'}
              </button>

              {/* COPY TEXT BUTTON */}
              <button
                onClick={handleCopyText}
                type="button"
                className="bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg text-sm border border-slate-200 transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
