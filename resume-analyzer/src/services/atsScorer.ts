import { ATSScoreBreakdown, ATSScoreFactor, ATSScoreResult, ParsedResume, ResumeMetrics, ScoreStatus } from '@/types/resume';

const STRONG_ACTION_VERBS = new Set([
  'architected', 'spearheaded', 'engineered', 'developed', 'designed', 'implemented', 'optimized',
  'streamlined', 'orchestrated', 'accelerated', 'transformed', 'delivered', 'automated', 'executed',
  'enhanced', 'refactored', 'built', 'created', 'led', 'mentored', 'established', 'formulated',
  'launched', 'maximized', 'reduced', 'increased', 'generated', 'modernized', 'deployed', 'integrated',
  'devised', 'pioneered', 'championed', 'scaled', 'constructed', 'programmed', 'authored', 'administered'
]);

const WEAK_PASSIVE_PHRASES = [
  'worked on',
  'responsible for',
  'helped with',
  'assisted with',
  'handled tasks',
  'was tasked with',
  'participated in',
  'daily duties included',
  'worked closely with',
  'involved in'
];

const METRIC_REGEX = /(?:\b\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?[kKmMbB]?|\b\d+x\b|\b\d+\+?\s*(?:users|clients|customers|engineers|developers|members|projects|transactions|requests|ms|seconds|minutes|hours|days|weeks|months|years|services|microservices|endpoints|repos|teams)\b|\b(?:increased|decreased|reduced|boosted|grew|saved|improved|optimized)\s+.*?\b\d+)/i;

export function getScoreStatus(score: number): ScoreStatus {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Needs Improvement';
  return 'Poor';
}

export function calculateResumeMetrics(resume: ParsedResume): ResumeMetrics {
  const allBullets = [
    ...resume.experience.flatMap(e => e.bullets),
    ...resume.projects.flatMap(p => p.bullets)
  ];

  let actionVerbCount = 0;
  let quantifiedBulletCount = 0;

  for (const bullet of allBullets) {
    const trimmed = bullet.trim();
    const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (firstWord && STRONG_ACTION_VERBS.has(firstWord)) {
      actionVerbCount++;
    }

    if (METRIC_REGEX.test(trimmed)) {
      quantifiedBulletCount++;
    }
  }

  const rawWords = resume.rawText.split(/\s+/).filter(Boolean);
  const wordCount = rawWords.length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  let sectionCount = 0;
  if (resume.name) sectionCount++;
  if (resume.summary) sectionCount++;
  if (resume.experience.length > 0) sectionCount++;
  if (resume.skills.all.length > 0) sectionCount++;
  if (resume.education.length > 0) sectionCount++;
  if (resume.projects.length > 0) sectionCount++;
  if (resume.certifications.length > 0) sectionCount++;

  return {
    wordCount,
    readingTimeMinutes,
    bulletCount: allBullets.length,
    actionVerbCount,
    quantifiedBulletCount,
    sectionCount,
    skillsCount: resume.skills.all.length
  };
}

export function evaluateATS(resume: ParsedResume): ATSScoreResult {
  const metrics = calculateResumeMetrics(resume);
  const allBullets = [
    ...resume.experience.flatMap(e => e.bullets),
    ...resume.projects.flatMap(p => p.bullets)
  ];

  // 1. ATS Compatibility (Weight 15%)
  let atsCompatScore = 30;
  if (resume.contact.email) atsCompatScore += 20;
  if (resume.contact.phone) atsCompatScore += 15;
  if (resume.contact.location) atsCompatScore += 10;
  if (resume.contact.linkedin || resume.contact.github) atsCompatScore += 10;
  if (resume.experience.length > 0 && resume.education.length > 0) atsCompatScore += 15;
  atsCompatScore = Math.min(100, atsCompatScore);

  const atsCompatFactor: ATSScoreFactor = {
    id: 'ats-compatibility',
    name: 'ATS Compatibility',
    score: atsCompatScore,
    weight: 0.15,
    status: getScoreStatus(atsCompatScore),
    explanation: atsCompatScore >= 80
      ? 'Clean contact headers and standardized section layouts allow ATS scanners to parse your data with 98% accuracy.'
      : 'Incomplete contact information or non-standard formatting lowers ATS parsing accuracy.',
    improvementTip: atsCompatScore < 80
      ? 'Add your complete phone number, location, professional LinkedIn URL, and ensure all standard section titles are used.'
      : 'Ensure text formatting remains clean and free of multi-column tables or header/footer traps.'
  };

  // 2. Keyword Optimization (Weight 15%)
  let keywordScore = 40;
  const skillCount = resume.skills.all.length;
  if (skillCount >= 16) keywordScore = 95;
  else if (skillCount >= 10) keywordScore = 85;
  else if (skillCount >= 6) keywordScore = 70;
  else if (skillCount >= 3) keywordScore = 55;

  const keywordFactor: ATSScoreFactor = {
    id: 'keyword-optimization',
    name: 'Keyword Optimization',
    score: keywordScore,
    weight: 0.15,
    status: getScoreStatus(keywordScore),
    explanation: keywordScore >= 80
      ? `Strong representation of industry and domain keywords (${skillCount} identified skills) boosts search discovery.`
      : `Only ${skillCount} prominent skill keywords detected, limiting visibility in automated ATS search queries.`,
    improvementTip: keywordScore < 80
      ? 'Include specific technologies, libraries, tools, and domain keywords naturally throughout experience bullets.'
      : 'Keep keywords contextualized within project impact rather than isolated skill lists.'
  };

  // 3. Skills Match (Weight 15%)
  let skillsScore = 40;
  const hasCategorizedSkills = resume.skills.technical.length > 0 && (resume.skills.tools.length > 0 || resume.skills.soft.length > 0);
  if (hasCategorizedSkills && skillCount >= 12) skillsScore = 96;
  else if (skillCount >= 10) skillsScore = 82;
  else if (skillCount >= 6) skillsScore = 68;
  else skillsScore = 50;

  const skillsFactor: ATSScoreFactor = {
    id: 'skills-match',
    name: 'Skills Match',
    score: skillsScore,
    weight: 0.15,
    status: getScoreStatus(skillsScore),
    explanation: skillsScore >= 80
      ? 'Skills are neatly categorized across core technologies, frameworks, and developer tooling.'
      : 'Skills are either sparse or presented in a single flat list without clear categorization.',
    improvementTip: skillsScore < 80
      ? 'Organize your skills into distinct buckets: Languages, Frameworks, Developer Tools, and Cloud & DevOps.'
      : 'Maintain alignment between listed skills and the tools mentioned in your job experiences.'
  };

  // 4. Experience Quality (Weight 15%)
  let expQualityScore = 40;
  if (resume.experience.length > 0) {
    const avgBullets = resume.experience.reduce((sum, e) => sum + e.bullets.length, 0) / resume.experience.length;
    let bulletLengthScore = 0;
    let validLengths = 0;

    for (const b of allBullets) {
      const words = b.split(/\s+/).length;
      if (words >= 10 && words <= 32) validLengths++;
    }
    const validLengthRatio = allBullets.length > 0 ? validLengths / allBullets.length : 0;

    if (avgBullets >= 3) expQualityScore += 25;
    else if (avgBullets >= 2) expQualityScore += 15;

    if (validLengthRatio >= 0.7) expQualityScore += 30;
    else if (validLengthRatio >= 0.4) expQualityScore += 18;

    const hasDatesAndTitles = resume.experience.every(e => e.role && (e.company || e.startDate));
    if (hasDatesAndTitles) expQualityScore += 10;
  }
  expQualityScore = Math.min(100, Math.max(35, expQualityScore));

  const expQualityFactor: ATSScoreFactor = {
    id: 'experience-quality',
    name: 'Experience Quality',
    score: expQualityScore,
    weight: 0.15,
    status: getScoreStatus(expQualityScore),
    explanation: expQualityScore >= 80
      ? 'Roles clearly specify titles, organizations, and balanced bullet points with sufficient technical context.'
      : 'Experience bullet points are either too brief, lacking depth, or missing structured responsibilities.',
    improvementTip: expQualityScore < 80
      ? 'Aim for 3-5 comprehensive bullets per role detailing the problem solved, technology utilized, and outcome achieved.'
      : 'Maintain high consistency across role tenure dates and achievement scopes.'
  };

  // 5. Achievement Impact (Weight 15%)
  let achievementScore = 35;
  const quantRatio = allBullets.length > 0 ? metrics.quantifiedBulletCount / allBullets.length : 0;
  if (quantRatio >= 0.5) achievementScore = 95;
  else if (quantRatio >= 0.3) achievementScore = 82;
  else if (quantRatio >= 0.15) achievementScore = 65;
  else if (quantRatio > 0) achievementScore = 52;
  else achievementScore = 38;

  const achievementFactor: ATSScoreFactor = {
    id: 'achievement-impact',
    name: 'Achievement Impact',
    score: achievementScore,
    weight: 0.15,
    status: getScoreStatus(achievementScore),
    explanation: achievementScore >= 80
      ? `${Math.round(quantRatio * 100)}% of bullets highlight quantified outcomes, metrics, or performance gains.`
      : `Only ${Math.round(quantRatio * 100)}% of bullets include measurable metrics, reducing persuasive impact for recruiters.`,
    improvementTip: achievementScore < 80
      ? 'Add numbers, percentages, latency reductions, user scale, or team sizes to substantiate your work.'
      : 'Ensure every metric reflects authentic project milestones without exaggeration.'
  };

  // 6. Formatting (Weight 10%)
  let formattingScore = 50;
  if (metrics.wordCount >= 280 && metrics.wordCount <= 750) formattingScore += 30;
  else if (metrics.wordCount >= 180 && metrics.wordCount <= 950) formattingScore += 15;

  if (allBullets.length >= 5) formattingScore += 20;
  formattingScore = Math.min(100, formattingScore);

  const formattingFactor: ATSScoreFactor = {
    id: 'formatting',
    name: 'Formatting',
    score: formattingScore,
    weight: 0.10,
    status: getScoreStatus(formattingScore),
    explanation: formattingScore >= 80
      ? `Ideal length of ${metrics.wordCount} words provides a comprehensive yet skimmable 1-page profile.`
      : metrics.wordCount < 250
        ? 'Resume is significantly too brief to satisfy ATS threshold requirements for comprehensive evaluation.'
        : 'Resume word count or structure requires tightening for 6-second recruiter review.',
    improvementTip: formattingScore < 80
      ? 'Maintain a concise 350-650 word footprint focused on relevant achievements rather than daily task lists.'
      : 'Use consistent bullet styles, uniform font weights, and standard margins.'
  };

  // 7. Resume Structure (Weight 10%)
  let structureScore = 40;
  if (resume.summary && resume.summary.length > 50) structureScore += 15;
  if (resume.experience.length >= 1) structureScore += 20;
  if (resume.skills.all.length >= 5) structureScore += 15;
  if (resume.education.length >= 1) structureScore += 10;
  structureScore = Math.min(100, structureScore);

  const structureFactor: ATSScoreFactor = {
    id: 'resume-structure',
    name: 'Resume Structure',
    score: structureScore,
    weight: 0.10,
    status: getScoreStatus(structureScore),
    explanation: structureScore >= 80
      ? 'Logical section sequencing conforms to standard ATS parsing hierarchies.'
      : 'Critical structural elements (such as an impactful Summary or distinct Education) are missing or sparse.',
    improvementTip: structureScore < 80
      ? 'Position your Professional Summary right below contact info, followed by Skills, Experience, Projects, and Education.'
      : 'Ensure section headings use standardized nomenclature that parsing engines recognize immediately.'
  };

  // 8. Readability (Weight 5%)
  let readabilityScore = 45;
  const actionVerbRatio = allBullets.length > 0 ? metrics.actionVerbCount / allBullets.length : 0;

  let passiveCount = 0;
  for (const b of allBullets) {
    const bLower = b.toLowerCase();
    if (WEAK_PASSIVE_PHRASES.some(w => bLower.includes(w))) {
      passiveCount++;
    }
  }

  if (actionVerbRatio >= 0.7) readabilityScore += 35;
  else if (actionVerbRatio >= 0.4) readabilityScore += 20;

  if (passiveCount === 0 && allBullets.length > 0) readabilityScore += 20;
  else if (passiveCount <= 1) readabilityScore += 10;

  readabilityScore = Math.min(100, readabilityScore);

  const readabilityFactor: ATSScoreFactor = {
    id: 'readability',
    name: 'Readability',
    score: readabilityScore,
    weight: 0.05,
    status: getScoreStatus(readabilityScore),
    explanation: readabilityScore >= 80
      ? 'Bullet points commence with powerful active verbs with zero passive responsibility phrasing.'
      : `Bullet points rely on passive phrases ("responsible for", "helped with") and lack punchy action verbs.`,
    improvementTip: readabilityScore < 80
      ? 'Begin every bullet point with a decisive action verb (e.g. Engineered, Spearheaded, Optimized) instead of "worked on".'
      : 'Keep sentences direct, eliminating fluff words like "successfully" or "diligently".'
  };

  // Calculate Weighted Overall ATS Score
  const overallScore = Math.round(
    atsCompatFactor.score * atsCompatFactor.weight +
    keywordFactor.score * keywordFactor.weight +
    skillsFactor.score * skillsFactor.weight +
    expQualityFactor.score * expQualityFactor.weight +
    achievementFactor.score * achievementFactor.weight +
    formattingFactor.score * formattingFactor.weight +
    structureFactor.score * structureFactor.weight +
    readabilityFactor.score * readabilityFactor.weight
  );

  const strengths: string[] = [];
  if (atsCompatScore >= 80) strengths.push('Complete contact information with accessible online profiles');
  if (keywordScore >= 80) strengths.push(`Strong technology keyword distribution across ${skillCount} skills`);
  if (achievementScore >= 75) strengths.push('Measurable metrics and business outcomes integrated in experience');
  if (expQualityScore >= 75) strengths.push('Well-structured job descriptions with consistent detail');
  if (readabilityScore >= 75) strengths.push('Strong action verbs driving role accomplishments');
  if (strengths.length === 0) {
    strengths.push('Clean foundational structure suitable for optimization');
  }

  return {
    overallScore,
    status: getScoreStatus(overallScore),
    factors: {
      atsCompatibility: atsCompatFactor,
      keywordOptimization: keywordFactor,
      skillsMatch: skillsFactor,
      experienceQuality: expQualityFactor,
      achievementImpact: achievementFactor,
      formatting: formattingFactor,
      resumeStructure: structureFactor,
      readability: readabilityFactor
    },
    strengths,
    metrics
  };
}
