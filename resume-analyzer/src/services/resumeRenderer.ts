import { ParsedResume } from '@/types/resume';
import { jsPDF } from 'jspdf';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

/**
 * Generates a clean text / Markdown representation of the resume
 */
export function generateMarkdownResume(resume: ParsedResume): string {
  const parts: string[] = [];

  parts.push(resume.name);
  const contactParts = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.github
  ].filter(Boolean);
  parts.push(contactParts.join('  |  '));
  parts.push('');

  if (resume.summary) {
    parts.push('PROFESSIONAL SUMMARY');
    parts.push(resume.summary);
    parts.push('');
  }

  if (resume.skills.all.length > 0) {
    parts.push('TECHNICAL SKILLS');
    if (resume.skills.technical.length > 0) {
      parts.push(`Languages & Frameworks: ${resume.skills.technical.join(', ')}`);
    }
    if (resume.skills.tools.length > 0) {
      parts.push(`Tools & Platforms: ${resume.skills.tools.join(', ')}`);
    }
    if (resume.skills.soft.length > 0) {
      parts.push(`Competencies: ${resume.skills.soft.join(', ')}`);
    }
    if (resume.skills.technical.length === 0 && resume.skills.tools.length === 0) {
      parts.push(resume.skills.all.join(', '));
    }
    parts.push('');
  }

  if (resume.experience.length > 0) {
    parts.push('WORK EXPERIENCE');
    for (const exp of resume.experience) {
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
      parts.push(`${exp.role} — ${exp.company}${dates ? ` (${dates})` : ''}`);
      for (const bullet of exp.bullets) {
        parts.push(`• ${bullet}`);
      }
      parts.push('');
    }
  }

  if (resume.projects.length > 0) {
    parts.push('PROJECTS');
    for (const proj of resume.projects) {
      const stack = proj.techStack.length > 0 ? ` [${proj.techStack.join(', ')}]` : '';
      parts.push(`${proj.name}${stack}`);
      for (const bullet of proj.bullets) {
        parts.push(`• ${bullet}`);
      }
      parts.push('');
    }
  }

  if (resume.education.length > 0) {
    parts.push('EDUCATION');
    for (const edu of resume.education) {
      const dates = edu.endDate ? ` (${edu.endDate})` : '';
      parts.push(`${edu.degree}, ${edu.institution}${dates}`);
    }
    parts.push('');
  }

  if (resume.certifications.length > 0) {
    parts.push('CERTIFICATIONS');
    for (const cert of resume.certifications) {
      parts.push(`• ${cert}`);
    }
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Generates and downloads a real, searchable/selectable PDF using jsPDF with proper pagination
 */
export function downloadPdfResume(resume: ParsedResume): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const margin = 40;
  const contentWidth = 532; // 612 - 80
  const maxY = 750; // page break threshold
  let currentY = 45;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > maxY) {
      doc.addPage();
      currentY = 45;
    }
  };

  const drawSectionHeader = (title: string) => {
    checkPageBreak(30);
    currentY += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59); // dark slate
    doc.text(title.toUpperCase(), margin, currentY);
    currentY += 4;
    doc.setDrawColor(203, 213, 225); // light border
    doc.setLineWidth(0.75);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 11;
  };

  // 1. Header: Candidate Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text((resume.name || 'CANDIDATE').toUpperCase(), 306, currentY, { align: 'center' });
  currentY += 16;

  // 2. Contact Information
  const contactText = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.github
  ].filter(Boolean).join('  |  ');

  if (contactText) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(contactText, 306, currentY, { align: 'center' });
    currentY += 12;
  }

  // 3. Professional Summary (only if exists)
  if (resume.summary && resume.summary.trim()) {
    drawSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(resume.summary.trim(), contentWidth);
    checkPageBreak(summaryLines.length * 12.5);
    doc.text(summaryLines, margin, currentY);
    currentY += summaryLines.length * 12.5 + 4;
  }

  // 4. Skills (only if exists)
  if (resume.skills.all.length > 0) {
    drawSectionHeader('Technical Skills');
    const skillCategories: Array<{ label: string; items: string[] }> = [];

    if (resume.skills.technical.length > 0) {
      skillCategories.push({ label: 'Languages & Frameworks: ', items: resume.skills.technical });
    }
    if (resume.skills.tools.length > 0) {
      skillCategories.push({ label: 'Tools & Platforms: ', items: resume.skills.tools });
    }
    if (resume.skills.soft.length > 0) {
      skillCategories.push({ label: 'Competencies: ', items: resume.skills.soft });
    }
    if (skillCategories.length === 0) {
      skillCategories.push({ label: 'Skills: ', items: resume.skills.all });
    }

    for (const cat of skillCategories) {
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(cat.label, margin, currentY);
      const labelWidth = doc.getTextWidth(cat.label);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const textVal = cat.items.join(', ');
      const valLines = doc.splitTextToSize(textVal, contentWidth - labelWidth);
      doc.text(valLines, margin + labelWidth, currentY);
      currentY += valLines.length * 12.5 + 2;
    }
  }

  // 5. Work Experience (only if exists)
  if (resume.experience.length > 0) {
    drawSectionHeader('Work Experience');
    for (const exp of resume.experience) {
      checkPageBreak(35);
      // Role & Company
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      const titleLine = `${exp.role}${exp.company ? `  —  ${exp.company}` : ''}`;
      doc.text(titleLine, margin, currentY);

      // Dates
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
      if (dates) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text(dates, margin + contentWidth, currentY, { align: 'right' });
      }
      currentY += 13;

      // Bullets
      for (const bullet of exp.bullets) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const bulletLines = doc.splitTextToSize(bullet, contentWidth - 14);
        checkPageBreak(bulletLines.length * 12.5 + 4);

        // Bullet dot
        doc.text('•', margin + 2, currentY);
        // Bullet text lines
        doc.text(bulletLines, margin + 12, currentY);
        currentY += bulletLines.length * 12.5 + 2;
      }
      currentY += 4;
    }
  }

  // 6. Projects (only if exists)
  if (resume.projects.length > 0) {
    drawSectionHeader('Projects');
    for (const proj of resume.projects) {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(proj.name, margin, currentY);

      if (proj.techStack.length > 0) {
        const stackText = `[${proj.techStack.join(', ')}]`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        const stackLines = doc.splitTextToSize(stackText, contentWidth - doc.getTextWidth(proj.name) - 10);
        doc.text(stackLines, margin + contentWidth, currentY, { align: 'right' });
      }
      currentY += 13;

      for (const bullet of proj.bullets) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const bulletLines = doc.splitTextToSize(bullet, contentWidth - 14);
        checkPageBreak(bulletLines.length * 12.5 + 4);

        doc.text('•', margin + 2, currentY);
        doc.text(bulletLines, margin + 12, currentY);
        currentY += bulletLines.length * 12.5 + 2;
      }
      currentY += 4;
    }
  }

  // 7. Education (only if exists)
  if (resume.education.length > 0) {
    drawSectionHeader('Education');
    for (const edu of resume.education) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.degree, margin, currentY);

      if (edu.endDate) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(100, 116, 139);
        doc.text(edu.endDate, margin + contentWidth, currentY, { align: 'right' });
      }
      currentY += 12;

      if (edu.institution) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(edu.institution, margin, currentY);
        currentY += 14;
      }
    }
  }

  // 8. Certifications (only if exists)
  if (resume.certifications.length > 0) {
    drawSectionHeader('Certifications');
    for (const cert of resume.certifications) {
      checkPageBreak(16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`•  ${cert}`, margin + 2, currentY);
      currentY += 14;
    }
  }

  // Save with the exact requested filename: optimized-resume.pdf
  doc.save('optimized-resume.pdf');
}

/**
 * Generates and downloads a real .docx Microsoft Word file
 */
export async function downloadDocxResume(resume: ParsedResume): Promise<void> {
  const docParagraphs: Paragraph[] = [];

  // Header: Candidate Name
  docParagraphs.push(
    new Paragraph({
      text: (resume.name || 'Candidate').toUpperCase(),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    })
  );

  // Contact details
  const contactText = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.github
  ].filter(Boolean).join('  |  ');

  if (contactText) {
    docParagraphs.push(
      new Paragraph({
        text: contactText,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );
  }

  const addSectionHeader = (title: string) => {
    docParagraphs.push(
      new Paragraph({
        text: title.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 80 }
      })
    );
  };

  // Summary
  if (resume.summary && resume.summary.trim()) {
    addSectionHeader('Professional Summary');
    docParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: resume.summary.trim(), size: 21 })],
        spacing: { after: 140 }
      })
    );
  }

  // Skills
  if (resume.skills.all.length > 0) {
    addSectionHeader('Technical Skills');
    if (resume.skills.technical.length > 0) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Languages & Frameworks: ', bold: true, size: 21 }),
            new TextRun({ text: resume.skills.technical.join(', '), size: 21 })
          ],
          bullet: { level: 0 },
          spacing: { after: 40 }
        })
      );
    }
    if (resume.skills.tools.length > 0) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Tools & Platforms: ', bold: true, size: 21 }),
            new TextRun({ text: resume.skills.tools.join(', '), size: 21 })
          ],
          bullet: { level: 0 },
          spacing: { after: 40 }
        })
      );
    }
    if (resume.skills.soft.length > 0) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Competencies: ', bold: true, size: 21 }),
            new TextRun({ text: resume.skills.soft.join(', '), size: 21 })
          ],
          bullet: { level: 0 },
          spacing: { after: 40 }
        })
      );
    }
  }

  // Experience
  if (resume.experience.length > 0) {
    addSectionHeader('Work Experience');
    for (const exp of resume.experience) {
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role, bold: true, size: 22 }),
            new TextRun({ text: ` | ${exp.company}`, italics: true, size: 21 }),
            new TextRun({ text: dates ? `  (${dates})` : '', size: 20, color: '666666' })
          ],
          spacing: { before: 100, after: 50 }
        })
      );

      for (const bullet of exp.bullets) {
        docParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: bullet, size: 20.5 })],
            bullet: { level: 0 },
            spacing: { after: 35 }
          })
        );
      }
    }
  }

  // Projects
  if (resume.projects.length > 0) {
    addSectionHeader('Projects');
    for (const proj of resume.projects) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.name, bold: true, size: 21 }),
            new TextRun({
              text: proj.techStack.length > 0 ? `  [${proj.techStack.join(', ')}]` : '',
              italics: true,
              size: 20,
              color: '555555'
            })
          ],
          spacing: { before: 90, after: 50 }
        })
      );

      for (const bullet of proj.bullets) {
        docParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: bullet, size: 20.5 })],
            bullet: { level: 0 },
            spacing: { after: 35 }
          })
        );
      }
    }
  }

  // Education
  if (resume.education.length > 0) {
    addSectionHeader('Education');
    for (const edu of resume.education) {
      docParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 21 }),
            new TextRun({ text: `, ${edu.institution}`, size: 21 }),
            new TextRun({ text: edu.endDate ? ` (${edu.endDate})` : '', size: 20, color: '666666' })
          ],
          bullet: { level: 0 },
          spacing: { after: 50 }
        })
      );
    }
  }

  // Certifications
  if (resume.certifications.length > 0) {
    addSectionHeader('Certifications');
    for (const cert of resume.certifications) {
      docParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: cert, size: 20.5 })],
          bullet: { level: 0 },
          spacing: { after: 35 }
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 }
          }
        },
        children: docParagraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'optimized-resume.docx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
