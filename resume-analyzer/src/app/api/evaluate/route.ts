import { evaluateATS } from '@/services/atsScorer';
import { matchJobDescription } from '@/services/jobMatcher';
import { identifyResumeIssues } from '@/services/resumeAnalyzer';
import { generateAllVersions } from '@/services/resumeOptimizer';
import { parseResume } from '@/services/resumeParser';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, jobDescription } = body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide valid resume text or upload a document.' },
        { status: 400 }
      );
    }

    // 1. Parse Resume
    const parsedResume = parseResume(resumeText);

    // 2. Evaluate ATS Score (Before)
    const initialATSScore = evaluateATS(parsedResume);

    // 3. Identify Issues
    const issues = identifyResumeIssues(parsedResume, initialATSScore);

    // 4. Match Job Description (if provided)
    const jobMatch = jobDescription ? matchJobDescription(parsedResume, jobDescription) : null;

    // 5. Generate Optimized Versions (A: ATS, B: Recruiter, C: Job-Targeted)
    const { versions, recommendedId, recommendationReason } = generateAllVersions(parsedResume, jobMatch);

    return NextResponse.json({
      success: true,
      parsedResume,
      initialATSScore,
      issues,
      jobMatch,
      versions,
      recommendedId,
      recommendationReason
    });
  } catch (error: unknown) {
    console.error('API Evaluation Error:', error);
    const message = error instanceof Error ? error.message : 'Evaluation error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
