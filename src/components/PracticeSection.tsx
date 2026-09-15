import React from 'react';
import { PracticeProblem } from '../types';
import { MathRenderer } from './MathRenderer';
import { PencilLine, Eye, EyeOff } from 'lucide-react';

interface PracticeSectionProps {
  practice: PracticeProblem[];
  includeWorkSpace?: boolean;
  teacherVersion?: boolean;
}

export const PracticeSection: React.FC<PracticeSectionProps> = ({
  practice,
  includeWorkSpace = true,
  teacherVersion = false,
}) => {
  const [showSolutionsOnScreen, setShowSolutionsOnScreen] = React.useState<boolean>(false);

  if (!practice || practice.length === 0) return null;

  const difficultyLabels: Record<string, { label: string; badgeClass: string }> = {
    easy: {
      label: 'Хялбар түвшин',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 print:bg-stone-100 print:text-black print:border-black',
    },
    medium: {
      label: 'Дунд түвшин',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 print:bg-stone-100 print:text-black print:border-black',
    },
    hard: {
      label: 'Ахисан түвшин',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 print:bg-stone-100 print:text-black print:border-black',
    },
  };

  return (
    <section className="mb-8 print:mb-6" id="section-practice">
      <div className="flex items-center justify-between pb-2 mb-4 border-b-2 border-stone-800 print:border-black">
        <div className="flex items-center space-x-2">
          <PencilLine className="w-5 h-5 text-indigo-700 print:text-black no-print" />
          <h2 className="text-lg md:text-xl font-black tracking-tight text-stone-900 print:text-black uppercase">
            III. БИЕ ДААХ ДАСГАЛ БОДЛОГО
          </h2>
        </div>
        <div className="flex items-center space-x-2 no-print">
          <button
            type="button"
            onClick={() => setShowSolutionsOnScreen(!showSolutionsOnScreen)}
            className="text-xs px-2.5 py-1 rounded border border-stone-300 hover:bg-stone-100 flex items-center space-x-1 text-stone-700 transition-colors"
          >
            {showSolutionsOnScreen ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                <span>Бодолтыг нуух</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-stone-500" />
                <span>Шалгах / Бодолт харах</span>
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-stone-600 print:text-stone-700 mb-4 italic">
        Дараах бодлогуудыг бодолтын дэвтэр эсвэл доорх зайд шат дараалан гүйцэтгэнэ үү. (Хялбар $\rightarrow$ Дунд $\rightarrow$ Ахисан шатлалтай)
      </p>

      <div className="space-y-4 print:space-y-3.5">
        {practice.map((item) => {
          const diff = difficultyLabels[item.difficulty] || difficultyLabels.medium;
          const showSol = teacherVersion || showSolutionsOnScreen;

          return (
            <div
              key={item.id || item.number}
              className="avoid-break bg-white border border-stone-300 print:border-stone-800 rounded-lg p-3.5 md:p-4 shadow-xs print:shadow-none"
            >
              {/* Question header */}
              <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-stone-100 print:border-stone-400">
                <span className="font-extrabold text-sm md:text-base text-stone-950 print:text-black">
                  Дасгал {item.number}.
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${diff.badgeClass}`}
                >
                  {diff.label}
                </span>
              </div>

              {/* Question Text */}
              <div className="text-stone-900 print:text-black text-sm md:text-base font-normal leading-relaxed mb-2">
                <MathRenderer content={item.question} />
              </div>

              {/* Hint (screen only or subtle in print) */}
              {item.hint && !showSol && (
                <div className="text-xs text-stone-500 print:text-stone-600 italic mb-2">
                  <span className="font-medium not-italic">Зөвлөмж: </span>
                  <MathRenderer content={item.hint} className="inline" />
                </div>
              )}

              {/* Solution / Answer if teacher version or screen inspection enabled */}
              {showSol && (
                <div className="mt-2.5 p-2.5 bg-stone-50 border border-stone-300 print:border-black rounded text-xs md:text-sm">
                  <div className="font-bold text-stone-900 print:text-black mb-1">
                    Бодолт:
                  </div>
                  {item.solution && (
                    <div className="text-stone-800 print:text-black mb-1">
                      <MathRenderer content={item.solution} />
                    </div>
                  )}
                  <div className="font-semibold text-stone-900 print:text-black">
                    Хариу: <MathRenderer content={item.answer} className="inline" />
                  </div>
                </div>
              )}

              {/* Student Workspace for printing */}
              {includeWorkSpace && !showSol && (
                <div className="mt-3 pt-2 border-t border-dashed border-stone-200 print:border-stone-400">
                  <div className="text-[11px] font-semibold text-stone-400 print:text-stone-600 uppercase tracking-wider mb-1">
                    Бодолтын зай:
                  </div>
                  <div
                    className="workspace-grid rounded border border-stone-200 print:border-stone-400"
                    style={{ minHeight: `${(item.workSpaceLines || 3) * 23}px` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
