import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Resume Evaluator & ATS Optimizer | ResumeBuilder Pro',
  description: 'Evaluate your resume with real ATS scoring, detect critical issues, match against target job descriptions, and generate optimized resume versions without fabricating information.',
  keywords: 'resume evaluator, ATS resume checker, resume score, job match score, ATS optimization, resume builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
