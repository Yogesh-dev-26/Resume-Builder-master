import { ATSScoreResult, ParsedResume, ResumeIssue } from '@/types/resume';

const WEAK_VERB_PATTERNS = [
  { regex: /\bworked on\b/i, fix: 'Engineered, Architected, or Developed' },
  { regex: /\bresponsible for\b/i, fix: 'Spearheaded, Directed, or Managed' },
  { regex: /\bhelped with\b/i, fix: 'Collaborated on or Streamlined' },
  { regex: /\bassisted with\b/i, fix: 'Partnered with cross-functional teams to deliver' },
  { regex: /\bhandled tasks\b/i, fix: 'Executed core project milestones for' },
  { regex: /\bwas involved in\b/i, fix: 'Coordinated and implemented' },
  { regex: /\bdaily duties included\b/i, fix: 'Delivered operational excellence in' }
];

export function identifyResumeIssues(resume: ParsedResume, scoreResult: ATSScoreResult): ResumeIssue[] {
  const issues: ResumeIssue[] = [];
  const allBullets = [
    ...resume.experience.flatMap(e => e.bullets),
    ...resume.projects.flatMap(p => p.bullets)
  ];

  // ---------------------------------------------
  // CRITICAL ISSUES
  // ---------------------------------------------

  // 1. Missing Contact Info
  if (!resume.contact.email || !resume.contact.phone) {
    issues.push({
      id: 'issue-crit-contact',
      severity: 'Critical',
      category: 'formatting',
      problem: `Missing essential contact details (${!resume.contact.email ? 'Email' : ''}${!resume.contact.email && !resume.contact.phone ? ' and ' : ''}${!resume.contact.phone ? 'Phone Number' : ''}).`,
      whyItMatters: 'Recruiters and automated ATS filters immediately discard candidates they cannot contact automatically.',
      recommendedFix: 'Include a professional email address, direct phone number, and city/state location at the top of your resume.',
      sectionTarget: 'Contact Header'
    });
  }

  // 2. Missing Core Sections
  if (resume.experience.length === 0) {
    issues.push({
      id: 'issue-crit-no-exp',
      severity: 'Critical',
      category: 'sections',
      problem: 'Missing a clearly defined Work Experience section.',
      whyItMatters: 'ATS parsers look for chronological work experience to verify candidate seniority and past roles.',
      recommendedFix: 'Add a "WORK EXPERIENCE" section detailing recent employment, job titles, companies, dates, and achievements.',
      sectionTarget: 'Work Experience'
    });
  }

  if (resume.skills.all.length < 4) {
    issues.push({
      id: 'issue-crit-sparse-skills',
      severity: 'Critical',
      category: 'keywords',
      problem: 'Critically low number of recognized technical skills (less than 4 found).',
      whyItMatters: 'ATS keyword algorithms rank candidates primarily by hard skills matching the requisition.',
      recommendedFix: 'Add a distinct "SKILLS" section listing your programming languages, frameworks, cloud tools, and databases.',
      sectionTarget: 'Skills'
    });
  }

  // 3. Critically Low Word Count
  if (scoreResult.metrics.wordCount < 150) {
    issues.push({
      id: 'issue-crit-wordcount',
      severity: 'Critical',
      category: 'formatting',
      problem: `Resume content is critically brief (${scoreResult.metrics.wordCount} words).`,
      whyItMatters: 'ATS algorithms assign low relevance percentiles to resumes under 250 words, interpreting them as incomplete.',
      recommendedFix: 'Expand experience bullets and project summaries to reach an optimal target of 350-700 words.',
      sectionTarget: 'General Layout'
    });
  }

  // ---------------------------------------------
  // IMPORTANT ISSUES
  // ---------------------------------------------

  // 4. Missing Measurable Achievements
  if (scoreResult.metrics.quantifiedBulletCount === 0 && allBullets.length > 0) {
    issues.push({
      id: 'issue-imp-no-metrics',
      severity: 'Important',
      category: 'quantification',
      problem: 'No quantifiable metrics or measurable achievements found in any bullet points.',
      whyItMatters: 'Recruiters spend an average of 6 seconds skimming. Resumes without numbers fail to prove tangible business impact.',
      recommendedFix: 'Add specific metrics, percentages, team sizes, throughput improvements, or time saved (e.g. "improved speed by 25%").',
      sectionTarget: 'Experience Bullets'
    });
  } else if (scoreResult.metrics.quantifiedBulletCount < Math.ceil(allBullets.length * 0.3) && allBullets.length > 0) {
    issues.push({
      id: 'issue-imp-low-metrics',
      severity: 'Important',
      category: 'quantification',
      problem: `Only ${scoreResult.metrics.quantifiedBulletCount} out of ${allBullets.length} bullets contain quantifiable results.`,
      whyItMatters: 'Top-tier candidates quantify at least 40% of their bullet points to demonstrate verifiable ROI.',
      recommendedFix: 'Convert responsibility statements into impact statements using metrics, dollar amounts, or scale.',
      sectionTarget: 'Experience Bullets'
    });
  }

  // 5. Weak Summary or Missing Summary
  if (!resume.summary || resume.summary.length < 40) {
    issues.push({
      id: 'issue-imp-summary-missing',
      severity: 'Important',
      category: 'content',
      problem: 'Missing or overly brief Professional Summary.',
      whyItMatters: 'A targeted professional summary sets your positioning and injects high-priority keywords in the top third of the page.',
      recommendedFix: 'Craft a 2-3 sentence summary summarizing your core title, years of domain experience, and key technical proficiencies.',
      sectionTarget: 'Professional Summary'
    });
  } else if (resume.summary.toLowerCase().includes('looking for a role') || resume.summary.toLowerCase().includes('grow my skills')) {
    issues.push({
      id: 'issue-imp-summary-generic',
      severity: 'Important',
      category: 'content',
      problem: 'Professional summary uses outdated objective-style language ("looking for a role", "seeking opportunity").',
      whyItMatters: 'Modern recruiters look for what value you provide to their organization, not what you want from them.',
      recommendedFix: 'Replace passive objective statements with value-driven positioning showcasing your capabilities and technical toolkit.',
      sectionTarget: 'Professional Summary'
    });
  }

  // 6. Weak Bullet Points / Passive Voice
  const weakBulletsFound: string[] = [];
  for (const bullet of allBullets) {
    for (const pat of WEAK_VERB_PATTERNS) {
      if (pat.regex.test(bullet)) {
        weakBulletsFound.push(bullet);
        break;
      }
    }
  }

  if (weakBulletsFound.length > 0) {
    issues.push({
      id: 'issue-imp-weak-verbs',
      severity: 'Important',
      category: 'grammar',
      problem: `${weakBulletsFound.length} bullet points start with weak or passive phrases ("worked on", "responsible for", "helped with").`,
      whyItMatters: 'Passive language signals low ownership and diminishes the candidate’s authority in hiring manager reviews.',
      recommendedFix: 'Rephrase using strong action verbs like "Architected", "Engineered", "Implemented", "Spearheaded", or "Optimized".',
      sectionTarget: 'Work Experience'
    });
  }

  // 7. Unorganized Skills
  if (resume.skills.technical.length > 0 && resume.skills.tools.length === 0 && resume.skills.all.length > 7) {
    issues.push({
      id: 'issue-imp-skills-org',
      severity: 'Important',
      category: 'keywords',
      problem: 'Skills are lumped into a single unstructured list rather than categorized.',
      whyItMatters: 'Recruiters and hiring managers struggle to quickly locate relevant tools in unorganized text blocks.',
      recommendedFix: 'Group your skills into distinct categories: Languages, Frameworks & Libraries, Cloud & DevOps, and Tools.',
      sectionTarget: 'Skills'
    });
  }

  // ---------------------------------------------
  // MINOR ISSUES
  // ---------------------------------------------

  // 8. Missing Online Profiles (LinkedIn / GitHub)
  if (!resume.contact.linkedin || !resume.contact.github) {
    issues.push({
      id: 'issue-min-profiles',
      severity: 'Minor',
      category: 'formatting',
      problem: `Missing ${!resume.contact.linkedin ? 'LinkedIn' : ''}${!resume.contact.linkedin && !resume.contact.github ? ' or ' : ''}${!resume.contact.github ? 'GitHub' : ''} profile link.`,
      whyItMatters: 'Recruiters frequently cross-reference resumes with live GitHub portfolios and verified LinkedIn credentials.',
      recommendedFix: 'Add your custom LinkedIn URL and GitHub profile link to the header contact line.',
      sectionTarget: 'Contact Header'
    });
  }

  // 9. Bullet Length Inconsistencies
  const shortBullets = allBullets.filter(b => b.split(/\s+/).length < 7);
  if (shortBullets.length > 1) {
    issues.push({
      id: 'issue-min-short-bullets',
      severity: 'Minor',
      category: 'formatting',
      problem: `${shortBullets.length} bullet points are very brief (under 7 words).`,
      whyItMatters: 'Ultra-short bullets often fail to explain what action was taken, what tool was used, or what outcome resulted.',
      recommendedFix: 'Expand brief bullets using the Action + Context + Outcome framework.',
      sectionTarget: 'Experience Bullets'
    });
  }

  // 10. Repetitive Action Verbs
  const firstWords = allBullets.map(b => b.split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
  const wordFreq: Record<string, number> = {};
  for (const w of firstWords) {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }
  const repetitiveVerbs = Object.entries(wordFreq).filter(([w, c]) => c >= 3 && w.length > 3);
  if (repetitiveVerbs.length > 0) {
    issues.push({
      id: 'issue-min-repetitive-verbs',
      severity: 'Minor',
      category: 'grammar',
      problem: `Repeated use of the verb "${repetitiveVerbs[0][0]}" (${repetitiveVerbs[0][1]} times).`,
      whyItMatters: 'Repeated opening verbs reduce readability and make experience descriptions feel monotonous.',
      recommendedFix: `Vary your vocabulary with synonyms like "Orchestrated", "Engineered", "Executed", or "Transformed".`,
      sectionTarget: 'Work Experience'
    });
  }

  return issues;
}
