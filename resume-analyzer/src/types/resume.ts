export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  website: string;
}

export interface WorkExperienceItem {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  bullets: string[];
  originalBullets?: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  highlights?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  techStack: string[];
  bullets: string[];
  originalBullets?: string[];
  link?: string;
}

export interface SkillsCategorized {
  technical: string[];
  tools: string[];
  soft: string[];
  domain: string[];
  all: string[];
}

export interface ParsedResume {
  name: string;
  contact: ContactInfo;
  summary: string;
  originalSummary?: string;
  skills: SkillsCategorized;
  experience: WorkExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  links: string[];
  rawText: string;
}

export type ScoreStatus = 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';

export interface ATSScoreFactor {
  id: string;
  name: string;
  score: number; // 0 - 100
  weight: number; // e.g. 0.15
  status: ScoreStatus;
  explanation: string;
  improvementTip: string;
}

export interface ATSScoreBreakdown {
  atsCompatibility: ATSScoreFactor;
  keywordOptimization: ATSScoreFactor;
  skillsMatch: ATSScoreFactor;
  experienceQuality: ATSScoreFactor;
  achievementImpact: ATSScoreFactor;
  formatting: ATSScoreFactor;
  resumeStructure: ATSScoreFactor;
  readability: ATSScoreFactor;
}

export interface ResumeMetrics {
  wordCount: number;
  readingTimeMinutes: number;
  bulletCount: number;
  actionVerbCount: number;
  quantifiedBulletCount: number;
  sectionCount: number;
  skillsCount: number;
}

export interface ATSScoreResult {
  overallScore: number; // 0 - 100
  status: ScoreStatus;
  factors: ATSScoreBreakdown;
  strengths: string[];
  metrics: ResumeMetrics;
}

export type IssueSeverity = 'Critical' | 'Important' | 'Minor';
export type IssueCategory = 'formatting' | 'sections' | 'keywords' | 'content' | 'grammar' | 'quantification';

export interface ResumeIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  problem: string;
  whyItMatters: string;
  recommendedFix: string;
  sectionTarget?: string;
  resolved?: boolean;
}

export interface ExperienceGap {
  requirement: string;
  gapExplanation: string;
  advice: string;
}

export interface JobMatchResult {
  matchScore: number; // 0 - 100
  jobTitle: string;
  matchingSkills: string[];
  missingSkills: string[];
  matchingKeywords: string[];
  missingKeywords: string[];
  experienceGaps: ExperienceGap[];
}

export type OptimizationStrategyId = 'ats-optimized' | 'recruiter-friendly' | 'job-targeted';

export interface ResumeVersionOption {
  id: OptimizationStrategyId;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  atsScore: number;
  jobMatchScore: number;
  readabilityScore: number;
  resume: ParsedResume;
  scoreResult: ATSScoreResult;
  whyRecommended: string;
}

export interface CategoryDelta {
  category: string;
  factorKey: keyof ATSScoreBreakdown;
  before: number;
  after: number;
  delta: number;
}

export interface ImprovementItem {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Positive';
  category: string;
}

export interface ComparisonData {
  beforeScore: ATSScoreResult;
  afterScore: ATSScoreResult;
  deltaScore: number;
  categoryDeltas: CategoryDelta[];
  improvements: ImprovementItem[];
}
