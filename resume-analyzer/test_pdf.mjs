import { jsPDF } from 'jspdf';
import fs from 'fs';

function generateTestPdf() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const margin = 40;
  const contentWidth = 532;
  const maxY = 750;
  let currentY = 45;

  const checkPageBreak = (neededHeight) => {
    if (currentY + neededHeight > maxY) {
      doc.addPage();
      currentY = 45;
    }
  };

  const drawSectionHeader = (title) => {
    checkPageBreak(30);
    currentY += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(title.toUpperCase(), margin, currentY);
    currentY += 4;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.75);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 12;
  };

  // Header: Candidate Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('ALEX RIVERA', 306, currentY, { align: 'center' });
  currentY += 16;

  // Contact Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text('alex.rivera@example.com  |  (555) 345-6789  |  Austin, TX  |  linkedin.com/in/alexriveradev', 306, currentY, { align: 'center' });
  currentY += 14;

  // Summary
  drawSectionHeader('Professional Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const summaryText = 'Results-driven Full Stack Developer with 3+ years of demonstrated experience in architecting and deploying scalable web applications using JavaScript, TypeScript, React.js, and Node.js. Proven track record of translating complex technical specifications into high-performance software solutions, optimizing code quality, and driving efficient Agile sprint deliveries.';
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(summaryLines, margin, currentY);
  currentY += summaryLines.length * 12.5;

  // Skills
  drawSectionHeader('Technical Skills');
  const skillCategories = [
    { label: 'Languages & Frameworks: ', val: 'JavaScript, TypeScript, React.js, Node.js, HTML5, CSS3, SQL' },
    { label: 'Tools & Platforms: ', val: 'Git, GitHub, Docker, MongoDB, Postman, Jira' },
    { label: 'Competencies: ', val: 'Agile/Scrum, RESTful APIs, Frontend Architecture, System Design' }
  ];

  for (const cat of skillCategories) {
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(cat.label, margin, currentY);
    const labelWidth = doc.getTextWidth(cat.label);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const valLines = doc.splitTextToSize(cat.val, contentWidth - labelWidth);
    doc.text(valLines, margin + labelWidth, currentY);
    currentY += valLines.length * 12.5;
  }

  // Work Experience
  drawSectionHeader('Work Experience');
  const experiences = [
    {
      role: 'Software Developer',
      company: 'NexaTech Solutions',
      location: 'Austin, TX',
      dates: 'June 2022 - Present',
      bullets: [
        'Architected and maintained responsive React web applications, enhancing frontend responsiveness and user experience. [Add measurable result if available, e.g. % improvement or scale]',
        'Identified and resolved complex frontend defects and modernized core UI components to maintain high application uptime.',
        'Collaborated with cross-functional engineering teams to design and integrate robust RESTful backend APIs and database queries.',
        'Actively contributed to Agile Scrum ceremonies including sprint planning, daily standups, and retrospective reviews.',
        'Executed comprehensive unit and integration testing workflows to ensure zero-regression deployments.'
      ]
    },
    {
      role: 'Junior Web Developer',
      company: 'Apex Digital Studio',
      location: 'Dallas, TX',
      dates: 'January 2021 - May 2022',
      bullets: [
        'Developed semantic, high-performance web pages utilizing HTML, CSS and JavaScript with emphasis on responsive design and cross-browser reliability.',
        'Independently delivered sprint user stories and feature tickets prioritized in Jira, meeting strict milestone deadlines.',
        'Implemented mobile-first responsive stylesheets and intuitive UX layouts across diverse viewport sizes.',
        'Partnered with multidisciplinary stakeholders to consistently ship production deliverables within scheduled deadlines.'
      ]
    }
  ];

  for (const exp of experiences) {
    checkPageBreak(35);
    // Role & Company
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${exp.role}  —  ${exp.company}`, margin, currentY);

    // Dates (aligned right)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(exp.dates, margin + contentWidth, currentY, { align: 'right' });
    currentY += 13;

    // Bullets
    for (const b of exp.bullets) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const bulletLines = doc.splitTextToSize(b, contentWidth - 14);
      checkPageBreak(bulletLines.length * 12.5 + 4);

      // Bullet dot
      doc.text('•', margin + 2, currentY);
      // Bullet text
      doc.text(bulletLines, margin + 12, currentY);
      currentY += bulletLines.length * 12.5 + 2;
    }
    currentY += 4;
  }

  // Education
  drawSectionHeader('Education');
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Bachelor of Science in Computer Science', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('2017 - 2021', margin + contentWidth, currentY, { align: 'right' });
  currentY += 12;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('University of Texas at Austin', margin, currentY);
  currentY += 16;

  const pdfOutput = doc.output('arraybuffer');
  fs.writeFileSync('optimized-resume.pdf', Buffer.from(pdfOutput));
  console.log('PDF successfully generated, bytes:', pdfOutput.byteLength, 'pages:', doc.getNumberOfPages());
}

generateTestPdf();
