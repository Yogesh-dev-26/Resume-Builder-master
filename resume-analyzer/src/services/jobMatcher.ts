import { ExperienceGap, JobMatchResult, ParsedResume } from '@/types/resume';
import { extractSkillsFromText } from './resumeParser';

const COMMON_TECH_TERMS = [
  'rest api', 'restful api', 'graphql', 'microservices', 'ci/cd', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
  'system design', 'agile', 'scrum', 'unit testing', 'test driven development', 'integration testing', 'git',
  'performance optimization', 'scalability', 'security', 'database design', 'full stack', 'frontend', 'backend',
  'devops', 'web vitals', 'cloud infrastructure', 'code review', 'cross-functional', 'leadership', 'mentoring',
  'state management', 'responsive design', 'user experience', 'accessibility', 'a11y', 'data engineering'
];

export function extractJobKeywords(jobDescription: string): { skills: string[]; keywords: string[]; title: string } {
  const extractedSkills = extractSkillsFromText(jobDescription);
  const lowerJD = ` ${jobDescription.toLowerCase()} `;

  const foundKeywords: Set<string> = new Set();
  for (const term of COMMON_TECH_TERMS) {
    if (lowerJD.includes(term.toLowerCase())) {
      foundKeywords.add(term);
    }
  }

  // Detect job title if present in top lines
  const lines = jobDescription.split('\n').map(l => l.trim()).filter(Boolean);
  let title = 'Target Job';
  for (const line of lines.slice(0, 3)) {
    if (/(?:engineer|developer|architect|lead|manager|analyst|designer|specialist|administrator)/i.test(line) && line.length < 60) {
      title = line.replace(/^(looking for|we are hiring|job title:?)\s*/i, '').trim();
      break;
    }
  }

  return {
    skills: extractedSkills,
    keywords: Array.from(foundKeywords),
    title
  };
}

export function matchJobDescription(resume: ParsedResume, jobDescription: string): JobMatchResult | null {
  if (!jobDescription || jobDescription.trim().length < 20) {
    return null;
  }

  const { skills: jdSkills, keywords: jdKeywords, title } = extractJobKeywords(jobDescription);

  const candidateSkillsLower = new Set(resume.skills.all.map(s => s.toLowerCase().trim()));
  const candidateRawLower = resume.rawText.toLowerCase();

  // 1. Matching Skills vs Missing Skills
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jdSkills) {
    const sLower = skill.toLowerCase().trim();
    if (candidateSkillsLower.has(sLower) || candidateRawLower.includes(sLower)) {
      matchingSkills.push(capitalizeWord(skill));
    } else {
      missingSkills.push(capitalizeWord(skill));
    }
  }

  // 2. Matching Keywords vs Missing Keywords
  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jdKeywords) {
    if (candidateRawLower.includes(kw.toLowerCase())) {
      matchingKeywords.push(capitalizeWord(kw));
    } else {
      missingKeywords.push(capitalizeWord(kw));
    }
  }

  // 3. Match Score Calculation
  const totalItems = jdSkills.length + jdKeywords.length;
  let matchScore = 70; // baseline

  if (totalItems > 0) {
    const matchedCount = matchingSkills.length + matchingKeywords.length;
    const rawRatio = matchedCount / totalItems;
    matchScore = Math.min(98, Math.max(25, Math.round(rawRatio * 100)));
  }

  // 4. Experience Gaps
  const experienceGaps: ExperienceGap[] = [];

  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 4).join(', ');
    experienceGaps.push({
      requirement: `Key Technologies: ${topMissing}`,
      gapExplanation: `The job description highlights ${topMissing}, but they are currently omitted or unverified in your resume's experience section.`,
      advice: `If you have worked with ${topMissing} in prior projects or coursework, mention them in your experience bullets. (Do not add them if you lack hands-on experience).`
    });
  }

  if (missingKeywords.some(k => ['ci/cd', 'docker', 'kubernetes', 'aws', 'cloud infrastructure'].includes(k.toLowerCase()))) {
    experienceGaps.push({
      requirement: 'DevOps & Cloud Deployment',
      gapExplanation: 'The target role emphasizes containerization, CI/CD pipelines, or cloud hosting.',
      advice: 'Highlight any hands-on experience deploying code to cloud environments (e.g. AWS, Vercel, Docker) within your project or experience descriptions.'
    });
  }

  if (missingKeywords.some(k => ['leadership', 'mentoring', 'cross-functional', 'system design'].includes(k.toLowerCase()))) {
    experienceGaps.push({
      requirement: 'System Design & Team Collaboration',
      gapExplanation: 'The requisition expects collaborative leadership, architectural input, or peer reviews.',
      advice: 'Detail how you contributed to technical discussions, architectural decisions, or cross-functional team coordination.'
    });
  }

  return {
    matchScore,
    jobTitle: title,
    matchingSkills,
    missingSkills,
    matchingKeywords,
    missingKeywords,
    experienceGaps
  };
}

function capitalizeWord(str: string): string {
  const acronyms = ['aws', 'gcp', 'sql', 'nosql', 'ci/cd', 'api', 'apis', 'rest', 'restful', 'ui', 'ux', 'html', 'css'];
  if (acronyms.includes(str.toLowerCase())) {
    return str.toUpperCase();
  }
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
