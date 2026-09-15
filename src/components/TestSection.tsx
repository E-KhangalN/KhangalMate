import React from 'react';
import { TestPackage } from '../types';
import { MathRenderer } from './MathRenderer';
import { PrintHeader } from './PrintHeader';
import { Award } from 'lucide-react';

interface TestSectionProps {
  test: TestPackage;
  grade: number;
  topicTitle: string;
  category?: string;
  isFirstPrintedSection?: boolean;
  includeWorkSpace?: boolean;
  teacherVersion?: boolean;
}

export const TestSection: React.FC<TestSectionProps> = ({
  test,
  grade,
  topicTitle,
  category,
  isFirstPrintedSection = false,
  includeWorkSpace = true,
  teacherVersion = false,
}) => {
  if (!test || !test.questions || test.questions.length === 0) return null;

  return (
    <section
      className={`mb-10 ${isFirstPrintedSection ? '' : 'page-break-before'}`}
      id={`section-test-${test.testNumber}`}
    >
      {/* Header specifically formatted for A4 test print */}
      <PrintHeader
        grade={grade}
        topicTitle={topicTitle}
        category={category}
        isTest={true}
        testNumber={test.testNumber}
        testTitle={test.title}
        totalPoints={test.totalPoints}
        teacherVersion={teacherVersion}
      />

      {/* Test Meta and Target skills */}
      <div className="mb-4 pb-2 border-b border-stone-300 print:border-stone-500 flex items-center justify-between text-xs md:text-sm text-stone-600 print:text-black">
        <div>
          <span className="font-bold text-stone-800 print:text-black">Шалгах зорилго: </span>
          <span>{test.targetSkills}</span>
        </div>
        <div className="font-semibold text-stone-800 print:text-black">
          Нийт оноо: <span className="underline font-bold">{test.totalPoints} оноо</span>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4 print:space-y-3.5">
        {test.questions.map((q) => (
          <div
            key={q.id || q.number}
            className="avoid-break bg-white border border-stone-300 print:border-stone-800 rounded-lg p-3.5 md:p-4 shadow-xs print:shadow-none"
          >
            {/* Question line with points */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-baseline space-x-1.5">
                <span className="font-extrabold text-sm md:text-base text-stone-950 print:text-black">
                  {q.number}.
                </span>
                <div className="text-stone-900 print:text-black text-sm md:text-base leading-relaxed">
                  <MathRenderer content={q.question} />
                </div>
              </div>

              <div className="shrink-0 text-xs font-bold text-stone-600 print:text-black bg-stone-100 print:bg-stone-200 border border-stone-300 print:border-stone-600 px-2 py-0.5 rounded">
                [{q.points} оноо]
              </div>
            </div>

            {/* Answer / Solution for teacher version */}
            {teacherVersion && (
              <div className="mt-2.5 p-2.5 bg-stone-50 border border-stone-300 print:border-black rounded text-xs md:text-sm">
                <div className="font-bold text-stone-900 print:text-black mb-1">
                  [Зөв хариу]: <MathRenderer content={q.answer} className="inline font-medium" />
                </div>
                {q.solution && (
                  <div className="text-stone-700 print:text-stone-900">
                    <span className="font-semibold">Бодолтын тайлбар: </span>
                    <MathRenderer content={q.solution} className="inline" />
                  </div>
                )}
              </div>
            )}

            {/* Student workspace on print */}
            {includeWorkSpace && !teacherVersion && (
              <div className="mt-3 pt-2 border-t border-dashed border-stone-200 print:border-stone-400">
                <div className="text-[11px] font-semibold text-stone-400 print:text-stone-600 uppercase tracking-wider mb-1">
                  Бодолтын зай:
                </div>
                <div
                  className="workspace-grid rounded border border-stone-200 print:border-stone-400"
                  style={{ minHeight: `${(q.workSpaceLines || 3) * 23}px` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
