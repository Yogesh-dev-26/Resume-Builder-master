import { ContactInfo, EducationItem, ParsedResume, ProjectItem, SkillsCategorized, WorkExperienceItem } from '@/types/resume';

// Comprehensive dictionary of recognized technical, tools, soft, and domain skills
const KNOWN_TECHNICAL_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'go', 'golang', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'html', 'html5', 'css', 'css3', 'sass', 'scss', 'sql', 'nosql', 'r', 'scala', 'dart', 'graphql', 'rest api', 'restful api',
  'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'vue', 'vue.js', 'angular', 'svelte', 'node.js', 'nodejs', 'express', 'express.js',
  'nest.js', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'laravel', 'asp.net', '.net core',
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'oracle', 'cassandra', 'dynamodb', 'elasticsearch',
  'docker', 'kubernetes', 'aws', 'amazon web services', 'azure', 'google cloud', 'gcp', 'terraform', 'ansible', 'jenkins',
  'ci/cd', 'github actions', 'gitlab ci', 'linux', 'git', 'webpack', 'vite', 'tailwind', 'tailwindcss', 'bootstrap',
  'microservices', 'serverless', 'system design', 'machine learning', 'deep learning', 'nlp', 'data science', 'pandas', 'numpy',
  'tensorflow', 'pytorch', 'scikit-learn', 'kafka', 'rabbitmq', 'socket.io', 'webrtc', 'jest', 'cypress', 'playwright', 'mocha'
];

const KNOWN_TOOLS_SKILLS = [
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'trello', 'figma', 'postman', 'swagger',
  'vscode', 'docker', 'npm', 'yarn', 'pnpm', 'datadog', 'new relic', 'sentry', 'splunk', 'grafana', 'prometheus',
  'linux', 'bash', 'powershell', 'terminal', 'vercel', 'netlify', 'aws amplify', 'heroku'
];

const KNOWN_SOFT_SKILLS = [
  'leadership', 'team leadership', 'communication', 'collaboration', 'problem solving', 'critical thinking',
  'agile', 'scrum', 'project management', 'mentoring', 'cross-functional collaboration', 'time management',
  'adaptability', 'analytical thinking', 'ownership', 'stakeholder management', 'code review'
];

export function cleanText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

export function extractContactInfo(text: string): ContactInfo {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const phoneRegex = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?|(\+?[0-9]{1,3}[-.\s]?[0-9]{3,5}[-.\s]?[0-9]{4,6})/i;
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/([a-zA-Z0-9_-]+)/i;
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i;
  const portfolioRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|me|io|design|app|com))(?:\/[^\s]*)?/i;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkedinMatch = text.match(linkedinRegex);
  const githubMatch = text.match(githubRegex);

  // Location heuristics (City, State / Country)
  const locationRegex = /(?:Location|Address|Living in|Based in)?:?\s*([A-Z][a-zA-Z\s.-]+,\s*[A-Z]{2}|[A-Z][a-zA-Z\s.-]+,\s*[A-Z][a-zA-Z\s]+)/;
  const locationMatch = text.match(locationRegex);

  return {
    email: emailMatch ? emailMatch[1] : '',
    phone: phoneMatch ? phoneMatch[0].trim() : '',
    location: locationMatch ? locationMatch[1].trim() : '',
    linkedin: linkedinMatch ? linkedinMatch[0] : '',
    github: githubMatch ? githubMatch[0] : '',
    portfolio: '',
    website: ''
  };
}

export function extractName(text: string, contact: ContactInfo): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return 'Candidate';

  for (const line of lines.slice(0, 5)) {
    // If line is not an email, phone, url, or heading
    if (
      line.includes('@') ||
      line.toLowerCase().includes('resume') ||
      line.toLowerCase().includes('curriculum vitae') ||
      line.toLowerCase().includes('portfolio') ||
      line.toLowerCase().includes('linkedin') ||
      line.toLowerCase().includes('github') ||
      line.length > 50 ||
      line.length < 2 ||
      /\d{3}/.test(line)
    ) {
      continue;
    }
    // Looks like a name (1 to 4 capitalized words)
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && words.every(w => /^[A-Z][a-zA-Z.'-]*$/.test(w))) {
      return line;
    }
  }

  // Fallback to first clean short line
  const candidate = lines[0].replace(/[^a-zA-Z\s]/g, '').trim();
  return candidate.length > 0 && candidate.length < 40 ? candidate : 'Candidate';
}

export function categorizeSkills(foundSkills: string[]): SkillsCategorized {
  const technical: Set<string> = new Set();
  const tools: Set<string> = new Set();
  const soft: Set<string> = new Set();
  const domain: Set<string> = new Set();
  const all: Set<string> = new Set();

  for (const skill of foundSkills) {
    const sLower = skill.toLowerCase().trim();
    if (!sLower) continue;

    all.add(skill);

    if (KNOWN_TECHNICAL_SKILLS.some(k => k === sLower || (sLower.length > 3 && k.includes(sLower)))) {
      technical.add(skill);
    } else if (KNOWN_TOOLS_SKILLS.some(k => k === sLower)) {
      tools.add(skill);
    } else if (KNOWN_SOFT_SKILLS.some(k => k === sLower)) {
      soft.add(skill);
    } else {
      domain.add(skill);
    }
  }

  // Format capitalized names
  const formatList = (set: Set<string>) => Array.from(set).map(capitalizeSkill);

  return {
    technical: formatList(technical),
    tools: formatList(tools),
    soft: formatList(soft),
    domain: formatList(domain),
    all: Array.from(all).map(capitalizeSkill)
  };
}

function capitalizeSkill(skill: string): string {
  const specialCases: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'react': 'React.js',
    'react.js': 'React.js',
    'reactjs': 'React.js',
    'next.js': 'Next.js',
    'nextjs': 'Next.js',
    'vue': 'Vue.js',
    'vue.js': 'Vue.js',
    'node.js': 'Node.js',
    'nodejs': 'Node.js',
    'html': 'HTML5',
    'html5': 'HTML5',
    'css': 'CSS3',
    'css3': 'CSS3',
    'sql': 'SQL',
    'nosql': 'NoSQL',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mysql': 'MySQL',
    'mongodb': 'MongoDB',
    'aws': 'AWS',
    'gcp': 'Google Cloud (GCP)',
    'azure': 'Azure',
    'ci/cd': 'CI/CD',
    'rest api': 'REST APIs',
    'restful api': 'RESTful APIs',
    'graphql': 'GraphQL',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'git': 'Git',
    'github': 'GitHub',
    'jira': 'Jira',
    'figma': 'Figma'
  };

  const key = skill.toLowerCase().trim();
  if (specialCases[key]) return specialCases[key];

  return skill
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function extractSkillsFromText(text: string): string[] {
  const found: Set<string> = new Set();
  const lowerText = ` ${text.toLowerCase()} `;

  const allKnown = [...KNOWN_TECHNICAL_SKILLS, ...KNOWN_TOOLS_SKILLS, ...KNOWN_SOFT_SKILLS];

  for (const skill of allKnown) {
    // Regex boundary match
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9+#.-])${escaped}(?:$|[^a-zA-Z0-9+#.-])`, 'i');
    if (regex.test(lowerText)) {
      found.add(skill);
    }
  }

  // Also check explicit Skills section
  const skillsSectionRegex = /(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|TECHNOLOGIES)[\s\S]*?(?=(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|EDUCATION|PROJECTS|CERTIFICATIONS|ACHIEVEMENTS|$))/i;
  const sectionMatch = text.match(skillsSectionRegex);
  if (sectionMatch) {
    const rawSection = sectionMatch[0];
    const items = rawSection
      .replace(/(?:SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|TECHNOLOGIES)[:\s-]*/i, '')
      .split(/[,•|·\n\r\t]+/)
      .map(s => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(s => s.length >= 2 && s.length <= 30 && !/^(and|or|with|the)$/i.test(s));

    items.forEach(it => {
      if (!it.toLowerCase().includes('skill') && !it.toLowerCase().includes('proficient')) {
        found.add(it);
      }
    });
  }

  return Array.from(found);
}

// Section Header Regex Patterns
const SECTION_PATTERNS = {
  summary: /(?:PROFESSIONAL SUMMARY|EXECUTIVE SUMMARY|SUMMARY|OBJECTIVE|PROFILE|ABOUT ME)/i,
  experience: /(?:WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY|EMPLOYMENT|WORK HISTORY)/i,
  education: /(?:EDUCATION|ACADEMIC BACKGROUND|ACADEMIC QUALIFICATIONS|EDUCATIONAL BACKGROUND)/i,
  skills: /(?:TECHNICAL SKILLS|CORE COMPETENCIES|SKILLS|TECHNOLOGIES|KEY SKILLS|TOOLS & TECHNOLOGIES)/i,
  projects: /(?:PROJECTS|KEY PROJECTS|PERSONAL PROJECTS|TECHNICAL PROJECTS|NOTABLE PROJECTS)/i,
  certifications: /(?:CERTIFICATIONS|LICENSES & CERTIFICATIONS|CERTIFICATES)/i,
  achievements: /(?:ACHIEVEMENTS|AWARDS & HONORS|HONORS & AWARDS|KEY ACHIEVEMENTS)/i,
  languages: /(?:LANGUAGES|LANGUAGE PROFICIENCY)/i
};

export function parseResume(rawText: string): ParsedResume {
  const text = cleanText(rawText);
  const contact = extractContactInfo(text);
  const name = extractName(text, contact);

  // Split into sections
  const sections: Record<string, string> = {};
  const lines = text.split('\n');

  let currentSection = 'header';
  const sectionContent: Record<string, string[]> = { header: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if line is a section heading (short line, uppercase or distinct title)
    let matchedSection: string | null = null;
    const isHeadingCandidate = line.length <= 40 && (line === line.toUpperCase() || /^[A-Z][A-Za-z\s&/]+$/.test(line));

    if (isHeadingCandidate) {
      if (SECTION_PATTERNS.summary.test(line)) matchedSection = 'summary';
      else if (SECTION_PATTERNS.experience.test(line)) matchedSection = 'experience';
      else if (SECTION_PATTERNS.education.test(line)) matchedSection = 'education';
      else if (SECTION_PATTERNS.skills.test(line)) matchedSection = 'skills';
      else if (SECTION_PATTERNS.projects.test(line)) matchedSection = 'projects';
      else if (SECTION_PATTERNS.certifications.test(line)) matchedSection = 'certifications';
      else if (SECTION_PATTERNS.achievements.test(line)) matchedSection = 'achievements';
      else if (SECTION_PATTERNS.languages.test(line)) matchedSection = 'languages';
    }

    if (matchedSection) {
      currentSection = matchedSection;
      if (!sectionContent[currentSection]) {
        sectionContent[currentSection] = [];
      }
    } else {
      if (!sectionContent[currentSection]) {
        sectionContent[currentSection] = [];
      }
      sectionContent[currentSection].push(line);
    }
  }

  // Parse Summary
  const summaryLines = sectionContent['summary'] || [];
  const summary = summaryLines.join(' ').trim();

  // Parse Skills
  const rawSkillsText = (sectionContent['skills'] || []).join('\n');
  const extractedSkills = extractSkillsFromText(rawSkillsText || text);
  const skills = categorizeSkills(extractedSkills);

  // Parse Work Experience
  const expLines = sectionContent['experience'] || [];
  const experience = parseExperienceSection(expLines);

  // Parse Education
  const eduLines = sectionContent['education'] || [];
  const education = parseEducationSection(eduLines);

  // Parse Projects
  const projectLines = sectionContent['projects'] || [];
  const projects = parseProjectsSection(projectLines);

  // Parse Certifications
  const certLines = sectionContent['certifications'] || [];
  const certifications = certLines
    .map(c => c.replace(/^[-*•]\s*/, '').trim())
    .filter(c => c.length > 3);

  // Parse Achievements
  const achLines = sectionContent['achievements'] || [];
  const achievements = achLines
    .map(a => a.replace(/^[-*•]\s*/, '').trim())
    .filter(a => a.length > 3);

  // Parse Languages
  const langLines = sectionContent['languages'] || [];
  const languages = langLines
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.length > 2);

  // Links
  const linkMatches = text.match(/https?:\/\/[^\s)]+/g) || [];

  return {
    name,
    contact,
    summary,
    originalSummary: summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    languages,
    links: Array.from(new Set(linkMatches)),
    rawText: text
  };
}

function parseExperienceSection(lines: string[]): WorkExperienceItem[] {
  const experiences: WorkExperienceItem[] = [];
  let currentExp: Partial<WorkExperienceItem> | null = null;

  const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{4})\s*[-–—to]+\s*(?:Present|Current|\d{4}|[A-Za-z]+ \d{4})/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const hasDate = datePattern.test(line);
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line);
    const dateMatch = line.match(datePattern);
    const isPureDateLine = hasDate && !line.includes('|') && line.replace(datePattern, '').trim().length < 15;

    if (isPureDateLine && currentExp && !currentExp.startDate) {
      // Just a date line following role/company
      const parts = dateMatch![0].split(/[-–—to]+/);
      currentExp.startDate = parts[0]?.trim() || '';
      currentExp.endDate = dateMatch![0].toLowerCase().includes('present') ? 'Present' : (parts[1]?.trim() || '');
      continue;
    }

    if (isBullet) {
      const cleanBullet = line.replace(/^[-*•\d.]+\s*/, '').trim();
      if (cleanBullet.length > 5) {
        if (!currentExp) {
          currentExp = {
            id: `exp-${experiences.length + 1}-${Date.now()}`,
            role: 'Professional Experience',
            company: 'Organization',
            bullets: []
          };
        }
        currentExp.bullets = currentExp.bullets || [];
        currentExp.bullets.push(cleanBullet);
      }
    } else if (hasDate || line.includes('|') || (!currentExp && line.length < 50)) {
      if (currentExp && (currentExp.bullets?.length || currentExp.role !== 'Professional Experience')) {
        experiences.push(finalizeExperience(currentExp));
      }

      const parts = line.split(/[|–—-]/).map(p => p.trim());
      const role = parts[0] || 'Software Engineer';
      const company = parts[1] || 'Company';

      currentExp = {
        id: `exp-${experiences.length + 1}-${Date.now()}`,
        role: role,
        company: company,
        startDate: dateMatch ? dateMatch[0].split(/[-–—to]+/)[0].trim() : '',
        endDate: dateMatch ? (dateMatch[0].includes('Present') ? 'Present' : dateMatch[0].split(/[-–—to]+/)[1]?.trim() || '') : '',
        bullets: []
      };
    } else if (currentExp) {
      if (line.length > 20) {
        currentExp.bullets = currentExp.bullets || [];
        currentExp.bullets.push(line);
      } else if (!currentExp.company || currentExp.company === 'Company') {
        currentExp.company = line;
      }
    }
  }

  if (currentExp && (currentExp.bullets?.length || currentExp.role)) {
    experiences.push(finalizeExperience(currentExp));
  }

  // If no experience parsed but lines exist, create a fallback entry
  if (experiences.length === 0 && lines.length > 0) {
    experiences.push({
      id: `exp-fallback-${Date.now()}`,
      role: 'Professional Experience',
      company: 'Organization',
      bullets: lines.filter(l => l.length > 15)
    });
  }

  return experiences;
}

function finalizeExperience(item: Partial<WorkExperienceItem>): WorkExperienceItem {
  return {
    id: item.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
    role: item.role || 'Professional Role',
    company: item.company || 'Company',
    location: item.location || '',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    current: item.endDate === 'Present',
    bullets: item.bullets || [],
    originalBullets: [...(item.bullets || [])]
  };
}

function parseEducationSection(lines: string[]): EducationItem[] {
  const items: EducationItem[] = [];
  const degreePattern = /(?:Bachelor|Master|Ph\.?D|B\.?S|M\.?S|B\.?Tech|B\.?E|Associate|Diploma)/i;

  let currentEdu: Partial<EducationItem> | null = null;

  for (const line of lines) {
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

    if (degreePattern.test(line) && !isBullet) {
      if (currentEdu && currentEdu.degree) {
        items.push({
          id: `edu-${items.length + 1}`,
          degree: currentEdu.degree || 'Degree',
          institution: currentEdu.institution || 'University',
          endDate: currentEdu.endDate || ''
        });
      }

      currentEdu = {
        id: `edu-${items.length + 1}`,
        degree: line,
        institution: '',
        endDate: ''
      };
    } else if (currentEdu && !currentEdu.institution && !isBullet) {
      currentEdu.institution = line;
    } else if (currentEdu) {
      if (/(?:19|20)\d{2}/.test(line)) {
        const year = line.match(/(?:19|20)\d{2}/)?.[0] || '';
        currentEdu.endDate = year;
      }
    }
  }

  if (currentEdu && currentEdu.degree) {
    items.push({
      id: currentEdu.id || `edu-${items.length + 1}`,
      degree: currentEdu.degree,
      institution: currentEdu.institution || 'University',
      endDate: currentEdu.endDate || ''
    });
  }

  return items;
}

function parseProjectsSection(lines: string[]): ProjectItem[] {
  const projects: ProjectItem[] = [];
  let currentProj: Partial<ProjectItem> | null = null;

  for (const line of lines) {
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

    if (!isBullet && line.length > 3 && line.length < 50 && !line.includes('.')) {
      if (currentProj && currentProj.name) {
        projects.push({
          id: `proj-${projects.length + 1}`,
          name: currentProj.name,
          techStack: currentProj.techStack || [],
          bullets: currentProj.bullets || [],
          originalBullets: [...(currentProj.bullets || [])]
        });
      }

      // Project header (often "Project Name | Tech Stack" or just "Project Name")
      const parts = line.split(/[|–-]/).map(p => p.trim());
      const name = parts[0];
      const tech = parts.length > 1 ? parts.slice(1).join(', ').split(/,\s*/) : [];

      currentProj = {
        id: `proj-${projects.length + 1}`,
        name: name,
        techStack: tech,
        bullets: []
      };
    } else if (currentProj) {
      const cleanBullet = line.replace(/^[-*•\d.]+\s*/, '').trim();
      if (cleanBullet) {
        currentProj.bullets = currentProj.bullets || [];
        currentProj.bullets.push(cleanBullet);
      }
    }
  }

  if (currentProj && currentProj.name) {
    projects.push({
      id: currentProj.id || `proj-${projects.length + 1}`,
      name: currentProj.name,
      techStack: currentProj.techStack || [],
      bullets: currentProj.bullets || [],
      originalBullets: [...(currentProj.bullets || [])]
    });
  }

  return projects;
}

// Built-in Sample Resumes for 1-Click Evaluation
export const SAMPLE_RESUMES: { id: string; title: string; role: string; text: string; jobDescription?: string }[] = [
  {
    id: 'sample-software-engineer-needs-work',
    title: 'Alex Rivera — Full Stack Developer (Needs Optimization)',
    role: 'Full Stack Engineer',
    text: `Alex Rivera
alex.rivera@example.com | (555) 345-6789 | Austin, TX
linkedin.com/in/alexriveradev | github.com/alexrivera

PROFESSIONAL SUMMARY
Software developer with experience in web applications. Looking for a new role where I can use my programming skills and grow as an engineer in a fast paced team.

SKILLS
JavaScript, React, Node.js, HTML, CSS, SQL, Git, problem solving, communication

WORK EXPERIENCE
Software Developer | NexaTech Solutions | Austin, TX
June 2022 - Present
• Worked on React application for customers.
• Responsible for fixing bugs and updating UI components.
• Assisted backend team with REST API integrations and database queries.
• Attended daily standups and sprint planning meetings.
• Helped with testing code before deployments.

Junior Web Developer | Apex Digital Studio | Dallas, TX
January 2021 - May 2022
• Built web pages using HTML, CSS and JavaScript.
• Handled tasks assigned by senior developers in Jira.
• Worked on styling websites for mobile responsiveness.
• Collaborated with team members to deliver client projects on schedule.

PROJECTS
TaskFlow App | React, Node.js, Express, MongoDB
• Created full-stack project management app with authentication.
• Used MongoDB to store user and task information.
• Added responsive design for mobile screens.

EDUCATION
Bachelor of Science in Computer Science
University of Texas at Austin | 2017 - 2021`,
    jobDescription: `Senior Full Stack Developer (React / Node.js / TypeScript)

We are looking for an experienced Full Stack Engineer to build high-performance cloud applications.

Requirements:
- 3+ years experience with React.js, TypeScript, Next.js, and Node.js
- Strong proficiency in REST APIs, GraphQL, and PostgreSQL
- Experience with Docker, Kubernetes, CI/CD, and AWS Cloud
- Proven track record of optimizing application performance and web vitals
- Strong problem solving, system design, and collaborative agile leadership`
  },
  {
    id: 'sample-frontend-mid',
    title: 'Sarah Chen — Frontend Engineer (Good Base)',
    role: 'Frontend Engineer',
    text: `Sarah Chen
sarah.chen@techmail.io | +1 (415) 890-1234 | San Francisco, CA
linkedin.com/in/sarahchen-fe | github.com/sarahchen

SUMMARY
Frontend Engineer with 4 years of experience building scalable web applications with React, TypeScript, and modern CSS architecture. Passionate about component systems, performance, and accessibility.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript (ES6+), HTML5, CSS3, GraphQL
Frameworks & Libraries: React.js, Next.js, Redux Toolkit, Tailwind CSS, Jest, React Testing Library
Tools & Platforms: Git, Webpack, Vite, Docker, Figma, GitHub Actions, AWS S3

WORK EXPERIENCE
Frontend Engineer | CloudScale Systems | San Francisco, CA
March 2022 - Present
• Developed customer-facing dashboard features using React, TypeScript, and Tailwind CSS.
• Refactored legacy class components to modern React hooks, improving bundle size and rendering speed.
• Collaborated with UX designers to build an internal component library adopted across 4 product teams.
• Implemented unit and integration tests using Jest and React Testing Library to improve test coverage.
• Participated in bi-weekly code reviews and agile sprint ceremonies.

UI Developer | BrightMedia Labs | San Jose, CA
August 2020 - February 2022
• Implemented responsive marketing websites and web apps for enterprise clients.
• Integrated REST APIs and GraphQL queries to fetch and render dynamic catalog data.
• Optimized web asset delivery and core web vitals across desktop and mobile devices.
• Worked with project managers to translate client specifications into technical delivery roadmaps.

PROJECTS
DevBoard Metrics Dashboard | React, TypeScript, Tailwind, Chart.js
• Built an open-source analytics dashboard visualizing GitHub repository metrics.
• Deployed serverless architecture on Vercel with automated continuous integration.

EDUCATION
B.S. in Software Engineering | San Jose State University | 2016 - 2020`,
    jobDescription: `Lead Frontend Engineer

Looking for a Lead Frontend Engineer to drive our core web applications:
- Expert with React 18+, TypeScript, Next.js, and Tailwind CSS
- Experience architecting design systems and reusable component libraries
- Proven ability to optimize Core Web Vitals and Lighthouse scores
- CI/CD automation with GitHub Actions and Docker
- Strong leadership, mentoring, and cross-functional collaboration skills`
  }
];
